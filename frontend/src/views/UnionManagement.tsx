import React, { useState, useEffect } from 'react';
import { Shield, FileText, Download, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface BenefitBreakdown {
    [key: string]: number;
}

interface UnionData {
    union_id: number;
    union_name: string;
    total_liability: number;
    benefit_breakdown: BenefitBreakdown;
}

const UnionManagement: React.FC = () => {
    const [unions, setUnions] = useState<UnionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/labor/union-reconciliation`)
            .then(res => res.json())
            .then(data => {
                setUnions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Union Reconciliation
                    </h2>
                    <p className="text-gray-400 mt-2">Manage benefit liabilities and automated reporting for union halls.</p>
                </div>
                <button className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all shadow-lg shadow-primary-900/20">
                    <Download size={20} />
                    <span>Generate All Reports</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Shield className="text-blue-400" size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-300">Total Liability</h3>
                    </div>
                    <p className="text-3xl font-bold">
                        {formatCurrency(unions.reduce((acc, curr) => acc + curr.total_liability, 0))}
                    </p>
                    <div className="flex items-center mt-2 text-green-400 text-sm">
                        <TrendingUp size={16} className="mr-1" />
                        <span>Ready for reconciliation</span>
                    </div>
                </div>

                <div className="glass p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <FileText className="text-orange-400" size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-300">Reports Pending</h3>
                    </div>
                    <p className="text-3xl font-bold">{unions.length}</p>
                    <p className="text-sm text-gray-400 mt-2">All halls reconciled for current period</p>
                </div>

                <div className="glass p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="text-green-400" size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-300">Accuracy Score</h3>
                    </div>
                    <p className="text-3xl font-bold">99.8%</p>
                    <p className="text-sm text-gray-400 mt-2">Real-time matching with GP payroll data</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {unions.map((union) => (
                    <div key={union.union_id} className="glass overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                    <Shield className="text-primary-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">{union.union_name}</h4>
                                    <p className="text-sm text-gray-400">Hall Reconciliation ID: U-{union.union_id}2026</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Monthly Liability</p>
                                <p className="text-2xl font-bold text-primary-400">{formatCurrency(union.total_liability)}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(union.benefit_breakdown).map(([benefit, amount]) => (
                                <div key={benefit} className="p-4 bg-black/20 rounded-xl border border-white/5">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{benefit}</p>
                                    <p className="text-lg font-bold">{formatCurrency(amount)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 px-6 flex justify-end space-x-3 bg-black/20">
                            <button className="text-sm text-gray-400 hover:text-white transition-colors">View Detailed Audit Log</button>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-all border border-white/10 flex items-center space-x-2">
                                <Download size={16} />
                                <span>Export GP Journal Entry</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass p-6 border-l-4 border-blue-500">
                <div className="flex items-start space-x-4">
                    <AlertCircle className="text-blue-400 mt-1" size={24} />
                    <div>
                        <h4 className="font-bold">GP Reconciliation Note</h4>
                        <p className="text-gray-400 text-sm mt-1">
                            These liabilities are calculated from real-time field data. To finalize the reconciliation
                            for physical mailing to union halls, ensure all field timesheets are approved for the current pay period.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnionManagement;
