import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects';
import { clientsApi } from '../../api/clients';
import {
    ArrowLeft,
    Save,
    Loader2,
    Briefcase,
    User,
    Calendar,
    ChevronDown,
    Coins,
    AlignLeft
} from 'lucide-react';
import { cn } from '../../utils/cn';

const projectSchema = z.object({
    client: z.number({ required_error: 'Client is required' }),
    title: z.string().min(3, 'Title is required'),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
    start_date: z.string().optional(),
    due_date: z.string().optional(),
    budget: z.string().optional(),
    currency: z.string().default('INR'),
});

export default function ProjectFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: clientsData } = useQuery({
        queryKey: ['clients-list'],
        queryFn: () => clientsApi.list(),
    });

    const { data: project, isLoading: isFetching } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectsApi.get(parseInt(id)),
        enabled: isEdit,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            status: 'ACTIVE',
            currency: 'INR',
        },
    });

    useEffect(() => {
        if (project) {
            reset({
                client: project.client,
                title: project.title,
                description: project.description || '',
                status: project.status,
                start_date: project.start_date || '',
                due_date: project.due_date || '',
                budget: project.budget || '',
                currency: project.currency || 'INR',
            });
        }
    }, [project, reset]);

    const mutation = useMutation({
        mutationFn: (data) =>
            isEdit
                ? projectsApi.update(parseInt(id), data)
                : projectsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            if (isEdit) queryClient.invalidateQueries({ queryKey: ['project', id] });
            navigate('/projects');
        },
        onError: () => {
            setIsSubmitting(false);
            alert('An error occurred. Please try again.');
        }
    });

    const onSubmit = (data) => {
        setIsSubmitting(true);
        // Clean up data: convert empty strings to null for dates and budget
        const cleanedData = {
            ...data,
            start_date: data.start_date || null,
            due_date: data.due_date || null,
            budget: data.budget === '' ? null : data.budget,
        };
        mutation.mutate(cleanedData);
    };

    const clients = clientsData?.results || [];

    if (isEdit && isFetching) {
        return <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-[600px] bg-card rounded-xl border border-border" />
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to={isEdit ? `/projects/${id}` : '/projects'}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Project' : 'New Project'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isEdit ? 'Modify project timeline and budget.' : 'Kickstart a new project by assigning it to a client.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-lg">General Information</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                Select Client *
                            </label>
                            <div className="relative">
                                <select
                                    {...register('client', { valueAsNumber: true })}
                                    className={cn(
                                        "w-full px-3 py-2 bg-background border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none",
                                        errors.client ? "border-destructive" : "border-border"
                                    )}
                                >
                                    <option value="">Choose a client...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                            {errors.client && <p className="text-xs text-destructive">{errors.client.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                                Project Title *
                            </label>
                            <input
                                {...register('title')}
                                placeholder="E.g. Website Redesign"
                                className={cn(
                                    "w-full px-3 py-2 bg-background border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.title ? "border-destructive" : "border-border"
                                )}
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
                                Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                placeholder="Briefly describe the scope of work..."
                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-lg">Timeline & Status</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    Status
                                </label>
                                <div className="flex gap-2 p-1 bg-muted rounded-lg overflow-x-auto whitespace-nowrap">
                                    {['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setValue('status', s)}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                                                watch('status') === s
                                                    ? "bg-card text-foreground shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                        Start Date
                                    </label>
                                    <input
                                        {...register('start_date')}
                                        type="date"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                        Due Date
                                    </label>
                                    <input
                                        {...register('due_date')}
                                        type="date"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-lg">Budgeting</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                                    Budget Amount
                                </label>
                                <div className="flex">
                                    <select
                                        {...register('currency')}
                                        className="px-3 py-2 bg-muted border border-border border-r-0 rounded-l-md outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-xs font-bold"
                                    >
                                        <option value="INR">₹</option>
                                        <option value="USD">$</option>
                                        <option value="EUR">€</option>
                                    </select>
                                    <input
                                        {...register('budget')}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-r-md outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Budgeting helps track profitability. You can later generate invoices directly from project time logs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 border border-border bg-card rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Update Project' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}
