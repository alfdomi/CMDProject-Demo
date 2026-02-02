import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { DollarSign, Percent, ArrowUpRight, ArrowDownRight, Target, BarChart3 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const FinancialTrends: React.FC = () => {
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/finance/trends`)
            .then(res => res.json())
            .then(data => {
                setTrendData(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}k`;

    if (loading) return <div className="h-64 flex items-center justify-center animate-pulse text-primary-400">Loading Intelligence...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Financial Trends & Benchmarking
                </h2>
                <p className="text-gray-400 mt-2">Strategic visibility into margin health and market positioning (2025-2026).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Monthly Revenue', value: '$525k', icon: DollarSign, color: 'text-blue-400' },
                    { label: 'Operating Margin', value: '12.4%', icon: Percent, color: 'text-green-400', trend: '+2.1%' },
                    { label: 'Market Benchmark', value: '8.5%', icon: Target, color: 'text-purple-400' },
                    { label: 'Liquidity Index', value: '1.85', icon: BarChart3, color: 'text-orange-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 group hover:border-primary-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            {stat.trend && (
                                <span className="flex items-center text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={12} className="mr-1" />
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center">
                        Revenue vs Expenses Trend
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center">
                        Profit Margin vs Market Benchmark
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="margin" name="Our Margin %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                <Line type="monotone" dataKey="benchmark" name="Market Avg (8.5%)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass p-6 bg-gradient-to-br from-primary-600/10 to-transparent border-primary-500/20">
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-primary-500/20">
                        <ArrowUpRight className="text-primary-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Self-Service Strategic Insight</h4>
                        <p className="text-gray-400 text-sm">
                            Margins are currently performing 3.9% above the construction market average.
                            This provides a $42k/mo "Efficiency Premium" that can be reinvested into Dynamics BC migration prep.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialTrends;
