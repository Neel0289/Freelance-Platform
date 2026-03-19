import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../api/clients';
import {
    ArrowLeft,
    Save,
    Loader2,
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    Coins,
    FileText
} from 'lucide-react';
import { cn } from '../../utils/cn';

const clientSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    currency: z.string().default('INR'),
    notes: z.string().optional(),
});

export default function ClientFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: client, isLoading: isFetching } = useQuery({
        queryKey: ['client', id],
        queryFn: () => clientsApi.get(parseInt(id)),
        enabled: isEdit,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            currency: 'INR',
        },
    });

    useEffect(() => {
        if (client) {
            reset({
                name: client.name,
                email: client.email,
                phone: client.phone || '',
                company: client.company || '',
                address: client.address || '',
                currency: client.currency || 'INR',
                notes: client.notes || '',
            });
        }
    }, [client, reset]);

    const mutation = useMutation({
        mutationFn: (data) =>
            isEdit
                ? clientsApi.update(parseInt(id), data)
                : clientsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            if (isEdit) queryClient.invalidateQueries({ queryKey: ['client', id] });
            navigate('/clients');
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

    if (isEdit && isFetching) {
        return <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-[500px] bg-card rounded-xl border border-border" />
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to={isEdit ? `/clients/${id}` : '/clients'}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Client' : 'Add New Client'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isEdit ? 'Update existing client information.' : 'Register a new client to start project management and billing.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-lg">Contact Information</h3>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                Full Name *
                            </label>
                            <input
                                {...register('name')}
                                placeholder="John Doe"
                                className={cn(
                                    "w-full px-3 py-2 bg-background border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.name ? "border-destructive" : "border-border"
                                )}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                Email Address *
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="john@example.com"
                                className={cn(
                                    "w-full px-3 py-2 bg-background border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                    errors.email ? "border-destructive" : "border-border"
                                )}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                Phone Number
                            </label>
                            <input
                                {...register('phone')}
                                placeholder="+91 98765 43210"
                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                Company / Organization
                            </label>
                            <input
                                {...register('company')}
                                placeholder="Acme Inc."
                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-lg">Billing & Additional Info</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                Billing Address
                            </label>
                            <textarea
                                {...register('address')}
                                rows={3}
                                placeholder="Enter street address, city, state, zip..."
                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                                    Default Currency
                                </label>
                                <select
                                    {...register('currency')}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                Internal Notes
                            </label>
                            <textarea
                                {...register('notes')}
                                rows={2}
                                placeholder="Any specific details about this client..."
                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            />
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
                        {isEdit ? 'Update Client' : 'Create Client'}
                    </button>
                </div>
            </form>
        </div>
    );
}
