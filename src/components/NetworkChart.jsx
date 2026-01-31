import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { time: '00:00', value: 30 },
    { time: '02:00', value: 35 },
    { time: '04:00', value: 32 },
    { time: '06:00', value: 40 },
    { time: '08:00', value: 55 },
    { time: '10:00', value: 70 },
    { time: '12:00', value: 65 },
    { time: '14:00', value: 50 },
    { time: '16:00', value: 45 },
    { time: '18:00', value: 60 },
    { time: '20:00', value: 90 },
    { time: '22:00', value: 85 },
    { time: '23:59', value: 50 },
];

const NetworkChart = ({ data: liveData }) => {
    const [filter, setFilter] = useState('1D');
    const filters = ['1H', '6H', '1D', '1W'];
    const chartData = liveData || [];

    return (
        <div className="bg-surface-dark border border-border-dark rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-white text-2xl font-bold mb-1 tracking-tight">Network Pulse</h2>
                    <div className="text-xs text-gray-500 font-mono uppercase tracking-[0.2em] opacity-80">TPS / 10s Window</div>
                </div>
            </div>

            <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#1f1f23" opacity={0.3} />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis hide={true} domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                            itemStyle={{ color: '#2563eb' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default NetworkChart;