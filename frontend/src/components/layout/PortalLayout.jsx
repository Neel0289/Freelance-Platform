import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function PortalLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="h-16 border-b border-border bg-card flex items-center px-4 md:px-8 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">A</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline">Freelancer Platform</span>
                        <div className="hidden md:flex items-center">
                            <span className="text-muted-foreground text-sm ml-2 border-l border-border pl-4 mr-4">Client Portal</span>
                            <nav className="flex items-center gap-4">
                                <Link to="/portal" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
                                <Link to="/portal/freelancers" className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">Discover Talent</Link>
                                <Link to="/portal/requests" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">My Requests</Link>
                            </nav>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-xs font-bold text-foreground">{user?.username || user?.email}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Client</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="h-4 w-px bg-border mx-1" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg transition-colors group"
                        >
                            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
