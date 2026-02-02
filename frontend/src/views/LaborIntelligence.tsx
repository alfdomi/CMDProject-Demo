import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, Clock, Sparkles, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { API_BASE_URL } from '../api';

interface EmployeeData {
    employee_count: number;
    employees: Array<{
        employee_id: string;
        employee_name: string;
        total_hours: number;
        salary: number;
        days_absent: number;
        vacation_days: number;
        months_employed: number;
    }>;
}

const LaborIntelligence: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [employeeData, setEmployeeData] = useState<EmployeeData>({ employee_count: 0, employees: [] });
    const [payrollEst, setPayrollEst] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetch(`${API_BASE_URL}/labor/productivity`)
            .then(res => res.json())
            .then(setData)
            .catch(console.error);

        fetch(`${API_BASE_URL}/labor/payroll-estimation`)
            .then(res => res.json())
            .then(setPayrollEst)
            .catch(console.error);
    }, []);

    // Fetch employee data when project selection changes
    useEffect(() => {
        console.log('[LaborIntelligence] Selected project changed:', selectedProject);
        const selectedProjectData = data.find(p => p.project_name === selectedProject);
        const projectId = selectedProjectData?.project_id;
        console.log('[LaborIntelligence] Found project data:', selectedProjectData);
        console.log('[LaborIntelligence] Project ID:', projectId);

        const url = selectedProject === 'all' || !projectId
            ? `${API_BASE_URL}/labor/employees`
            : `${API_BASE_URL}/labor/employees?project_id=${projectId}`;

        console.log('[LaborIntelligence] Fetching from URL:', url);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log('[LaborIntelligence] Received employee data:', data);
                setEmployeeData(data);
            })
            .catch(console.error);

        setCurrentPage(1); // Reset to first page when project changes
    }, [selectedProject, data]);

    // Filter data based on selected project
    const filteredData = selectedProject === 'all'
        ? data
        : data.filter(item => item.project_name === selectedProject);

    const totalBillable = filteredData.reduce((sum, item) => sum + (item.billable_hours || 0), 0);
    const totalOverhead = filteredData.reduce((sum, item) => sum + (item.overhead_hours || 0), 0);
    const totalHours = totalBillable + totalOverhead;
    const productivityDelta = totalHours > 0 ? ((totalBillable / totalHours) * 100).toFixed(1) : "0";

    // Use real payroll estimation if on "all" projects, otherwise fallback to simple calc
    const weeklyPayroll = selectedProject === 'all' && payrollEst
        ? payrollEst.estimated_weekly_payroll.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        : (totalHours * 85).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // Pagination logic
    const totalPages = Math.ceil(employeeData.employees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEmployees = employeeData.employees.slice(startIndex, endIndex);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
    };

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
                    {data.map((project, idx) => (
                        <option key={idx} value={project.project_name} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                            {project.project_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 relative">
                    <div className="absolute top-3 right-3 flex items-center space-x-1 text-primary-400 bg-primary-900 bg-opacity-40 px-2 py-0.5 rounded-full border border-primary-800">
                        <Sparkles size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">AI Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3 text-primary-400 mb-4">
                        <Users size={24} />
                        <h3 className="font-semibold">Productivity Delta</h3>
                    </div>
                    <p className="text-3xl font-bold">{productivityDelta}%</p>
                    <p className="text-sm text-gray-400 mt-2">Billable ratio efficiency</p>
                </div>

                <div className="glass p-6 relative">
                    <div className="absolute top-3 right-3 flex items-center space-x-1 text-green-400 bg-green-900 bg-opacity-40 px-2 py-0.5 rounded-full border border-green-800">
                        <Sparkles size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">AI Forecast</span>
                    </div>
                    <div className="flex items-center space-x-3 text-green-400 mb-4">
                        <DollarSign size={24} />
                        <h3 className="font-semibold">Weekly Payroll Est.</h3>
                    </div>
                    <p className="text-3xl font-bold">${weeklyPayroll}</p>
                    <p className="text-sm text-gray-400 mt-2">Estimated weekly gross payroll cost</p>
                </div>

                <div className="glass p-6">
                    <div className="flex items-center space-x-3 text-yellow-400 mb-4">
                        <Clock size={24} />
                        <h3 className="font-semibold">Overhead Hours</h3>
                    </div>
                    <p className="text-3xl font-bold">{Number(totalOverhead).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</p>
                    <p className="text-sm text-gray-400 mt-2">Sum of non-billable project hours</p>
                </div>
            </div>

            <div className="glass p-6 h-80">
                <h3 className="text-lg font-semibold mb-6">
                    Labor Productivity Analysis {selectedProject !== 'all' && `- ${selectedProject}`}
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="project_name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="billable_hours" fill="#0ea5e9" name="Billable" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="overhead_hours" fill="#f43f5e" name="Overhead" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Employee Count Card */}
            <div className="glass p-6">
                <div className="flex items-center space-x-3 text-blue-400 mb-4">
                    <UserCheck size={24} />
                    <h3 className="font-semibold">Active Employees</h3>
                </div>
                <p className="text-3xl font-bold">{employeeData.employee_count}</p>
                <p className="text-sm text-gray-400 mt-2">
                    {selectedProject === 'all' ? 'Total employees across all projects' : `Employees working on ${selectedProject}`}
                </p>
            </div>

            {/* Employee Details Table */}
            <div className="glass p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Employee Details</h3>
                    <div className="text-sm text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, employeeData.employees.length)} of {employeeData.employees.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Employee</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Hours Worked</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Days Absent</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Salary</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Vacation Days</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Time w/ Company</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEmployees.map((employee, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                                <Users size={16} className="text-primary-400" />
                                            </div>
                                            <span className="font-medium">{employee.employee_name}</span>
                                        </div>
                                    </td>
                                    <td className="text-right py-3 px-4">{formatCurrency(employee.total_hours)}</td>
                                    <td className="text-right py-3 px-4">
                                        <span className={employee.days_absent > 3 ? 'text-red-400' : 'text-gray-300'}>
                                            {employee.days_absent}
                                        </span>
                                    </td>
                                    <td className="text-right py-3 px-4 text-green-400">${formatCurrency(employee.salary)}</td>
                                    <td className="text-right py-3 px-4">{employee.vacation_days}</td>
                                    <td className="text-right py-3 px-4">
                                        {employee.months_employed} {employee.months_employed === 1 ? 'month' : 'months'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                            <span>Previous</span>
                        </button>
                        <span className="text-sm text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Next</span>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LaborIntelligence;
