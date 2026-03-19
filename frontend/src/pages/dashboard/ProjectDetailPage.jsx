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
    Pencil
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
        return <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-xl border border-border" />)}
            </div>
            <div className="h-96 bg-card rounded-xl border border-border" />
        </div>;
    }

    if (!project) return <div>Project not found</div>;

    const statusColors = {
        ACTIVE: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        PAUSED: "bg-yellow-100 text-yellow-700",
        ARCHIVED: "bg-muted text-muted-foreground",
    };

    return (
        <div className="space-y-8">
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
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                statusColors[project.status]
                            )}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Client: <Link to={`/clients/${project.client}`} className="text-primary hover:underline">{project.client_name}</Link>
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/projects/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit Project
                    </Link>
                    <button
                        onClick={() => setShowTimeModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
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
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {project.description || 'No description provided for this project.'}
                        </p>
                    </div>

                    {/* Time Tracking Section */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" />
                                Time Logs
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3">Hours</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isEntriesLoading ? (
                                        [1, 2].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-6 py-4"><div className="h-8 bg-muted rounded" /></td></tr>)
                                    ) : timeEntries && timeEntries.length > 0 ? (
                                        timeEntries.map((entry) => (
                                            <tr key={entry.id} className="text-sm hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                    {new Date(entry.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {entry.description}
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    {entry.hours}h
                                                </td>
                                                <td className="px-6 py-4">
                                                    {entry.billable ? (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">Billable</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">Non-Billable</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground opacity-50">
                                                No time logs found yet.
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
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Budget & Billing</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <DollarSign className="w-4 h-4" />
                                        Project Budget
                                    </div>
                                    <span className="font-bold">{project.currency} {project.budget}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        Total Logged
                                    </div>
                                    <span className="font-bold">{project.total_hours} Hours</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Project Stats</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        Due Date
                                    </div>
                                    <span className="font-medium text-sm">
                                        {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not Set'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Progress
                                    </div>
                                    <span className="font-medium text-sm">
                                        {project.status === 'COMPLETED' ? '100%' : 'In Progress'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border flex flex-col gap-2">
                            <button className="w-full py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors border border-border">
                                Manage Invoices
                            </button>
                            <button className="w-full py-2 text-destructive hover:bg-destructive/5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Archive Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Entry Modal */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border p-6 animate-in zoom-in-95 fill-mode-forwards duration-200">
                        <h3 className="text-xl font-bold mb-4">Log Time</h3>
                        <form onSubmit={handleSubmit((data) => addTimeMutation.mutate(data))} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Description</label>
                                <input
                                    {...register('description')}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="What did you work on?"
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Hours</label>
                                    <input
                                        {...register('hours')}
                                        type="text"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="2.5"
                                    />
                                    {errors.hours && <p className="text-xs text-destructive">{errors.hours.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Date</label>
                                    <input
                                        {...register('date')}
                                        type="date"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    {...register('billable')}
                                    type="checkbox"
                                    id="billable"
                                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20"
                                />
                                <label htmlFor="billable" className="text-sm font-medium">This entry is billable</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTimeModal(false)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addTimeMutation.isPending}
                                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {addTimeMutation.isPending ? 'Logging...' : 'Add Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
