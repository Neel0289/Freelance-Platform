import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user) {
        return <Navigate to={user.role === 'FREELANCER' ? '/dashboard' : '/portal'} replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border border-border">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <span className="text-primary-foreground font-bold text-2xl">A</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Freelancer CRM</h1>
                    <p className="text-sm text-muted-foreground mt-1 text-center">
                        Manage your freelancing business with ease
                    </p>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
