import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Clock, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '../api';
import { useFinanceContext } from '../contexts/FinanceContext.tsx';

interface ProjectFinancials {
    project_id: number;
    project_name: string;
    revenue: number;
    expenses: number;
    expense_breakdown: { [key: string]: number };
    labor_cost: number;
    billable_cost: number;
    overhead_cost: number;
    billable_hours: number;
    overhead_hours: number;
    total_costs: number;
    net_profit: number;
    profit_margin: number;
}

interface AggregatedData {
    total_revenue: number;
    total_expenses: number;
    total_labor_cost: number;
    total_costs: number;
    total_profit: number;
    avg_margin: number;
    total_billable_hours: number;
    total_overhead_hours: number;
}

const FinanceAnalytics: React.FC = () => {
    const [allProjects, setAllProjects] = useState<ProjectFinancials[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { selectedProject, setSelectedProject, setCurrentProjectData } = useFinanceContext();

    useEffect(() => {
        fetch(`${API_BASE_URL}/finance/project-analytics`)
            .then(res => res.json())
            .then(data => {
                setAllProjects(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching financial analytics:', err);
                setIsLoading(false);
            });
    }, []);

    // Calculate aggregated data
    const aggregateFinancials = (): AggregatedData => {
        const total_revenue = allProjects.reduce((sum, p) => sum + p.revenue, 0);
        const total_expenses = allProjects.reduce((sum, p) => sum + p.expenses, 0);
        const total_labor_cost = allProjects.reduce((sum, p) => sum + p.labor_cost, 0);
        const total_costs = allProjects.reduce((sum, p) => sum + p.total_costs, 0);
        const total_profit = allProjects.reduce((sum, p) => sum + p.net_profit, 0);
        const avg_margin = total_revenue > 0 ? (total_profit / total_revenue * 100) : 0;
        const total_billable_hours = allProjects.reduce((sum, p) => sum + p.billable_hours, 0);
        const total_overhead_hours = allProjects.reduce((sum, p) => sum + p.overhead_hours, 0);

        return {
            total_revenue,
            total_expenses,
            total_labor_cost,
            total_costs,
            total_profit,
            avg_margin,
            total_billable_hours,
            total_overhead_hours
        };
    };

    // Update context when project or data changes
    useEffect(() => {
        if (selectedProject === 'all') {
            const aggregated = aggregateFinancials();
            setCurrentProjectData({
                project_filter: 'all',
                total_revenue: aggregated.total_revenue,
                total_costs: aggregated.total_costs,
                total_profit: aggregated.total_profit,
                avg_margin: aggregated.avg_margin,
                projects: allProjects.map(p => ({
                    name: p.project_name,
                    revenue: p.revenue,
                    profit: p.net_profit,
                    margin: p.profit_margin
                }))
            });
        } else {
            const currentData = allProjects.find(p => p.project_name === selectedProject);
            if (currentData) {
                setCurrentProjectData({
                    project_filter: selectedProject,
                    project_name: currentData.project_name,
                    revenue: currentData.revenue,
                    expenses: currentData.expenses,
                    labor_cost: currentData.labor_cost,
                    net_profit: currentData.net_profit,
                    profit_margin: currentData.profit_margin,
                    billable_hours: currentData.billable_hours,
                    overhead_hours: currentData.overhead_hours,
                    expense_breakdown: currentData.expense_breakdown
                });
            }
        }
    }, [selectedProject, allProjects, setCurrentProjectData]);

    const formatCurrency = (value: number) => {
        return Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
    };

    const formatPercent = (value: number) => {
        return Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading financial analytics...</div>
            </div>
        );
    }

    const aggregated = aggregateFinancials();
    const currentData = selectedProject === 'all' ? null : allProjects.find(p => p.project_name === selectedProject);

    // Prepare chart data
    const projectComparisonData = allProjects.map(p => ({
        name: p.project_name,
        Revenue: p.revenue,
        Costs: p.total_costs,
        Profit: p.net_profit
    }));

    const expenseBreakdownData = selectedProject === 'all'
        ? Object.entries(
            allProjects.reduce((acc, p) => {
                Object.entries(p.expense_breakdown).forEach(([cat, val]) => {
                    acc[cat] = (acc[cat] || 0) + val;
                });
                return acc;
            }, {} as { [key: string]: number })
        ).map(([name, value]) => ({ name, value }))
        : Object.entries(currentData?.expense_breakdown || {}).map(([name, value]) => ({ name, value }));

    const laborBreakdownData = selectedProject === 'all'
        ? [
            { name: 'Billable Hours', value: aggregated.total_billable_hours },
            { name: 'Overhead Hours', value: aggregated.total_overhead_hours }
        ]
        : [
            { name: 'Billable Hours', value: currentData?.billable_hours || 0 },
            { name: 'Overhead Hours', value: currentData?.overhead_hours || 0 }
        ];

    const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Project Selector */}
            <div className="glass p-4">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Select Project</label>
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full md:w-64 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    style={{ color: 'white' }}
                >
                    <option value="all" style={{ backgroundColor: '#1e293b', color: 'white' }}>All Projects (Aggregated)</option>
                    {allProjects.map(p => (
                        <option key={p.project_id} value={p.project_name} style={{ backgroundColor: '#1e293b', color: 'white' }}>{p.project_name}</option>
                    ))}
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="glass p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <DollarSign className="text-green-400" size={24} />
                        <h3 className="font-semibold text-gray-400 text-sm">Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400">
                        ${formatCurrency(selectedProject === 'all' ? aggregated.total_revenue : currentData?.revenue || 0)}
                    </p>
                </div>

                <div className="glass p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <TrendingDown className="text-red-400" size={24} />
                        <h3 className="font-semibold text-gray-400 text-sm">Expenses</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-400">
                        ${formatCurrency(selectedProject === 'all' ? aggregated.total_expenses : currentData?.expenses || 0)}
                    </p>
                </div>

                <div className="glass p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <Briefcase className="text-blue-400" size={24} />
                        <h3 className="font-semibold text-gray-400 text-sm">Labor Cost</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">
                        ${formatCurrency(selectedProject === 'all' ? aggregated.total_labor_cost : currentData?.labor_cost || 0)}
                    </p>
                </div>

                <div className="glass p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <TrendingUp className={`${(selectedProject === 'all' ? aggregated.total_profit : currentData?.net_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`} size={24} />
                        <h3 className="font-semibold text-gray-400 text-sm">Net Profit</h3>
                    </div>
                    <p className={`text-3xl font-bold ${(selectedProject === 'all' ? aggregated.total_profit : currentData?.net_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${formatCurrency(selectedProject === 'all' ? aggregated.total_profit : currentData?.net_profit || 0)}
                    </p>
                </div>

                <div className="glass p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <Clock className="text-purple-400" size={24} />
                        <h3 className="font-semibold text-gray-400 text-sm">Profit Margin</h3>
                    </div>
                    <p className={`text-3xl font-bold ${(selectedProject === 'all' ? aggregated.avg_margin : currentData?.profit_margin || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(selectedProject === 'all' ? aggregated.avg_margin : currentData?.profit_margin || 0)}%
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Comparison Chart (only for "All Projects") */}
                {selectedProject === 'all' && (
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Project Financial Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={projectComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="Revenue" fill="#10b981" />
                                <Bar dataKey="Costs" fill="#ef4444" />
                                <Bar dataKey="Profit" fill="#0ea5e9" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Expense Breakdown */}
                <div className="glass p-6">
                    <h3 className="text-lg font-semibold mb-4">Expense Breakdown by Category</h3>
                    {expenseBreakdownData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseBreakdownData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: $${formatCurrency(entry.value)}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {expenseBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                            No expense data available
                        </div>
                    )}
                </div>

                {/* Labor Hours Breakdown */}
                <div className="glass p-6">
                    <h3 className="text-lg font-semibold mb-4">Labor Hours Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={laborBreakdownData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${formatCurrency(entry.value)} hrs`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                <Cell fill="#0ea5e9" />
                                <Cell fill="#8b5cf6" />
                            </Pie>
                            <Legend />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Project Details Table (only for "All Projects") */}
            {selectedProject === 'all' && (
                <div className="glass p-6">
                    <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Project</th>
                                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Revenue</th>
                                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Expenses</th>
                                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Labor Cost</th>
                                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Net Profit</th>
                                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProjects.map(project => (
                                    <tr key={project.project_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-medium">{project.project_name}</td>
                                        <td className="py-3 px-4 text-right text-green-400">${formatCurrency(project.revenue)}</td>
                                        <td className="py-3 px-4 text-right text-red-400">${formatCurrency(project.expenses)}</td>
                                        <td className="py-3 px-4 text-right text-blue-400">${formatCurrency(project.labor_cost)}</td>
                                        <td className={`py-3 px-4 text-right font-bold ${project.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${formatCurrency(project.net_profit)}
                                        </td>
                                        <td className={`py-3 px-4 text-right ${project.profit_margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {formatPercent(project.profit_margin)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceAnalytics;
