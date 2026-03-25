import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '../../api/contracts';
import { clientsApi } from '../../api/clients';
import { projectsApi } from '../../api/projects';
import {
    ArrowLeft,
    Save,
    Loader2,
    User,
    Briefcase,
    FileText,
    Type
} from 'lucide-react';
import { cn } from '../../utils/cn';

const contractSchema = z.object({
    client: z.number({ required_error: 'Client is required' }),
    project: z.number().optional().nullable(),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    content: z.string().min(20, 'Agreement content is too short'),
});

export default function ContractFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: clientsData } = useQuery({ queryKey: ['clients-list'], queryFn: () => clientsApi.list() });
    const { data: projectsData } = useQuery({ queryKey: ['projects-list'], queryFn: () => projectsApi.list() });
    const { data: contract, isLoading: isFetching } = useQuery({
        queryKey: ['contract', id],
        queryFn: () => contractsApi.get(parseInt(id)),
        enabled: isEdit,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            content: `This Independent Contractor Agreement ("Agreement") is made and entered into as of the date signed, between the Freelancer and the Client.\n\n1. SERVICES PROVIDED\nFreelancer agrees to perform the following services for Client...\n\n2. PAYMENT TERMS\nClient shall pay freelancer as follows...\n\n3. INTELLECTUAL PROPERTY\nAll work product created by Freelancer under this Agreement shall belong to Client upon full payment...\n\n4. CONFIDENTIALITY\nBoth parties agree to keep all project information confidential...`,
        },
    });

    useEffect(() => {
        if (!isEdit) {
            const clientId = searchParams.get('client');
            const projectId = searchParams.get('project');
            if (clientId || projectId) {
                reset({
                    client: clientId ? parseInt(clientId) : undefined,
                    project: projectId ? parseInt(projectId) : undefined,
                });
            }
        }
    }, [isEdit, searchParams, reset]);

    useEffect(() => {
        if (contract) {
            reset({
                client: contract.client,
                project: contract.project,
                title: contract.title,
                content: contract.content,
            });
        }
    }, [contract, reset]);

    const mutation = useMutation({
        mutationFn: (data) =>
            isEdit
                ? contractsApi.update(parseInt(id), data)
                : contractsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            if (isEdit) queryClient.invalidateQueries({ queryKey: ['contract', id] });
            navigate('/contracts');
        },
        onError: () => {
            setIsSubmitting(false);
            alert('An error occurred. Please try again.');
        }
    });

    const onSubmit = (data) => {
        setIsSubmitting(true);
        mutation.mutate(data);
    };

    const clients = clientsData?.results || [];
    const projects = projectsData?.results || [];

    if (isEdit && isFetching) {
        return <div className="animate-pulse space-y-8 p-8">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-[700px] bg-card rounded-xl border border-border" />
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link
                    to={isEdit ? `/contracts/${id}` : '/contracts'}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Contract' : 'New Agreement'}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {isEdit ? 'Modify terms for this client agreement.' : 'Draft a new legally binding contract for your projects.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-bold text-sm">Agreement Details</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    Client *
                                </label>
                                <select
                                    {...register('client', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                >
                                    <option value="">Select client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.client && <p className="text-[10px] text-destructive">{errors.client.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" />
                                    Project (Optional)
                                </label>
                                <select
                                    {...register('project', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                >
                                    <option value="">None</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                <Type className="w-3 h-3" />
                                Contract Title *
                            </label>
                            <input
                                {...register('title')}
                                placeholder="E.g. Website Design & Development Agreement"
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none"
                            />
                            {errors.title && <p className="text-[10px] text-destructive">{errors.title.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm">Agreement Content</h3>
                    </div>
                    <div className="p-6 flex-1">
                        <textarea
                            {...register('content')}
                            className="w-full h-full min-h-[400px] p-6 bg-muted/5 font-serif text-sm leading-relaxed outline-none border border-border rounded-lg resize-none"
                            placeholder="Write or paste your contract terms here..."
                        />
                        {errors.content && <p className="text-[10px] text-destructive mt-2">{errors.content.message}</p>}
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
                        {isEdit ? 'Update Agreement' : 'Save Agreement'}
                    </button>
                </div>
            </form>
        </div>
    );
}
