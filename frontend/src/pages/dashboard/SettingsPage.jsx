import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User,
    Mail,
    Phone,
    Globe,
    Camera,
    Lock,
    Bell,
    Shield,
    Save,
    Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import ChangePasswordModal from '../../components/dashboard/ChangePasswordModal';

const profileSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    timezone: z.string().default('UTC'),
});

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: user?.username || '',
            email: user?.email || '',
            phone: user?.phone || '',
            timezone: user?.timezone || 'UTC',
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        // Simulate API call
        console.log('Update profile:', data);
        setTimeout(() => {
            setIsLoading(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    const sections = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account preferences and security
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                        activeSection === section.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {section.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        {activeSection === 'profile' && (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="p-6 border-b border-border">
                                    <h3 className="font-semibold text-lg">Personal Information</h3>
                                    <p className="text-sm text-muted-foreground">Update your basic profile details.</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Avatar Upload */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background overflow-hidden relative">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-12 h-12 text-primary" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <Camera className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Profile Picture</h4>
                                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                                            <button type="button" className="mt-2 text-xs font-bold text-primary hover:underline">
                                                Change Photo
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <User className="w-3.5 h-3.5" />
                                                Username
                                            </label>
                                            <input
                                                {...register('username')}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" />
                                                Email Address
                                            </label>
                                            <input
                                                {...register('email')}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 opacity-70"
                                                disabled
                                            />
                                            <p className="text-[10px] text-muted-foreground">Email change requires verification</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5" />
                                                Phone Number
                                            </label>
                                            <input
                                                {...register('phone')}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Globe className="w-3.5 h-3.5" />
                                                Timezone
                                            </label>
                                            <select
                                                {...register('timezone')}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                            >
                                                <option value="UTC">UTC (GMT+0)</option>
                                                <option value="Asia/Kolkata">IST (GMT+5:30)</option>
                                                <option value="America/New_York">EST (GMT-5)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-muted/30 border-t border-border flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                                        onClick={() => reset()}
                                    >
                                        Discard Changes
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isDirty || isLoading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Settings
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'security' && (
                            <div className="p-12 text-center space-y-4">
                                <div className="p-3 bg-primary/10 w-fit mx-auto rounded-full text-primary">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Security & Password</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Change your password or enable two-factor authentication for enhanced account protection.
                                </p>
                                <button 
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Change Password
                                </button>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="p-12 text-center space-y-4">
                                <div className="p-3 bg-primary/10 w-fit mx-auto rounded-full text-primary">
                                    <Bell className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Manage Notifications</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Choose how you want to be notified about payments, contracts, and project updates.
                                </p>
                                <button className="px-6 py-2 bg-[#1A1A1A] text-[#F5F5F5] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#222222] border border-[#222222] transition-all">
                                    Configure Preferences
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
}
