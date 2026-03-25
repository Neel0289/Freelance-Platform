import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects';
import {
    ArrowLeft,
    Clock,
    Plus,
    Calendar,
    DollarSign,
    Briefcase,
    CheckCircle2,
    Trash2,
    History,
    Pencil,
    FileText
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const timeEntrySchema = z.object({
    description: z.string().min(3, 'Description must be at least 3 characters'),
    hours: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid number of hours'),
    date: z.string().nonempty('Date is required'),
    billable: z.boolean().default(true),
});

export default function ProjectDetailPage() {
    const { id } = useParams();
    const projectId = parseInt(id || '0');
    const queryClient = useQueryClient();
    const [showTimeModal, setShowTimeModal] = useState(false);

    const { data: project, isLoading: isProjectLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectsApi.get(projectId),
        enabled: !!projectId,
    });

    const { data: timeEntries, isLoading: isEntriesLoading } = useQuery({
        queryKey: ['project-time', projectId],
        queryFn: () => projectsApi.getTimeEntries(projectId),
        enabled: !!projectId,
    });

    const addTimeMutation = useMutation({
        mutationFn: (data) => projectsApi.addTimeEntry(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['project-time', projectId] });
            setShowTimeModal(false);
            reset();
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(timeEntrySchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            billable: true,
        },
    });

    if (isProjectLoading) {
        return <div className="animate-pulse space-y-8 p-8">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-xl border border-border" />)}
            </div>
            <div className="h-96 bg-card rounded-xl border border-border" />
        </div>;
    }

    if (!project) return <div className="p-8 text-center text-muted-foreground">Project not found</div>;

    const statusColors = {
        ACCEPTED: "bg-purple-100/10 text-purple-500 border-purple-500/20",
        ACTIVE: "bg-blue-100/10 text-blue-500 border-blue-500/20",
        COMPLETED: "bg-green-100/10 text-green-500 border-green-500/20",
        PAUSED: "bg-yellow-100/10 text-yellow-500 border-yellow-500/20",
        ARCHIVED: "bg-muted text-muted-foreground",
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/projects"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight text-[#F5F5F5]">{project.title}</h1>
                            <span className={cn(
                                "text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border",
                                statusColors[project.status] || "bg-muted text-muted-foreground"
                            )}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-sm text-[#A0A0A0] mt-1 font-medium">
                            Client: <Link to={`/clients/${project.client}`} className="text-primary hover:underline">{project.client_name}</Link>
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/projects/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[#222222] bg-[#111111] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A1A] transition-all"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Project
                    </Link>
                    <button
                        onClick={() => setShowTimeModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Log Time
                    </button>
                </div>
            </div>

            {/* Project Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#111111] p-8 rounded-2xl border border-[#222222] shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#555555] mb-4">Project Overview</h3>
                        <p className="text-[#A0A0A0] whitespace-pre-wrap leading-relaxed">
                            {project.description || 'No description provided for this project.'}
                        </p>
                    </div>

                    {/* Time Tracking Section */}
                    <div className="bg-[#111111] border border-[#222222] rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#222222] bg-[#1A1A1A]/30 flex justify-between items-center">
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                Time & Activity Logs
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#161616] text-[10px] font-black uppercase tracking-widest text-[#555555] border-b border-[#222222]">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Hours</th>
                                        <th className="px-6 py-4 text-right">Label</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#222222]">
                                    {isEntriesLoading ? (
                                        [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-6 py-8"><div className="h-6 bg-[#1A1A1A] rounded" /></td></tr>)
                                    ) : timeEntries && timeEntries.length > 0 ? (
                                        timeEntries.map((entry) => (
                                            <tr key={entry.id} className="text-sm hover:bg-[#1A1A1A] transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-[#555555] font-bold text-xs uppercase tabular-nums">
                                                    {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-[#F5F5F5]">
                                                    {entry.description}
                                                </td>
                                                <td className="px-6 py-4 font-black tabular-nums">
                                                    {entry.hours}h
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {entry.billable ? (
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-green-100/10 text-green-500 uppercase tracking-tighter">Billable</span>
                                                    ) : (
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-tighter">Non-Billable</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center text-[#555555]">
                                                <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                <p className="text-xs font-bold uppercase tracking-widest">No hours logged yet</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-sm space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#555555] mb-5">Financial Summary</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center tabular-nums">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#A0A0A0] uppercase tracking-wide">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        Total Budget
                                    </div>
                                    <span className="font-black text-sm text-[#F5F5F5]">{project.currency} {parseFloat(project.budget).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center tabular-nums">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#A0A0A0] uppercase tracking-wide">
                                        <Clock className="w-3.5 h-3.5" />
                                        Logged Hours
                                    </div>
                                    <span className="font-black text-sm text-[#F5F5F5]">{project.total_hours} Hours</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-[#222222]">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#555555] mb-5">Timeline & Status</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#A0A0A0] uppercase tracking-wide">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Deadline
                                    </div>
                                    <span className="font-bold text-xs uppercase tracking-tight text-[#F5F5F5]">
                                        {project.due_date ? new Date(project.due_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'NOT SET'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#A0A0A0] uppercase tracking-wide">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Progress
                                    </div>
                                    <span className="font-bold text-xs uppercase text-[#F5F5F5]">
                                        {project.status === 'COMPLETED' ? '100% COMPLETE' : 'IN PROGRESS'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-[#222222] flex flex-col gap-3">
                            {project.status === 'ACCEPTED' && (
                                <>
                                    {project.contract_status ? (
                                        <div className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#222222] rounded-xl shadow-inner">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-green-500/10 rounded-lg">
                                                    <FileText className="w-3.5 h-3.5 text-green-500" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#555555]">Contract Sent</span>
                                            </div>
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-green-500 text-white uppercase tracking-tighter shadow-lg shadow-green-500/20">
                                                {project.contract_status}
                                            </span>
                                        </div>
                                    ) : (
                                        <Link 
                                            to={`/contracts/new?client=${project.client}&project=${project.id}`}
                                            className="w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            Create Contract
                                        </Link>
                                    )}

                                    {project.invoice_status ? (
                                        <div className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#222222] rounded-xl shadow-inner">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                    <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#555555]">Invoice Sent</span>
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg",
                                                project.invoice_status === 'PAID' ? "bg-green-500 text-white shadow-green-500/20" : "bg-blue-500 text-white shadow-blue-500/20"
                                            )}>
                                                {project.invoice_status === 'SENT' || project.invoice_status === 'OVERDUE' ? 'PENDING' : 
                                                 project.invoice_status === 'PAID' ? 'PAYMENT' : project.invoice_status}
                                            </span>
                                        </div>
                                    ) : (
                                        <Link 
                                            to={`/invoices/new?client=${project.client}&project=${project.id}&amount=${project.budget}`}
                                            className="w-full py-3 bg-[#1A1A1A] text-[#F5F5F5] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-[#222222] border border-[#222222] flex items-center justify-center gap-2"
                                        >
                                            <DollarSign className="w-3.5 h-3.5" />
                                            Create Invoice
                                        </Link>
                                    )}
                                </>
                            )}
                            <button className="w-full py-3 bg-[#161616] hover:bg-[#1A1A1A] text-[10px] font-black uppercase tracking-widest text-[#555555] hover:text-[#A0A0A0] rounded-xl transition-all border border-[#222222]">
                                Manage Documents
                            </button>
                            <button className="w-full py-3 text-[#EF4444] hover:bg-[#EF44440A] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 mt-4 opacity-50 hover:opacity-100">
                                <Trash2 className="w-3.5 h-3.5" />
                                Archive Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Entry Modal */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#111111] w-full max-w-md rounded-2xl shadow-2xl border border-[#222222] p-8 animate-in zoom-in-95 fill-mode-forwards duration-200">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-4 h-4 text-primary" />
                            <h3 className="text-base font-black uppercase tracking-widest text-[#F5F5F5]">Log Working Hours</h3>
                        </div>
                        <form onSubmit={handleSubmit((data) => addTimeMutation.mutate(data))} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#555555] ml-1">Activity Description</label>
                                <textarea
                                    {...register('description')}
                                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#F5F5F5] outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                                    placeholder="Briefly describe what you worked on..."
                                />
                                {errors.description && <p className="text-[10px] text-destructive font-bold uppercase tracking-tight">{errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#555555] ml-1">Hours Spent</label>
                                    <input
                                        {...register('hours')}
                                        type="text"
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#F5F5F5] outline-none focus:border-primary/50 transition-all tabular-nums"
                                        placeholder="0.0"
                                    />
                                    {errors.hours && <p className="text-[10px] text-destructive font-bold uppercase tracking-tight">{errors.hours.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#555555] ml-1">Service Date</label>
                                    <input
                                        {...register('date')}
                                        type="date"
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#F5F5F5] outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                                    />
                                    {errors.date && <p className="text-[10px] text-destructive font-bold uppercase tracking-tight">{errors.date.message}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-[#1A1A1A]/50 rounded-xl border border-[#222222]">
                                <input
                                    {...register('billable')}
                                    type="checkbox"
                                    id="billable"
                                    className="w-4 h-4 text-primary bg-[#0A0A0A] border-[#222222] rounded focus:ring-0 focus:ring-offset-0"
                                />
                                <label htmlFor="billable" className="text-xs font-bold text-[#A0A0A0] cursor-pointer">This entry is billable to client</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowTimeModal(false)}
                                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#555555] hover:text-[#F5F5F5] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addTimeMutation.isPending}
                                    className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {addTimeMutation.isPending ? 'Processing...' : 'Save Analytics'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
