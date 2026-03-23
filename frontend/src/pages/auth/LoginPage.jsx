import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { getGoogleAuthErrorMessage } from '../../utils/googleAuthErrors';

const loginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

import { signInWithGoogle } from '../../utils/firebase';

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { idToken } = await signInWithGoogle();
            const user = await authApi.firebaseLogin(idToken, 'FREELANCER');
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
            await authApi.login(data);
            const user = await authApi.getUser();
            login(user);
            navigate(user.role === 'FREELANCER' ? '/dashboard' : '/portal');
        } catch (err) {
            setError(err.response?.data?.non_field_errors?.[0] || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your credentials to access your account
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="username">
                        Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <Mail className="h-4 w-4" />
                        </div>
                        <input
                            {...register('username')}
                            id="username"
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="your_username"
                            autoComplete="username"
                        />
                    </div>
                    {errors.username && (
                        <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium" htmlFor="password">
                            Password
                        </label>
                        <Link
                            to="/auth/forgot-password"
                            className="text-xs text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </div>
                        <input
                            {...register('password')}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Login
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
                Sign in with Google
            </button>

            <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-primary font-medium hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
