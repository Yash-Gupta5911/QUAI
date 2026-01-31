import React from 'react';

const DataTable = ({ title, columns, data, linkText = "View All", bgClass, darkText }) => {
    return (
        <div className={`${bgClass || 'bg-surface-dark'} border border-border-dark rounded-xl overflow-hidden flex flex-col h-full`}>
            <div className={`flex justify-between items-center p-5 border-b ${darkText ? 'border-black/10' : 'border-border-dark'}`}>
                <h3 className={`${darkText ? 'text-black' : 'text-white'} text-2xl font-bold tracking-tight`}>{title}</h3>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`${bgClass ? 'bg-transparent' : 'bg-surface-dark'} p-4 text-[12px] font-black tracking-[0.1em] ${darkText ? 'text-black' : 'text-gray-400'} uppercase border-b ${darkText ? 'border-black/10' : 'border-border-dark'}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className={`group ${darkText ? 'hover:bg-black/5' : 'hover:bg-white/5'} transition-colors`}>
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`p-4 text-xs font-medium ${darkText ? 'text-black border-black/10' : 'text-gray-300 border-border-dark'} border-b group-last:border-none`}
                                    >
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;