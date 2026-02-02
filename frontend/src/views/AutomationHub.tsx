import React, { useState, useEffect } from 'react';
import { Settings, Zap, History, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Metric {
    process: string;
    manual_min: number;
    auto_min: number;
    status: string;
    savings: number;
}

const AutomationHub: React.FC = () => {
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/automation/process-metrics`)
            .then(res => res.json())
            .then(setMetrics)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <div className="space-y-8 animate-in zoom-in duration-500">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Process Automation Hub
                </h2>
                <p className="text-gray-400 mt-2">Modernizing manual Dynamics GP workflows into high-efficiency automated streams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass p-6 flex flex-col items-center text-center">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Cycle Time Reduction</p>
                    <p className="text-4xl font-bold text-primary-400">82%</p>
                    <div className="flex items-center mt-2 text-xs text-green-400">
                        <Zap size={12} className="mr-1" />
                        <span>Real-time tracking enabled</span>
                    </div>
                </div>
                <div className="glass p-6 flex flex-col items-center text-center">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Annual Hours Saved</p>
                    <p className="text-4xl font-bold text-blue-400">1,240</p>
                    <p className="text-xs text-gray-500 mt-2">Based on AP/Payroll volume</p>
                </div>
                <div className="glass p-6 flex flex-col items-center text-center">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Data Integrity</p>
                    <p className="text-4xl font-bold text-green-400">99.9%</p>
                    <p className="text-xs text-gray-500 mt-2">Zero extraction errors last period</p>
                </div>
                <div className="glass p-6 flex flex-col items-center text-center">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">ROI Realized</p>
                    <p className="text-4xl font-bold text-purple-400">3.4x</p>
                    <p className="text-xs text-gray-500 mt-2">Relative to automation spend</p>
                </div>
            </div>

            <div className="glass overflow-hidden shadow-2xl shadow-primary-500/5">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-lg font-bold flex items-center">
                        <Settings className="mr-2 text-primary-400" size={20} />
                        Manual vs. Automated Performance
                    </h3>
                </div>
                <div className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black/20 text-left">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Process Workflow</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Manual Time</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Auto Time</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Efficiency Gain</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {metrics.map((m, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 font-semibold text-gray-200">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-primary-500 mr-3 shadow-glow" />
                                            {m.process}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center text-gray-500">
                                            <Clock size={14} className="mr-2" />
                                            {m.manual_min} min
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center text-primary-400 font-bold">
                                            <Zap size={14} className="mr-2" />
                                            {m.auto_min} min
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-green-400 font-mono">-{m.savings}%</span>
                                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-400/50" style={{ width: `${m.savings}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${m.status === 'Optimized' ? 'bg-green-500/10 text-green-400' :
                                                m.status === 'Automated' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                                            }`}>
                                            {m.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 -mt-12 -mr-12 bg-primary-500/10 rounded-full blur-3xl" />
                    <h4 className="text-xl font-bold mb-4 flex items-center">
                        <History className="mr-2 text-primary-400" />
                        Modernization Path
                    </h4>
                    <div className="space-y-6">
                        {[
                            { step: 'Phase 1', desc: 'Manual Data Entry from field sheets to GP', status: 'Replaced' },
                            { step: 'Phase 2', desc: 'Manual Union Liability Calculation', status: 'Replaced' },
                            { step: 'Phase 3', desc: 'Manual AP Invoice Matching', status: 'In Progress' },
                            { step: 'Phase 4', desc: 'Automated Dynamics BC Migration', status: 'Pending' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-primary-500">{s.step}</span>
                                    <p className="text-gray-300 font-medium">{s.desc}</p>
                                </div>
                                <ArrowRight className="text-gray-600" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass p-8 flex flex-col justify-center bg-gradient-to-br from-primary-900/20 to-transparent">
                    <h4 className="text-2xl font-bold mb-4">GP 2029 Strategy</h4>
                    <p className="text-gray-400 leading-relaxed mb-6">
                        By automating these high-latency workflows today, the finance team shifts from 80% data entry to 80% strategic analysis.
                        This eliminates the reporting "bottleneck" and prepares the organization for the 2029 full ERP overhaul.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <CheckCircle2 className="text-green-400 mb-2" size={20} />
                            <p className="text-xs text-gray-500 uppercase font-bold">Labor Visibility</p>
                            <p className="text-lg font-bold">100% Real-time</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <AlertCircle className="text-blue-400 mb-2" size={20} />
                            <p className="text-xs text-gray-500 uppercase font-bold">Scale Ability</p>
                            <p className="text-lg font-bold">Ready for 2029</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationHub;
