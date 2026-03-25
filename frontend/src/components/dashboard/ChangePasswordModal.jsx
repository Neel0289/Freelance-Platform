import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, X, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Send } from 'lucide-react';
import { authApi } from '../../api/auth';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';

const changePasswordSchema = z.object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password1: z.string().min(8, 'New password must be at least 8 characters'),
    new_password2: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password1 === data.new_password2, {
    message: "Passwords don't match",
    path: ["new_password2"],
});

export default function ChangePasswordModal({ isOpen, onClose }) {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isResetSent, setIsResetSent] = useState(false);
    const [error, setError] = useState(null);
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            // Using the precise fields expected by dj-rest-auth PasswordChangeSerializer
            await authApi.changePassword({
                old_password: data.old_password,
                new_password1: data.new_password1,
                new_password2: data.new_password2,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                reset();
            }, 2000);
        } catch (err) {
            // Check for specific field errors from backend
            const backendErrors = err.response?.data;
            if (backendErrors?.old_password) {
                setError(backendErrors.old_password[0]);
            } else if (backendErrors?.non_field_errors) {
                setError(backendErrors.non_field_errors[0]);
            } else {
                setError(err.response?.data?.detail || 'Failed to change password. Please check your current password.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!user?.email) {
            setError("User email not found. Please log in again.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await authApi.forgotPassword(user.email);
            setIsResetSent(true);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to send reset email. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-[#1A1A1A] flex items-center justify-between bg-gradient-to-r from-[#0A0A0A] to-[#111111]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Change Password</h2>
                            <p className="text-[10px] text-[#555555] font-black uppercase tracking-widest mt-0.5">Secure your account</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors text-[#555555] hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Password Updated!</h3>
                        <p className="text-sm text-[#555555]">Your password has been changed successfully. Closing...</p>
                    </div>
                ) : isResetSent ? (
                    <div className="p-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                            <Send className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Reset Email Sent!</h3>
                        <p className="text-sm text-[#555555]">We've sent a password reset link to <span className="text-white font-medium">{user?.email}</span>. Please check your inbox.</p>
                        <button 
                            onClick={onClose}
                            className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#222222] transition-all"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs animate-in slide-in-from-top-2 duration-200">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="font-medium tracking-tight">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#555555]">Current Password</label>
                                <button 
                                    type="button"
                                    onClick={handleForgotPassword}
                                    disabled={isLoading}
                                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPasswords.old ? "text" : "password"}
                                    {...register('old_password')}
                                    className={cn(
                                        "w-full px-4 py-3 bg-[#111111] border border-[#1A1A1A] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-[#222222] text-sm",
                                        errors.old_password && "border-red-500/50 focus:ring-red-500/20"
                                    )}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword('old')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333333] hover:text-[#555555] transition-colors"
                                >
                                    {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.old_password && <p className="text-[10px] text-red-500 font-bold mt-1 tracking-tight">{errors.old_password.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#555555]">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    {...register('new_password1')}
                                    className={cn(
                                        "w-full px-4 py-3 bg-[#111111] border border-[#1A1A1A] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-[#222222] text-sm",
                                        errors.new_password1 && "border-red-500/50 focus:ring-red-500/20"
                                    )}
                                    placeholder="Minimum 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword('new')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333333] hover:text-[#555555] transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.new_password1 && <p className="text-[10px] text-red-500 font-bold mt-1 tracking-tight">{errors.new_password1.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#555555]">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    {...register('new_password2')}
                                    className={cn(
                                        "w-full px-4 py-3 bg-[#111111] border border-[#1A1A1A] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-[#222222] text-sm",
                                        errors.new_password2 && "border-red-500/50 focus:ring-red-500/20"
                                    )}
                                    placeholder="Re-type your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword('confirm')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333333] hover:text-[#555555] transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.new_password2 && <p className="text-[10px] text-red-500 font-bold mt-1 tracking-tight">{errors.new_password2.message}</p>}
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-[#161616] hover:bg-[#1A1A1A] text-[10px] font-black uppercase tracking-widest text-[#555555] hover:text-[#A0A0A0] rounded-xl transition-all border border-[#1A1A1A]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-2 px-8 py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
