import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ title, value, change, isPositive, icon: Icon, data, active, subtext, bgClass, darkText }) => {
    return (
        <div className={`${bgClass || 'bg-surface-dark'} border border-border-dark p-5 rounded-xl flex flex-col justify-between h-40 transition-all duration-300 group relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className={`${darkText ? 'text-black' : 'text-gray-400'} text-[11px] font-bold uppercase tracking-wider`}>{title}</h3>
                {Icon && <Icon className={`w-5 h-5 ${active ? (darkText ? 'text-black' : 'text-primary') : (darkText ? 'text-black/60' : 'text-gray-500')}`} />}
            </div>

            <div className="flex items-baseline gap-3 mb-4 relative z-10">
                <span className={`text-3xl font-bold ${darkText ? 'text-black' : 'text-white'} tracking-tight`}>{value}</span>
                {change && (
                    <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {change}
                    </div>
                )}
            </div>

            <div className="mt-auto pt-4 relative">
                {/* Subtle Grid Baseline for scale */}
                <div className="absolute inset-x-0 bottom-0 h-14 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className={`border-t ${darkText ? 'border-black' : 'border-white'} w-full`}></div>
                    <div className={`border-t ${darkText ? 'border-black' : 'border-white'} w-full`}></div>
                    <div className={`border-t ${darkText ? 'border-black' : 'border-white'} w-full`}></div>
                </div>

                <div className="flex items-end gap-2 h-14 relative z-10">
                    {data ? (
                        <>
                            {data.map((height, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-t-sm transition-all duration-300 ${darkText
                                        ? (i === data.length - 1 ? 'bg-blue-700' : 'bg-blue-600/40')
                                        : (i === data.length - 1 ? 'bg-blue-400' : 'bg-white/20')
                                        }`}
                                    style={{ height: `${Math.max(10, height)}%` }}
                                />
                            ))}
                            <div className={`absolute -top-1 right-0 text-[8px] font-black uppercase tracking-tighter ${darkText ? 'text-black/40' : 'text-white/40'}`}>
                                60s Trends
                            </div>
                        </>
                    ) : (
                        subtext && <div className={`text-[11px] ${darkText ? 'text-black' : 'text-gray-400'} font-mono mt-auto`}>{subtext}</div>
                    )}

                    {active && !data && (
                        <div className="flex -space-x-3 overflow-hidden mt-auto pl-1">
                            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-surface-dark bg-gray-600 flex items-center justify-center text-[8px] font-bold text-white/50">U1</div>
                            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-surface-dark bg-gray-500 flex items-center justify-center text-[8px] font-bold text-white/50">U2</div>
                            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-surface-dark bg-gray-400 flex items-center justify-center text-[8px] font-bold text-white/50">U3</div>
                            <div className={`h-7 flex items-center justify-center px-2 text-[10px] ${darkText ? 'text-black' : 'text-gray-400'} font-medium`}>+12 joining...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;