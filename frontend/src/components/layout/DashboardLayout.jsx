import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    Briefcase,
    Users,
    FileText,
    LayoutDashboard,
    Settings,
    LogOut,
    User as UserIcon,
    Menu,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import NotificationsDropdown from '../dashboard/NotificationsDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Contracts', href: '/contracts', icon: FileText },
];

export default function DashboardLayout() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!isAuthenticated || user?.role !== 'FREELANCER') {
        return <Navigate to="/auth/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex font-sans">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-[#111111] border-r border-[#222222] transition-all duration-300 hidden lg:flex flex-col",
                    isSidebarCollapsed ? "w-[72px]" : "w-[220px]"
                )}
            >
                <div className="h-[52px] flex items-center px-4 border-b border-[#222222]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 bg-[#7C3AED] rounded flex items-center justify-center shrink-0">
                            <span className="text-[14px] font-bold text-white">A</span>
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="font-semibold text-[15px] tracking-tight text-white whitespace-nowrap">Freelancer</span>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center group relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                                    isActive
                                        ? "bg-[#1A1A1A] text-[#F5F5F5]"
                                        : "text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F5F5F5]"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-[2px] h-4 bg-[#7C3AED] rounded-r-full" />
                                )}
                                <item.icon className={cn("shrink-0", isSidebarCollapsed ? "w-5 h-5 mx-auto" : "w-[15px] h-[15px] mr-2.5")} />
                                {!isSidebarCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-[#222222] space-y-1">
                    <Link
                        to="/settings"
                        className={cn(
                            "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                            location.pathname === '/settings'
                                ? "bg-[#1A1A1A] text-[#F5F5F5]"
                                : "text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F5F5F5]"
                        )}
                    >
                        <Settings className={cn("shrink-0", isSidebarCollapsed ? "w-5 h-5 mx-auto" : "w-[15px] h-[15px] mr-2.5")} />
                        {!isSidebarCollapsed && <span>Settings</span>}
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#EF44441A] transition-all duration-150"
                    >
                        <LogOut className={cn("shrink-0", isSidebarCollapsed ? "w-5 h-5 mx-auto" : "w-[15px] h-[15px] mr-2.5")} />
                        {!isSidebarCollapsed && <span>Logout</span>}
                    </button>

                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="w-full mt-2 p-1 text-[#555555] hover:text-[#A0A0A0] transition-colors flex justify-center"
                    >
                        {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>
            </aside>

            {/* Main Container */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300",
                "lg:pl-[220px]",
                isSidebarCollapsed && "lg:pl-[72px]"
            )}>
                {/* Top Header */}
                <header className="h-[52px] bg-[#0A0A0A] border-b border-[#222222] flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-1.5 text-[#A0A0A0] hover:text-[#F5F5F5]"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationsDropdown />
                        <div className="h-6 w-px bg-[#222222] mx-1" />
                        <div className="flex items-center gap-2.5 pl-1">
                            <div className="flex flex-col items-end mr-0.5 hidden sm:flex">
                                <span className="text-[13px] font-medium text-[#F5F5F5]">{user?.username}</span>
                                <span className="text-[11px] text-[#555555]">{user?.role}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#222222] flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-[#A0A0A0]" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 relative">
                    <div className="max-w-[1200px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="fixed inset-y-0 left-0 w-[240px] bg-[#111111] z-[70] lg:hidden p-4 shadow-2xl"
                        >
                            {/* Mobile Menu Content same as Desktop Sidebar */}
                            <div className="flex items-center gap-2.5 mb-8 px-2">
                                <div className="w-6 h-6 bg-[#7C3AED] rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">A</span>
                                </div>
                                <span className="font-bold text-white">Freelancer</span>
                            </div>
                            <nav className="space-y-1">
                                {navigation.map(item => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center px-4 py-3 rounded-lg text-sm font-medium",
                                            location.pathname.startsWith(item.href) ? "bg-[#1A1A1A] text-white" : "text-[#A0A0A0]"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
