import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Loader2, Phone, Globe } from 'lucide-react';
import { authApi } from '../../api/auth';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['FREELANCER', 'CLIENT']),
    phone: z.string().optional(),
    timezone: z.string().default('UTC'),
});

export default function RegisterPage() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'FREELANCER',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const payload = { ...data, password1: data.password, password2: data.password };
            delete payload.password;
            await authApi.register(payload);
            navigate('/auth/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            const data = err.response?.data;
            setError(
                data?.username?.[0] ||
                data?.email?.[0] ||
                data?.password1?.[0] ||
                data?.password2?.[0] ||
                data?.non_field_errors?.[0] ||
                'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Create an account</h2>
                <p className="text-sm text-muted-foreground">
                    Join Freelancer CRM to manage your business
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mb-4">
                    <button
                        type="button"
                        onClick={() => setValue('role', 'FREELANCER')}
                        className={`py-2 text-sm font-medium rounded-md transition-all ${selectedRole === 'FREELANCER'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Freelancer
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue('role', 'CLIENT')}
                        className={`py-2 text-sm font-medium rounded-md transition-all ${selectedRole === 'CLIENT'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Client
                    </button>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="username">
                        Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <UserIcon className="h-4 w-4" />
                        </div>
                        <input
                            {...register('username')}
                            id="username"
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="johndoe"
                            autoComplete="username"
                        />
                    </div>
                    {errors.username && (
                        <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="email">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <Mail className="h-4 w-4" />
                        </div>
                        <input
                            {...register('email')}
                            id="email"
                            type="email"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="john@example.com"
                            autoComplete="email"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </div>
                        <input
                            {...register('password')}
                            id="password"
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            autoComplete="new-password"
                        />
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium" htmlFor="phone">
                            Phone (optional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Phone className="h-4 w-4" />
                            </div>
                            <input
                                {...register('phone')}
                                id="phone"
                                type="tel"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="+1..."
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium" htmlFor="timezone">
                            Timezone
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Globe className="h-4 w-4" />
                            </div>
                            <input
                                {...register('timezone')}
                                id="timezone"
                                type="text"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="UTC"
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Register
                </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-primary font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
