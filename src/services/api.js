import axios from 'axios';
import { supabase } from './supabaseClient';

// Base RPC URL for Quai Network (using a public endpoint or proxy commonly used)
// Note: In production, this should be in an environment variable.
// Using Colosseum Testnet or Mainnet RPC if available. 
// Based on docs, usually https://rpc.quai.network or similar. 
// For this hackathon project, we will use a known reliable public endpoint for Quai.
// If specific endpoints are needed, the user can configure them in .env.

const QUAI_RPC_URL = 'https://rpc.quai.network/cyprus1'; // Using Cyprus-1 Zone for Mainnet

const api = axios.create({
    baseURL: QUAI_RPC_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper for JSON-RPC calls
const rpcCall = async (method, params = []) => {
    try {
        const response = await api.post('', {
            jsonrpc: '2.0',
            method,
            params,
            id: 1,
        });

        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        return response.data.result;
    } catch (error) {
        console.error(`RPC Error [${method}]:`, error);
        throw error;
    }
};

export const fetchBlockNumber = async () => {
    const result = await rpcCall('quai_blockNumber');
    return parseInt(result, 16);
};

export const fetchGasPrice = async () => {
    const result = await rpcCall('quai_gasPrice');
    return parseInt(result, 16); // Returns value in Wei
};

export const fetchBlockByNumber = async (blockNumberHex, fullTransactions = false) => {
    return await rpcCall('quai_getBlockByNumber', [blockNumberHex, fullTransactions]);
};



const storeBlocksInSupabase = async (blocks) => {
    if (!blocks || blocks.length === 0) {
        console.log('⚠️ No blocks to store in Supabase');
        return;
    }

    console.log(`📦 Attempting to store ${blocks.length} blocks in Supabase...`);

    // DEBUG: Log first block structure
    if (blocks.length > 0) {
        console.log('🔍 First block sample:', {
            number: blocks[0]?.number,
            headerNumber: blocks[0]?.header?.number,
            hash: blocks[0]?.hash,
            timestamp: blocks[0]?.timestamp,
            txCount: blocks[0]?.transactions?.length
        });
    }

    // Prepare Blocks Data - MATCHING YOUR SCHEMA
    // Quai Network returns blocks with nested header structure
    const blocksRows = blocks.filter(b => {
        const blockNumber = b?.header?.number?.[0] || b?.number;
        const isValid = b && blockNumber;
        if (!isValid) {
            console.warn('⚠️ Filtering out invalid block - no number found');
        }
        return isValid;
    }).map(b => {
        // Quai uses array format for numbers: header.number[0]
        const blockNumber = b.header?.number?.[0] || b.number;
        const blockHash = b.hash;
        const blockTimestamp = b.header?.time || b.timestamp;

        let timestamp;
        try {
            // Quai timestamp might already be in seconds
            const ts = typeof blockTimestamp === 'string' ? parseInt(blockTimestamp, 16) : blockTimestamp;
            timestamp = new Date(ts * 1000).toISOString();
        } catch (e) {
            timestamp = new Date().toISOString(); // Fallback to current time
        }

        return {
            block_number: typeof blockNumber === 'string' ? parseInt(blockNumber, 16) : blockNumber,
            block_hash: blockHash,
            timestamp: timestamp,
            tx_count: b.transactions ? b.transactions.length : 0
        };
    });

    console.log(`✅ Prepared ${blocksRows.length} block rows for insertion`);

    // DEDUPLICATE: Quai Network has multiple shards, same block_number can appear multiple times
    const uniqueBlocksMap = new Map();
    blocksRows.forEach(block => {
        if (!uniqueBlocksMap.has(block.block_number)) {
            uniqueBlocksMap.set(block.block_number, block);
        }
    });
    const uniqueBlocks = Array.from(uniqueBlocksMap.values());
    console.log(`🔧 Deduplicated to ${uniqueBlocks.length} unique blocks`);

    // Prepare Transactions Data - MATCHING YOUR SCHEMA
    let txRows = [];
    blocks.forEach(b => {
        if (b && b.transactions && b.transactions.length > 0) {
            const blockNumber = b.header?.number?.[0] || b.number;

            if (!blockNumber) {
                console.warn('⚠️ Skipping block transactions - no block number');
                return;
            }

            const parsedBlockNumber = typeof blockNumber === 'string' ? parseInt(blockNumber, 16) : blockNumber;

            if (isNaN(parsedBlockNumber)) {
                console.warn('⚠️ Skipping block with invalid number:', blockNumber);
                return;
            }

            const blockTimestamp = b.header?.time || b.timestamp;
            let timestamp;
            try {
                const ts = typeof blockTimestamp === 'string' ? parseInt(blockTimestamp, 16) : blockTimestamp;
                timestamp = new Date(ts * 1000).toISOString();
            } catch (e) {
                timestamp = new Date().toISOString();
            }

            const blockTxs = b.transactions
                .filter(tx => tx && tx.hash)
                .map(tx => ({
                    tx_hash: tx.hash,
                    block_number: parsedBlockNumber,
                    from_address: tx.from || null,
                    to_address: tx.to || null,
                    value: tx.value ? (parseInt(tx.value, 16) / 1e18) : 0,
                    timestamp: timestamp
                }))
                .filter(tx => tx.block_number && !isNaN(tx.block_number));

            txRows = [...txRows, ...blockTxs];
        }
    });

    console.log(`✅ Prepared ${txRows.length} transaction rows for insertion`);

    try {
        // STEP 1: Insert Blocks FIRST
        console.log('🔄 Inserting blocks into Supabase...');
        const { data: blockData, error: blockError } = await supabase
            .from('blocks')
            .upsert(uniqueBlocks, { onConflict: 'block_number' });

        if (blockError) {
            console.error('❌ Supabase Block Error:', blockError);
            return; // Don't try to insert transactions if blocks failed
        } else {
            console.log(`✅ Successfully stored ${uniqueBlocks.length} blocks!`);
        }

        // STEP 2: Insert Transactions ONLY if blocks succeeded
        if (txRows.length > 0) {
            // Filter transactions to only include those with blocks that were successfully inserted
            const successfulBlockNumbers = new Set(uniqueBlocks.map(b => b.block_number));
            const validTxs = txRows.filter(tx => successfulBlockNumbers.has(tx.block_number));

            console.log(`🔄 Inserting ${validTxs.length} transactions into Supabase...`);
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .upsert(validTxs, { onConflict: 'tx_hash' });

            if (txError) {
                console.error('❌ Supabase Tx Error:', txError);
            } else {
                console.log(`✅ Successfully stored ${validTxs.length} transactions!`);
            }
        }
    } catch (err) {
        console.error('❌ Supabase Ingest Error:', err);
    }
};

// Start fetching a few recent blocks to populate the dashboard
export const fetchRecentBlocks = async (count = 5) => {
    try {
        const latestBlockHex = await rpcCall('quai_blockNumber');
        const latestBlockNum = parseInt(latestBlockHex, 16);

        const promises = [];
        for (let i = 0; i < count; i++) {
            const blockNum = latestBlockNum - i;
            const blockHex = '0x' + blockNum.toString(16);
            promises.push(fetchBlockByNumber(blockHex, true));
        }

        const blocks = await Promise.all(promises);

        // AUTO-ARCHIVE: Store fetched blocks in Supabase asynchronously
        storeBlocksInSupabase(blocks);

        return blocks;
    } catch (error) {
        console.error("Error fetching recent blocks:", error);
        return [];
    }
};

// Format Wei to Gwei
export const weiToGwei = (wei) => {
    return (wei / 1000000000).toFixed(2);
};
