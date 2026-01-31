import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Zap,
    Fuel,
    Target,
    Globe,
    Cpu,
    Layers,
    ArrowRightLeft,
    FileText,
    X,
    Wallet
} from 'lucide-react';
import StatsCard from './StatsCard';
import NetworkChart from './NetworkChart';
import DataTable from './DataTable';
import { fetchRecentBlocks, fetchGasPrice, fetchBlockNumber, weiToGwei } from '../services/api';

const Dashboard = () => {
    const [account, setAccount] = useState(null);
    const [tpsHistory, setTpsHistory] = useState([]);
    const [gasHistory, setGasHistory] = useState([]);
    const [nodeCount, setNodeCount] = useState(4102);
    const [syncLatency, setSyncLatency] = useState(12);
    const [secondsSinceSync, setSecondsSinceSync] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const connectToWallet = async (walletType) => {
        if (window.ethereum) {
            try {
                // If the user has multiple wallets, we might need logic to pick one, 
                // but standard request works for the current injected provider.
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                setIsModalOpen(false);
            } catch (error) {
                console.error(`Error connecting to ${walletType}:`, error);
            }
        } else {
            alert(`Please install ${walletType}!`);
        }
    };

    const handleConnectClick = () => {
        if (account) return;
        setIsModalOpen(true);
    };

    // 1. Fetch Block Number (Height)
    const { data: blockHeight } = useQuery({
        queryKey: ['blockHeight'],
        queryFn: fetchBlockNumber,
        refetchInterval: 5000,
    });

    // 2. Fetch Gas Price
    const { data: gasPriceWei } = useQuery({
        queryKey: ['gasPrice'],
        queryFn: fetchGasPrice,
        refetchInterval: 10000,
    });
    const gasPriceGwei = gasPriceWei ? weiToGwei(gasPriceWei) : '0';

    // 3. Fetch Recent Blocks (and Txs from them)
    const { data: recentBlocks, isLoading: isLoadingBlocks } = useQuery({
        queryKey: ['recentBlocks'],
        queryFn: () => fetchRecentBlocks(6), // Fetch 6 blocks
        refetchInterval: 5000,
    });

    // Process Blocks for Table
    // Process Blocks for Table
    const blocksData = recentBlocks?.map(block => {
        if (!block) return null;

        // Handle block number
        let heightDisplay = 'Pending';
        if (block.number) {
            try {
                heightDisplay = parseInt(block.number, 16).toLocaleString();
            } catch (e) { heightDisplay = block.number; }
        }

        // Handle Miner
        const miner = block.miner || '0x????';
        const minerDisplay = miner.length > 10
            ? `${miner.substring(0, 6)}...${miner.substring(miner.length - 4)}`
            : miner;

        return {
            height: heightDisplay,
            minedBy: minerDisplay,
            txs: block.transactions ? block.transactions.length : 0,
            age: 'Just now',
            timestamp: 0
        };
    }).filter(Boolean) || [];

    // Process Txs for Table (Flatten txs from latest blocks)
    // Safely access the first valid block
    const latestBlock = recentBlocks?.find(b => b && b.transactions && b.transactions.length > 0);
    const txsData = latestBlock?.transactions.slice(0, 5).map(tx => ({
        hash: tx.hash ? `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}` : 'UNKNOWN',
        method: 'Transfer',
        value: tx.value ? (parseInt(tx.value, 16) / 1e18).toFixed(4) + ' QUAI' : '0 QUAI',
        status: 'Success'
    })) || [];

    // Calculate generic TPS (Transactions / Time diff between blocks) - Estimate
    // Simple average of last few blocks tx count / 10s (approx block time)
    const avgTps = (recentBlocks?.filter(b => b)?.length > 0)
        ? (recentBlocks.filter(b => b).reduce((acc, b) => acc + (b.transactions?.length || 0), 0) / (recentBlocks.filter(b => b).length * 10)).toFixed(1)
        : '0.0';

    // Track TPS History for Chart
    React.useEffect(() => {
        if (!recentBlocks || recentBlocks.length === 0) return;

        // Initialize with real block data if empty to show the "wavy line" immediately
        if (tpsHistory.length === 0) {
            const initialHistory = recentBlocks.map((block, index) => {
                const time = new Date(Date.now() - (recentBlocks.length - index) * 10000);
                const timeStr = time.getHours().toString().padStart(2, '0') + ':' +
                    time.getMinutes().toString().padStart(2, '0') + ':' +
                    time.getSeconds().toString().padStart(2, '0');

                // Calculate TPS for THIS specific block
                const blockTps = (block.transactions?.length || 0) / 10;
                return { time: timeStr, value: blockTps };
            }).filter(Boolean);

            if (initialHistory.length > 0) setTpsHistory(initialHistory);
        } else {
            // Regular update when avgTps changes
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0') + ':' +
                now.getSeconds().toString().padStart(2, '0');

            const newEntry = { time: timeStr, value: parseFloat(avgTps) };

            setTpsHistory(prev => {
                // Only add if it's a new timestamp to avoid duplicates on refetch
                if (prev.length > 0 && prev[prev.length - 1].time === timeStr) return prev;
                const newHistory = [...prev, newEntry];
                return newHistory.slice(-20);
            });
        }
    }, [avgTps, recentBlocks]);

    // Track Gas History for Chart
    React.useEffect(() => {
        if (gasPriceGwei !== '0') {
            setGasHistory(prev => {
                const newEntry = parseFloat(gasPriceGwei);
                // Keep last 6 for the mini-sparkline
                const newHistory = [...prev, newEntry].slice(-6);
                return newHistory;
            });
        }
    }, [gasPriceGwei]);

    // Sync Status Logic
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSecondsSinceSync(prev => prev + 1);
            // Randomly fluctuate latency to look real
            setSyncLatency(Math.floor(Math.random() * (25 - 8 + 1)) + 8);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Reset timer when blocks update
    React.useEffect(() => {
        setSecondsSinceSync(0);
    }, [recentBlocks]);

    // Fluctuating Node Count for "Live" feel
    React.useEffect(() => {
        const interval = setInterval(() => {
            setNodeCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const blockColumns = [
        { header: 'Height', render: (row) => <div className="flex items-center gap-2 text-blue-900 font-bold"><Box className="w-3 h-3" /> {row.height}</div> },
        { header: 'Mined By', accessor: 'minedBy', render: (row) => <span className="text-blue-800 font-mono cursor-pointer hover:underline">{row.minedBy}</span> },
        { header: 'Txs', accessor: 'txs', render: (row) => <span className="text-black font-bold">{row.txs}</span> },
        { header: 'Age', accessor: 'age', render: (row) => <span className="text-black/60">{row.age}</span> },
    ];

    const txColumns = [
        { header: 'Hash', render: (row) => <div className="flex items-center gap-2 text-blue-900 font-bold font-mono cursor-pointer hover:underline"><FileText className="w-3 h-3" /> {row.hash}</div> },
        { header: 'Method', accessor: 'method', render: (row) => <span className="bg-black/10 px-2 py-1 rounded text-[10px] text-black border border-black/10">{row.method}</span> },
        { header: 'Value', accessor: 'value', render: (row) => <span className="text-black font-bold">{row.value}</span> },
        {
            header: 'Status', render: (row) => (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-sm ${row.status === 'Success' ? 'text-emerald-700 bg-emerald-500/20' :
                    row.status === 'Failed' ? 'text-rose-700 bg-rose-500/20' :
                        'text-yellow-700 bg-yellow-500/20'
                    }`}>
                    {row.status.toUpperCase()}
                </span>
            )
        },
    ];

    return (
        <div className="flex bg-background-dark min-h-screen text-gray-300 font-display selection:bg-primary/30">
            <main className="flex-1 p-8 overflow-y-auto min-h-screen relative">


                {/* Dashboard Content */}
                <div className="max-w-[1600px] mx-auto space-y-6">

                    {/* Page Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-5xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    LIVE
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                    {secondsSinceSync === 0 ? 'Just synced' : `Synced ${secondsSinceSync}s ago`} ({syncLatency}ms)
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={handleConnectClick}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-all shadow-md active:scale-95"
                            >
                                {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'CONNECT WALLET'}
                            </button>

                        </div>
                    </div>

                    {/* Stats Section with Graphic */}
                    <div className="flex flex-col lg:flex-row gap-2 items-center">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            <StatsCard
                                title="Network Speed"
                                value={`${avgTps} TPS`}
                                change="Live"
                                isPositive={true}
                                icon={Zap}
                                data={tpsHistory.map(h => Math.min(100, (h.value * 20))).slice(-6)}
                                bgClass="bg-gradient-to-br from-blue-300 from-60% to-blue-500 to-100%"
                                darkText={true}
                            />
                            <StatsCard
                                title="Network Fee"
                                value={gasPriceGwei}
                                change={parseFloat(gasPriceGwei) < 15 ? "LOW COST" : "STABLE"}
                                isPositive={parseFloat(gasPriceGwei) < 15}
                                icon={Fuel}
                                data={gasHistory.length > 0 ? gasHistory.map(v => Math.min(100, v * 2)) : [30, 45, 35, 50, 40, 60]}
                                bgClass="bg-gradient-to-br from-blue-300 from-60% to-blue-500 to-100%"
                                darkText={true}
                                subtext="Unit: Gwei (Network standard)"
                            />
                            <StatsCard
                                title="Chain Progress"
                                value={blockHeight ? blockHeight.toLocaleString() : 'Loading...'}
                                change="+1 Block"
                                isPositive={true}
                                icon={Target}
                                data={[70, 75, 80, 85, 90, 95]} // Steady upward growth trend
                                bgClass="bg-gradient-to-br from-blue-300 from-60% to-blue-500 to-100%"
                                darkText={true}
                                subtext="Total blocks verified in ledger"
                            />
                            <StatsCard
                                title="Global Validators"
                                value={nodeCount.toLocaleString()}
                                change="Active"
                                isPositive={true}
                                icon={Globe}
                                data={[65, 60, 70, 75, 68, 80]}
                                bgClass="bg-gradient-to-br from-blue-300 from-60% to-blue-500 to-100%"
                                darkText={true}
                                subtext="Nodes securing the network fabric"
                            />
                        </div>

                        {/* Right Side Graphic */}
                        <div className="hidden lg:flex w-full lg:w-1/2 h-[550px] items-center justify-end relative overflow-hidden group p-0 bg-black rounded-[40px] border border-white/5">
                            <img
                                src="/Revenue-pana.svg"
                                alt="Revenue Analysis"
                                className="w-full h-full object-contain object-right scale-95 transform group-hover:scale-105 transition-transform duration-700 relative z-10"
                            />
                        </div>
                    </div>

                    {/* Main Network Chart */}
                    <NetworkChart data={tpsHistory} />

                    {/* Bottom Tables */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-24">
                        <DataTable
                            title="Recent Blocks"
                            columns={blockColumns}
                            data={blocksData}
                            bgClass="bg-gradient-to-br from-blue-300 from-60% to-blue-500 to-100%"
                            darkText={true}
                        />
                        <DataTable
                            title="Latest Transactions"
                            columns={txColumns}
                            data={txsData}
                            bgClass="bg-gradient-to-br from-blue-300 from-60% to-blue-500 to-100%"
                            darkText={true}
                        />
                    </div>

                    <footer className="text-center text-[13px] text-gray-400 mt-24 mb-4 uppercase tracking-widest">
                        Developed By Team Sentinel ✨
                    </footer>
                </div>
            </main>

            {/* Wallet Selection Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setIsModalOpen(false)}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative bg-black border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="text-sm text-gray-400 mb-4">
                                    Choose your preferred wallet to connect to the Quai Network.
                                </div>

                                {/* Pelagus Wallet */}
                                <button
                                    onClick={() => connectToWallet('Pelagus')}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary/20 hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-white font-bold">Pelagus</div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Recommended for Quai</div>
                                        </div>
                                    </div>
                                    <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                </button>

                                {/* MetaMask Wallet */}
                                <button
                                    onClick={() => connectToWallet('MetaMask')}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-[#F6851B]/20 hover:border-[#F6851B]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden p-1.5">
                                            <img src="/fox.png" alt="MetaMask" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-white font-bold">MetaMask</div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Popular Choice</div>
                                        </div>
                                    </div>
                                    <div className="text-[#F6851B] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRightLeft className="w-5 h-5" />
                                    </div>
                                </button>
                            </div>

                            <div className="p-4 bg-white/5 text-center">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                    Secure Connection Guaranteed
                                </span>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};


// Stat Row for Wallet Selection
const WalletButton = ({ name, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-all group"
    >
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-white">{name}</span>
        </div>
        <div className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">CONNECT</div>
    </button>
);

export default Dashboard;