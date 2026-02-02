import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Zap, Sparkles, X, Activity, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { API_BASE_URL } from '../api';

interface Anomaly {
    category: string;
    amount: number;
    description: string;
    spike_percentage: number;
    suggested_action: string;
    inflation_adjusted_avg?: number;
    historical_data: { date: string, amount: number }[];
}

const Automation: React.FC = () => {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/automation/anomalies`)
            .then(res => res.json())
            .then(data => {
                setAnomalies(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start space-x-4">
                    <div className="bg-white/10 p-2 rounded-lg text-white/20 animate-pulse">
                        <Activity size={24} />
                    </div>
                    <div className="space-y-2 flex-grow">
                        <div className="h-6 bg-white/10 rounded-md w-48 animate-pulse"></div>
                        <div className="h-4 bg-white/5 rounded-md w-full animate-pulse"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="glass p-6 border-l-4 border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-3 flex-grow">
                                    <div className="h-4 bg-white/10 rounded w-24 animate-pulse"></div>
                                    <div className="h-8 bg-white/10 rounded w-32 animate-pulse"></div>
                                </div>
                                <div className="h-10 bg-white/10 rounded w-16 animate-pulse"></div>
                            </div>
                            <div className="space-y-2 mb-6">
                                <div className="h-3 bg-white/5 rounded w-full animate-pulse"></div>
                                <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse"></div>
                            </div>
                            <div className="flex space-x-3">
                                <div className="h-10 bg-white/10 rounded-lg flex-grow animate-pulse"></div>
                                <div className="h-10 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="relative">
                        <Activity size={48} className="text-primary-500 animate-pulse" />
                        <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full animate-ping"></div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Forensic Engine Active</h3>
                        <p className="text-sm text-gray-400">Scanning database for statistical variances...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-xl p-6 flex items-start space-x-4 transition-all hover:bg-opacity-15">
                <div className="bg-red-500 p-2 rounded-lg text-white shadow-lg shadow-red-500/20">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-red-500">Anomaly Pulse Monitoring</h2>
                    <p className="text-gray-300 mt-1">Our forensic AI has identified {anomalies.length} deviations from construction cost norms, accounting for annual inflation targets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {anomalies.map((anomaly, idx) => (
                    <div key={idx} className="glass group p-6 border-l-4 border-red-500 relative transition-all hover:translate-x-1">
                        <div className="absolute top-3 right-3 flex items-center space-x-1 text-red-400 bg-red-900 bg-opacity-40 px-2 py-0.5 rounded-full border border-red-800 shadow-xl">
                            <Sparkles size={10} className="animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">AI Insight</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="pr-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-400 bg-opacity-10 px-2 py-1 rounded">
                                    {anomaly.category} Alert
                                </span>
                                <h3 className="text-2xl font-bold mt-2">${anomaly.amount ? Number(anomaly.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 }) : '0'}</h3>
                                <p className="text-gray-400 mt-2 text-sm leading-relaxed line-clamp-2">{anomaly.description}</p>
                            </div>
                            <div className="text-red-500 flex flex-col items-end font-bold">
                                <div className="flex items-center space-x-1">
                                    <TrendingUp size={20} />
                                    <span>+{anomaly.spike_percentage}%</span>
                                </div>
                                <span className="text-[10px] text-red-400/50 uppercase">vs Avg</span>
                            </div>
                        </div>
                        <div className="mt-6 flex space-x-3">
                            <button
                                onClick={() => setSelectedAnomaly(anomaly)}
                                className="flex-grow flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-600/20"
                            >
                                <Search size={16} />
                                <span>Investigate Anomaly</span>
                            </button>
                            <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-400 hover:text-white border border-white/5">
                                Dismiss
                            </button>
                        </div>
                    </div>
                ))}

                <div className="glass p-6 flex flex-col justify-center items-center text-center opacity-60">
                    <div className="bg-primary-500 bg-opacity-10 p-4 rounded-full mb-4">
                        <Zap className="text-primary-500" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold">Active Pattern Analysis</h3>
                    <p className="text-gray-400 mt-2 max-w-xs text-sm">
                        Forensic models are currently cross-referencing {anomalies.length} items with historical union rates and material benchmarks.
                    </p>
                </div>
            </div>

            {/* Investigation Modal */}
            {selectedAnomaly && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedAnomaly(null)}></div>
                    <div className="relative glass w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border-red-500/30 animate-scaleIn">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-red-500 p-2 rounded-lg shadow-lg shadow-red-500/20">
                                    <Activity size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Investigation: {selectedAnomaly.category}</h2>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">Statistical Variance Breakdown</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAnomaly(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Comparison Chart */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                                    <TrendingUp size={16} className="text-red-500" />
                                    <span>Historical Trend for {selectedAnomaly.category}</span>
                                </h3>
                                <div className="h-64 w-full bg-black/20 rounded-xl p-4 border border-white/5">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={selectedAnomaly.historical_data}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} />
                                            <YAxis stroke="#ffffff40" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                itemStyle={{ color: '#ef4444' }}
                                            />
                                            {selectedAnomaly.inflation_adjusted_avg && (
                                                <ReferenceLine
                                                    y={selectedAnomaly.inflation_adjusted_avg}
                                                    stroke="#22c55e"
                                                    strokeDasharray="3 3"
                                                    label={{
                                                        value: 'Inflation Baseline',
                                                        position: 'right',
                                                        fill: '#22c55e',
                                                        fontSize: 10,
                                                        className: 'uppercase font-bold tracking-tighter'
                                                    }}
                                                />
                                            )}
                                            <Area type="monotone" dataKey="amount" stroke="#ef4444" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">AI Root Cause Breakdown</h3>
                                    <div className="bg-primary-900/10 border border-primary-500/20 p-5 rounded-xl">
                                        <p className="text-gray-200 leading-relaxed italic">"{selectedAnomaly.description}"</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Suggested Forensic Action</h3>
                                    <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-xl">
                                        <p className="font-bold text-red-400 mb-2 underline decoration-red-500/30 underline-offset-4">Audit Recommendation:</p>
                                        <p className="text-white text-lg font-medium">{selectedAnomaly.suggested_action}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end space-x-4">
                            <button
                                onClick={() => setSelectedAnomaly(null)}
                                className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition-all"
                            >
                                Close Investigation
                            </button>
                            <button className="px-8 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/30">
                                Initiate Audit Workflow
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Automation;
