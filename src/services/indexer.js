import { quaiService } from './quai'
import { dbRequest } from './supabase'

export const startIndexer = () => {
    console.log('🚀 Starting Quai Indexer...')

    let lastBlock = 0

    const index = async () => {
        try {
            const currentBlockNumber = await quaiService.getBlockNumber()

            if (currentBlockNumber > lastBlock) {
                console.log(`📦 New block found: ${currentBlockNumber}`)

                // Index the last few blocks if we fall behind
                const start = lastBlock === 0 ? currentBlockNumber : lastBlock + 1
                for (let i = start; i <= currentBlockNumber; i++) {
                    const block = await quaiService.getBlock(i)

                    if (!block) continue

                    const blockData = {
                        block_number: block.number,
                        block_hash: block.hash,
                        timestamp: new Date(block.timestamp * 1000).toISOString(),
                        tx_count: block.transactions.length,
                        miner: block.miner || '0x0000000000000000000000000000000000000000',
                        gas_used: block.gasUsed ? parseInt(block.gasUsed.toString()) : 0
                    }

                    await dbRequest.saveBlock(blockData)

                    // Index transactions
                    for (const tx of block.transactions) {
                        const txDetails = typeof tx === 'string' ? await quaiService.getTransaction(tx) : tx

                        if (!txDetails) continue

                        const txData = {
                            tx_hash: txDetails.hash,
                            block_number: block.number,
                            from_address: txDetails.from,
                            to_address: txDetails.to,
                            value: parseFloat(quaiService.formatEther ? quaiService.formatEther(txDetails.value) : '0'),
                            timestamp: blockData.timestamp,
                            gas_price: txDetails.gasPrice ? parseInt(txDetails.gasPrice.toString()) : 0,
                            status: 1 // Assuming success for now
                        }

                        await dbRequest.saveTransaction(txData)
                    }
                }

                lastBlock = currentBlockNumber
            }
        } catch (err) {
            console.error('❌ Indexer error:', err)
        }
    }

    // Poll every 5 seconds
    const interval = setInterval(index, 5000)
    return () => clearInterval(interval)
}
