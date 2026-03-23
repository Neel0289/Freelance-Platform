import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/auth';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.resetPasswordConfirm(uid, token, data.password);
            setIsSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight">Password Reset Successfully</h2>
                    <p className="text-sm text-muted-foreground">
                        Your password has been updated. You can now log in with your new password.
                    </p>
                </div>
                <Link
                    to="/auth/login"
                    className="w-full inline-flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90"
                >
                    Back to login
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Reset your password</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your new password below.
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="password">
                        New Password
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
                        />
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </div>
                        <input
                            {...register('confirmPassword')}
                            id="confirmPassword"
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Reset Password
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
