import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../../api/invoices';
import { clientsApi } from '../../api/clients';
import { projectsApi } from '../../api/projects';
import {
    ArrowLeft,
    Save,
    Loader2,
    Plus,
    Trash2,
    User,
    Briefcase,
    Calendar,
    Clock,
    Calculator,
    Percent
} from 'lucide-react';
import { cn } from '../../utils/cn';

const invoiceItemSchema = z.object({
    description: z.string().min(1, 'Description required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unit_price: z.number().min(0, 'Price must be positive'),
});

const invoiceSchema = z.object({
    client: z.number({ required_error: 'Client is required' }),
    project: z.number().optional().nullable(),
    issue_date: z.string().min(1, 'Issue date is required'),
    due_date: z.string().min(1, 'Due date is required'),
    tax_rate: z.number().min(0).max(100).default(0),
    notes: z.string().optional(),
    terms: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export default function InvoiceFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: clientsData } = useQuery({ queryKey: ['clients-list'], queryFn: () => clientsApi.list() });
    const { data: projectsData } = useQuery({ queryKey: ['projects-list'], queryFn: () => projectsApi.list() });
    const { data: invoice, isLoading: isFetching } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoicesApi.get(parseInt(id)),
        enabled: isEdit,
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            items: [{ description: '', quantity: 1, unit_price: 0 }],
            tax_rate: 0,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        if (invoice) {
            reset({
                client: invoice.client,
                project: invoice.project,
                issue_date: invoice.issue_date,
                due_date: invoice.due_date,
                tax_rate: parseFloat(invoice.tax_rate),
                notes: invoice.notes || '',
                terms: invoice.terms || '',
                items: invoice.items?.map(item => ({
                    description: item.description,
                    quantity: parseFloat(item.quantity),
                    unit_price: parseFloat(item.unit_price),
                })) || [{ description: '', quantity: 1, unit_price: 0 }],
            });
        }
    }, [invoice, reset]);

    const items = watch('items');
    const taxRate = watch('tax_rate');

    const totals = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unit_price || 0)), 0);
        const taxAmount = (subtotal * (taxRate || 0)) / 100;
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    }, [items, taxRate]);

    const mutation = useMutation({
        mutationFn: (data) =>
            isEdit
                ? invoicesApi.update(parseInt(id), data)
                : invoicesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            if (isEdit) queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            navigate('/invoices');
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
            <div className="h-[800px] bg-card rounded-xl border border-border" />
        </div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link
                    to={isEdit ? `/invoices/${id}` : '/invoices'}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Invoice' : 'New Invoice'}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {isEdit ? 'Update billing details and items.' : 'Create a professional invoice for your work.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Header Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-bold text-sm">Recipient & Project</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    Client *
                                </label>
                                <select
                                    {...register('client', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                >
                                    <option value="">Choose a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.client && <p className="text-[10px] text-destructive">{errors.client.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" />
                                    Link to Project (Optional)
                                </label>
                                <select
                                    {...register('project', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                >
                                    <option value="">No Project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-bold text-sm">Dates & Terms</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    Issue Date
                                </label>
                                <input
                                    type="date"
                                    {...register('issue_date')}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    {...register('due_date')}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                        <h3 className="font-bold text-sm">Line Items</h3>
                        <button
                            type="button"
                            onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                            Add Item
                        </button>
                    </div>

                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/10 border-b border-border">
                                    <th className="px-6 py-3 text-[10px] font-black uppercase text-muted-foreground">Description</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground w-24">Qty</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground w-32">Price</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground w-32">Total</th>
                                    <th className="px-4 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {fields.map((field, index) => (
                                    <tr key={field.id} className="group hover:bg-muted/5">
                                        <td className="px-6 py-3">
                                            <input
                                                {...register(`items.${index}.description`)}
                                                placeholder="Project Management, Dev hours, etc."
                                                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
                                            />
                                            {errors.items?.[index]?.description && (
                                                <p className="text-[10px] text-destructive mt-1">{errors.items[index]?.description?.message}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                className="w-full bg-transparent outline-none text-sm font-medium"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                                                className="w-full bg-transparent outline-none font-mono"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-bold text-sm">
                                            ₹{((items[index]?.quantity || 0) * (items[index]?.unit_price || 0)).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer: Notes & Totals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Notes</label>
                            <textarea
                                {...register('notes')}
                                rows={3}
                                placeholder="Message displayed on the invoice..."
                                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm outline-none h-24 resize-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Terms & Conditions</label>
                            <textarea
                                {...register('terms')}
                                rows={2}
                                placeholder="E.g. Payment due within 15 days..."
                                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm outline-none h-20 resize-none"
                            />
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-xl p-8 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold">₹{totals.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Tax Rate</span>
                                    <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded border border-border">
                                        <input
                                            type="number"
                                            {...register('tax_rate', { valueAsNumber: true })}
                                            className="w-10 bg-transparent outline-none text-xs font-bold text-center"
                                        />
                                        <Percent className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                </div>
                                <span className="font-bold text-destructive">+ ₹{totals.taxAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-border flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Grand Total</p>
                                <p className="text-3xl font-black text-primary">₹{totals.total.toLocaleString()}</p>
                            </div>
                            <Calculator className="w-8 h-8 text-primary opacity-20" />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isEdit ? 'Update Invoice' : 'Generate Invoice'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
