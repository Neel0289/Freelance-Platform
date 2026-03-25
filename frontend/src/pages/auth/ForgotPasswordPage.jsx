import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

import { authApi } from '../../api/auth';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.forgotPassword(data.email);
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            const message = typeof detail === 'string' ? detail : 
                           (err.response?.data?.email?.[0] || 'Failed to send reset email. Please try again.');
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight">Check your email</h2>
                    <p className="text-sm text-muted-foreground">
                        We've sent a password reset link to your email address.
                    </p>
                </div>
                <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Forgot password?</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a link to reset your password.
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="email">
                        Email address
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

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send reset link
                </button>
            </form>

            <div className="text-center">
                <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </Link>
            </div>
        </div>
    );
}
