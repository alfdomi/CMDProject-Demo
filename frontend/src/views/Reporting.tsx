import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Map, MapPin, Search, User, Navigation, DollarSign, Clock,
    AlertCircle, CheckCircle2, X, Cpu, Zap, Calendar,
    FileText, Image as ImageIcon, History, TrendingUp, AlertTriangle,
    Plus, Upload, Save, Trash2, Link as LinkIcon, Edit2, Check
} from 'lucide-react';
import { API_BASE_URL } from '../api';

interface ProjectEvent {
    id: number;
    title: string;
    date: string;
    event_type: string;
    category?: string;
    amount?: number;
}

interface ProjectMedia {
    id: number;
    filename: string;
    file_type: string;
    url: string;
}

interface Project {
    id: number;
    name: string;
    location?: string;
    manager?: string;
    total_budget?: number;
    budget_hours: number;
    actual_hours: number;
    status_notes?: string;
    start_date?: string;
    original_completion_date?: string;
    estimated_completion_date?: string;
    events: ProjectEvent[];
    media: ProjectMedia[];
}

const Reporting: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeModalTab, setActiveModalTab] = useState<'general' | 'timeline' | 'history' | 'media'>('general');
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [eventForm, setEventForm] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        event_type: 'milestone',
        category: 'materials',
        amount: ''
    });

    const [isAddingMedia, setIsAddingMedia] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Project Creation States
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [projectForm, setProjectForm] = useState({
        name: '',
        location: '',
        manager: '',
        total_budget: '',
        budget_hours: '',
        start_date: '',
        original_completion_date: '',
        estimated_completion_date: '',
        status_notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/reporting/projects`);
            const data = await res.json();
            setProjects(data);
            if (selectedProject) {
                const updated = data.find((p: Project) => p.id === selectedProject.id);
                if (updated) setSelectedProject(updated);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedProject]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSaveEvent = async () => {
        if (!selectedProject || !eventForm.title) return;
        setIsSubmitting(true);
        try {
            const isEditing = editingEventId !== null;
            const url = isEditing
                ? `${API_BASE_URL}/reporting/events/${editingEventId}`
                : `${API_BASE_URL}/reporting/projects/${selectedProject.id}/events`;

            const res = await fetch(url, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...eventForm,
                    category: eventForm.event_type === 'expense' ? eventForm.category : null,
                    amount: (eventForm.event_type === 'payment' || eventForm.event_type === 'expense') ? parseFloat(eventForm.amount) : null
                })
            });

            if (res.ok) {
                await fetchProjects();
                setIsAddingEvent(false);
                setEditingEventId(null);
                setEventForm({
                    title: '',
                    date: new Date().toISOString().split('T')[0],
                    event_type: 'milestone',
                    category: 'materiales',
                    amount: ''
                });
            }
        } catch (err) {
            console.error('Error saving event:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedProject || !selectedFile) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch(`${API_BASE_URL}/reporting/projects/${selectedProject.id}/upload`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                await fetchProjects();
                setIsAddingMedia(false);
                setSelectedFile(null);
            }
        } catch (err) {
            console.error('Error uploading file:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateProject = async () => {
        if (!projectForm.name) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/reporting/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: projectForm.name,
                    location: projectForm.location || null,
                    manager: projectForm.manager || null,
                    total_budget: projectForm.total_budget ? parseFloat(projectForm.total_budget) : null,
                    budget_hours: projectForm.budget_hours ? parseFloat(projectForm.budget_hours) : 0,
                    start_date: projectForm.start_date || null,
                    original_completion_date: projectForm.original_completion_date || null,
                    estimated_completion_date: projectForm.estimated_completion_date || null,
                    status_notes: projectForm.status_notes || null
                })
            });

            if (res.ok) {
                await fetchProjects();
                setIsCreatingProject(false);
                setProjectForm({
                    name: '',
                    location: '',
                    manager: '',
                    total_budget: '',
                    budget_hours: '',
                    start_date: '',
                    original_completion_date: '',
                    estimated_completion_date: '',
                    status_notes: ''
                });
            }
        } catch (err) {
            console.error('Error creating project:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (event: ProjectEvent) => {
        setEditingEventId(event.id);
        setEventForm({
            title: event.title,
            date: new Date(event.date).toISOString().split('T')[0],
            event_type: event.event_type,
            category: event.category || 'materials',
            amount: event.amount?.toString() || ''
        });
        setIsAddingEvent(true);
    };

    const getStatusInfo = (project: Project) => {
        const percent = (project.actual_hours / (project.budget_hours || 1)) * 100;
        if (project.status_notes?.toLowerCase().includes('delayed')) {
            return { color: 'bg-red-500', icon: AlertCircle, label: 'Delayed' };
        }
        if (percent > 95) {
            return { color: 'bg-yellow-500', icon: Clock, label: 'Near Budget' };
        }
        return { color: 'bg-green-500', icon: CheckCircle2, label: 'On Track' };
    };

    const calculateVariance = (p: Project) => {
        if (!p.original_completion_date || !p.estimated_completion_date) return null;
        const org = new Date(p.original_completion_date);
        const est = new Date(p.estimated_completion_date);
        const diffTime = est.getTime() - org.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="space-y-6 animate-fadeIn relative pb-20">
            {/* Header / Stats Overlay */}
            <div className="flex justify-between items-center bg-dark-lighter p-4 rounded-xl border border-white border-opacity-10">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Map size={20} className="text-primary-500" />
                    <span>Project Performance Map</span>
                </h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsCreatingProject(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        <span>Add New Project</span>
                    </button>
                    <div className="flex space-x-4">
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            <span className="text-gray-400">Delayed</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="text-gray-400">On Track</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Interactive Layer */}
            <div className="glass p-8 relative overflow-hidden bg-gradient-to-br from-dark-lighter to-dark min-h-[400px]">
                {isLoading && projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
                        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                        <p className="text-gray-400 animate-pulse">Loading project coordinates...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {projects.map((project) => {
                            const status = getStatusInfo(project);
                            return (
                                <div
                                    key={project.id}
                                    onClick={() => {
                                        setSelectedProject(project);
                                        setActiveModalTab('general');
                                    }}
                                    className="glass p-5 group cursor-pointer hover:border-primary-500 transition-all transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${status.color} bg-opacity-20`}>
                                            <MapPin className={status.color.replace('bg-', 'text-')} size={24} />
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${status.color} bg-opacity-10 ${status.color.replace('bg-', 'text-')}`}>
                                            {status.label}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-lg group-hover:text-primary-400 transition-colors uppercase">{project.name}</h4>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                                        <Navigation size={12} />
                                        <span>{project.location || 'Remote Site'}</span>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Utilization</span>
                                            <span className="text-gray-300 font-mono">
                                                {Math.round((project.actual_hours / (project.budget_hours || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${status.color} transition-all duration-1000`}
                                                style={{ width: `${Math.min((project.actual_hours / (project.budget_hours || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Project Details Panel (The "Deep Dive" Modal) */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="glass w-full max-w-4xl overflow-hidden shadow-2xl border-white/20 animate-slideUp flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{selectedProject.name}</h3>
                                <p className="text-primary-400 text-sm flex items-center mt-1">
                                    <MapPin size={14} className="mr-1" />
                                    {selectedProject.location}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedProject(null);
                                    setIsAddingEvent(false);
                                    setIsAddingMedia(false);
                                    setEditingEventId(null);
                                }}
                                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex bg-white/5 border-b border-white/10 px-6 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'general', label: 'Overview', icon: User },
                                { id: 'timeline', label: 'Timeline', icon: Calendar },
                                { id: 'history', label: 'History', icon: History },
                                { id: 'media', label: 'Gallery', icon: ImageIcon }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveModalTab(tab.id as any);
                                        setIsAddingEvent(false);
                                        setIsAddingMedia(false);
                                        setEditingEventId(null);
                                    }}
                                    className={`flex items-center space-x-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeModalTab === tab.id
                                        ? 'border-primary-500 text-primary-400 bg-primary-500/5'
                                        : 'border-transparent text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    <tab.icon size={14} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Modal Body */}
                        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                            {activeModalTab === 'general' && (
                                <div className="space-y-8 animate-fadeIn">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Project Manager</label>
                                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                                                    <User size={16} className="text-primary-400" />
                                                </div>
                                                <span className="font-semibold">{selectedProject.manager || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Financial Budget</label>
                                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                                    <DollarSign size={16} className="text-green-400" />
                                                </div>
                                                <span className="font-semibold text-green-400">
                                                    {selectedProject.total_budget ? `$${Number(selectedProject.total_budget).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl bg-primary-500/5 border border-primary-500/20 relative overflow-hidden">
                                        <div className="relative z-10 flex items-start space-x-4">
                                            <div className="p-2 bg-primary-500/20 rounded-lg">
                                                <AlertCircle className="text-primary-400" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-primary-200 uppercase mb-2">Status Intelligence</h4>
                                                <p className="text-gray-300 leading-relaxed italic">
                                                    "{selectedProject.status_notes || 'Project status is currently within normal operating parameters.'}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModalTab === 'timeline' && (
                                <div className="space-y-8 animate-fadeIn">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Start Date</p>
                                            <p className="text-sm font-semibold">{selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Target End</p>
                                            <p className="text-sm font-semibold text-gray-400">{selectedProject.original_completion_date ? new Date(selectedProject.original_completion_date).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current Forecast</p>
                                            <p className="text-sm font-semibold text-primary-400">{selectedProject.estimated_completion_date ? new Date(selectedProject.estimated_completion_date).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-white/5 rounded-full">
                                                <TrendingUp size={24} className="text-primary-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold uppercase">Schedule Variance</h4>
                                                <p className="text-2xl font-black">
                                                    {calculateVariance(selectedProject) === 0 ? 'On Schedule' : (
                                                        <>
                                                            {Math.abs(calculateVariance(selectedProject) || 0)}
                                                            <span className="text-xs font-normal ml-2 uppercase text-gray-500">
                                                                Days {calculateVariance(selectedProject)! > 0 ? 'Behind' : 'Ahead'}
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModalTab === 'history' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Event Audit Trail</h4>
                                        <button
                                            onClick={() => {
                                                setIsAddingEvent(!isAddingEvent);
                                                setEditingEventId(null);
                                                setEventForm({
                                                    title: '',
                                                    date: new Date().toISOString().split('T')[0],
                                                    event_type: 'milestone',
                                                    category: 'materiales',
                                                    amount: ''
                                                });
                                            }}
                                            className="flex items-center space-x-2 text-[10px] font-bold py-1.5 px-3 bg-primary-600 hover:bg-primary-500 rounded transition-all text-white"
                                        >
                                            <Plus size={14} />
                                            <span>{isAddingEvent ? 'CANCEL' : 'ADD EVENT'}</span>
                                        </button>
                                    </div>

                                    {isAddingEvent && (
                                        <div className="p-4 bg-white/5 border border-primary-500/30 rounded-xl space-y-4 animate-slideDown">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Event Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Bank Inspection"
                                                        className="w-full bg-dark-lighter border border-white/10 rounded-lg p-2 text-sm focus:border-primary-500 outline-none"
                                                        value={eventForm.title}
                                                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-gray-500 uppercase font-bold text-center">Event Type</label>
                                                    <select
                                                        className="w-full bg-dark-lighter border border-white/10 rounded-lg p-2 text-sm focus:border-primary-500 outline-none"
                                                        value={eventForm.event_type}
                                                        onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                                                    >
                                                        <option value="milestone">Milestone</option>
                                                        <option value="inspection">Inspection</option>
                                                        <option value="payment">Bank/Client Advance (+)</option>
                                                        <option value="expense">Project Expense (-)</option>
                                                    </select>
                                                </div>
                                                {eventForm.event_type === 'expense' && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Category</label>
                                                        <select
                                                            className="w-full bg-dark-lighter border border-white/10 rounded-lg p-2 text-sm focus:border-primary-500 outline-none"
                                                            value={eventForm.category}
                                                            onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                                                        >
                                                            <option value="materials">Materials</option>
                                                            <option value="payroll">Payroll</option>
                                                            <option value="equipment">Equipment</option>
                                                            <option value="administration">Administration</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                )}
                                                <div className={`space-y-1 ${['payment', 'expense'].includes(eventForm.event_type) ? 'col-span-1' : 'col-span-2'}`}>
                                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full bg-dark-lighter border border-white/10 rounded-lg p-2 text-sm focus:border-primary-500 outline-none"
                                                        value={eventForm.date}
                                                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                                    />
                                                </div>
                                                {['payment', 'expense'].includes(eventForm.event_type) && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold">
                                                            {eventForm.event_type === 'expense' ? 'Expense Amount ($)' : 'Advance Amount ($)'}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="w-full bg-dark-lighter border border-white/10 rounded-lg p-2 text-sm focus:border-primary-500 outline-none"
                                                            value={eventForm.amount}
                                                            onChange={(e) => setEventForm({ ...eventForm, amount: e.target.value })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => { setIsAddingEvent(false); setEditingEventId(null); }} className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-all">Cancel</button>
                                                <button
                                                    disabled={isSubmitting || !eventForm.title}
                                                    onClick={handleSaveEvent}
                                                    className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    <Save size={14} />
                                                    <span>{isSubmitting ? 'SAVING...' : editingEventId ? 'UPDATE EVENT' : 'SAVE EVENT'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="block relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                                        {selectedProject.events.length > 0 ? selectedProject.events
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map(event => (
                                                <div key={event.id} className="relative group">
                                                    <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-[#1e293b] flex items-center justify-center z-10
                                                    ${event.event_type === 'inspection' ? 'bg-blue-500' :
                                                            event.event_type === 'payment' ? 'bg-green-500' :
                                                                event.event_type === 'expense' ? 'bg-red-500 animate-pulse border-red-500/50' :
                                                                    'bg-primary-500'}`}>
                                                    </div>
                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-all flex justify-between items-center mr-4">
                                                        <div>
                                                            <div className="flex items-center space-x-3">
                                                                <h4 className="font-bold text-sm text-white">{event.title}</h4>
                                                                <div className="flex items-center space-x-2">
                                                                    {event.category && (
                                                                        <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 uppercase font-bold tracking-wider">
                                                                            {event.category}
                                                                        </span>
                                                                    )}
                                                                    {event.amount && (
                                                                        <span className={`text-xs font-bold ${event.event_type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                                                            {event.event_type === 'expense' ? '-' : '+'}${Number(event.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="text-[10px] text-gray-500 font-mono italic">{new Date(event.date).toLocaleDateString()}</span>
                                                                <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-gray-400 uppercase">{event.event_type}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => startEditing(event)}
                                                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/5 rounded-lg text-gray-500 hover:text-primary-400 transition-all"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : (
                                            <div className="text-center py-10 text-gray-500 italic text-sm">No historical events recorded yet.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeModalTab === 'media' && (
                                <div className="space-y-10 animate-fadeIn">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Digital Assets Repository</h4>
                                        <button
                                            onClick={() => setIsAddingMedia(!isAddingMedia)}
                                            className="flex items-center space-x-2 text-[10px] font-bold py-1.5 px-3 bg-primary-600 hover:bg-primary-500 rounded transition-all text-white shadow-lg shadow-primary-500/10"
                                        >
                                            <Upload size={14} />
                                            <span>{isAddingMedia ? 'CANCEL UPLOAD' : 'UPLOAD FROM DEVICE'}</span>
                                        </button>
                                    </div>

                                    {isAddingMedia && (
                                        <div className="p-8 bg-white/5 border-2 border-dashed border-primary-500/30 rounded-2xl space-y-6 animate-slideDown text-center">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                            />

                                            {!selectedFile ? (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="cursor-pointer group space-y-3"
                                                >
                                                    <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary-500/20 transition-all">
                                                        <Upload className="text-primary-500" size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold uppercase tracking-wider">Select file to contribute</p>
                                                    <p className="text-xs text-gray-500">Supports JPG, PNG, PDF, DOC (Max 10MB)</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-center space-x-4 bg-dark p-4 rounded-xl border border-white/5">
                                                        <div className="p-3 bg-primary-500/20 rounded-lg">
                                                            {selectedFile.type.startsWith('image/') ? <ImageIcon className="text-primary-500" /> : <FileText className="text-primary-500" />}
                                                        </div>
                                                        <div className="text-left overflow-hidden">
                                                            <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown Type'}</p>
                                                        </div>
                                                        <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-red-400">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-center space-x-3">
                                                        <button onClick={() => setIsAddingMedia(false)} className="px-6 py-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest">Cancel</button>
                                                        <button
                                                            disabled={isSubmitting}
                                                            onClick={handleFileUpload}
                                                            className="flex items-center space-x-2 px-8 py-2 bg-primary-600 hover:bg-primary-500 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                                                        >
                                                            <Check size={16} />
                                                            <span>{isSubmitting ? 'UPLOADING...' : 'SAVE TO BACKEND SERVER'}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Photos Grid */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                                            <ImageIcon size={14} className="mr-2" /> Site Progress Photos
                                        </h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            {selectedProject.media.filter(m => m.file_type === 'image').map(img => (
                                                <div
                                                    key={img.id}
                                                    onClick={() => setSelectedImage(img.url.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${img.url}` : img.url)}
                                                    className="relative group overflow-hidden rounded-xl border border-white/10 aspect-video bg-white/5 cursor-pointer"
                                                >
                                                    <img
                                                        src={img.url.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${img.url}` : img.url}
                                                        alt={img.filename}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                        <p className="text-white text-[10px] font-bold truncate">{img.filename}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Documents List */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                                            <FileText size={14} className="mr-2" /> Associated Documents
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedProject.media.filter(m => m.file_type === 'document').map(doc => (
                                                <a
                                                    key={doc.id}
                                                    href={doc.url.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${doc.url}` : doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group"
                                                >
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <div className="p-2 bg-red-500/10 rounded flex-shrink-0">
                                                            <FileText size={18} className="text-red-400" />
                                                        </div>
                                                        <span className="text-sm font-semibold truncate">{doc.filename}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 group-hover:text-primary-400 flex-shrink-0 ml-2">OPEN →</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end">
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-primary-500/20"
                            >
                                CLOSE INSPECTION
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-3 hover:bg-white/10 rounded-full text-white transition-all z-10"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size preview"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Create Project Modal */}
            {isCreatingProject && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setIsCreatingProject(false)}>
                    <div className="glass p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center space-x-2">
                                <Plus className="text-primary-500" />
                                <span>Create New Project</span>
                            </h3>
                            <button onClick={() => setIsCreatingProject(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Project Name *</label>
                                <input
                                    type="text"
                                    value={projectForm.name}
                                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={projectForm.location}
                                        onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Project location"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">Project Manager</label>
                                    <input
                                        type="text"
                                        value={projectForm.manager}
                                        onChange={(e) => setProjectForm({ ...projectForm, manager: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Manager name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">Total Budget ($)</label>
                                    <input
                                        type="number"
                                        value={projectForm.total_budget}
                                        onChange={(e) => setProjectForm({ ...projectForm, total_budget: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">Budget Hours</label>
                                    <input
                                        type="number"
                                        value={projectForm.budget_hours}
                                        onChange={(e) => setProjectForm({ ...projectForm, budget_hours: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={projectForm.start_date}
                                        onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">Original Completion</label>
                                    <input
                                        type="date"
                                        value={projectForm.original_completion_date}
                                        onChange={(e) => setProjectForm({ ...projectForm, original_completion_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">Estimated Completion</label>
                                    <input
                                        type="date"
                                        value={projectForm.estimated_completion_date}
                                        onChange={(e) => setProjectForm({ ...projectForm, estimated_completion_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Status Notes</label>
                                <textarea
                                    value={projectForm.status_notes}
                                    onChange={(e) => setProjectForm({ ...projectForm, status_notes: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows={3}
                                    placeholder="Project status or notes..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setIsCreatingProject(false)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateProject}
                                    disabled={!projectForm.name || isSubmitting}
                                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <Save size={18} />
                                    <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reporting;
