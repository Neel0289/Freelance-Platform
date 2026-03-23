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

import { signInWithGoogle } from '../../utils/firebase';
import { useAuthStore } from '../../store/authStore';
import { getGoogleAuthErrorMessage } from '../../utils/googleAuthErrors';

export default function RegisterPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
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

    const onGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { idToken } = await signInWithGoogle();
            const user = await authApi.firebaseLogin(idToken, selectedRole);
            login(user);
            navigate(user.role === 'FREELANCER' ? '/dashboard' : '/portal');
        } catch (err) {
            console.error(err);
            setError(getGoogleAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

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

            <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground bg-card px-2">OR</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <button
                type="button"
                onClick={onGoogleLogin}
                disabled={isLoading}
                className="w-full h-10 px-4 py-2 border border-border bg-card hover:bg-muted text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Sign up with Google
            </button>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-primary font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
