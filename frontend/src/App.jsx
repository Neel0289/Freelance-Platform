import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/auth';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import PortalLayout from './components/layout/PortalLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientsPage from './pages/dashboard/ClientsPage';
import ClientDetailPage from './pages/dashboard/ClientDetailPage';
import ClientFormPage from './pages/dashboard/ClientFormPage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import ProjectDetailPage from './pages/dashboard/ProjectDetailPage';
import ProjectFormPage from './pages/dashboard/ProjectFormPage';
import InvoicesPage from './pages/dashboard/InvoicesPage';
import InvoiceDetailPage from './pages/dashboard/InvoiceDetailPage';
import InvoiceFormPage from './pages/dashboard/InvoiceFormPage';
import ContractsPage from './pages/dashboard/ContractsPage';
import ContractDetailPage from './pages/dashboard/ContractDetailPage';
import ContractFormPage from './pages/dashboard/ContractFormPage';
import SettingsPage from './pages/dashboard/SettingsPage';

// Portal Pages
import PortalDashboardPage from './pages/portal/PortalDashboardPage';
import PaymentPage from './pages/portal/PaymentPage';
import ContractSignPage from './pages/portal/ContractSignPage';

// Temporary placeholder components for other sections
const Placeholder = ({ title }) => (
    <div className="h-full flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">This page is under construction</p>
        </div>
    </div>
);

function App() {
    const { login, logout, setInitialized, isInitialized } = useAuthStore();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await authApi.getUser();
                login(user);
            } catch (err) {
                logout();
            } finally {
                setInitialized(true);
            }
        };

        checkAuth();
    }, [login, logout, setInitialized]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary rounded-lg mb-4" />
                    <div className="h-4 w-32 bg-muted rounded" />
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Dashboard Routes (Freelancer only) */}
            <Route path="/" element={<DashboardLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/new" element={<ClientFormPage />} />
                <Route path="clients/:id" element={<ClientDetailPage />} />
                <Route path="clients/:id/edit" element={<ClientFormPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/new" element={<ProjectFormPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
                <Route path="projects/:id/edit" element={<ProjectFormPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/new" element={<InvoiceFormPage />} />
                <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="invoices/:id/edit" element={<InvoiceFormPage />} />
                <Route path="contracts" element={<ContractsPage />} />
                <Route path="contracts/new" element={<ContractFormPage />} />
                <Route path="contracts/:id" element={<ContractDetailPage />} />
                <Route path="contracts/:id/edit" element={<ContractFormPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Client Portal Routes */}
            <Route path="/portal" element={<PortalLayout />}>
                <Route index element={<PortalDashboardPage />} />
                <Route path=":id/pay" element={<PaymentPage />} />
                <Route path="contracts/sign/:token" element={<ContractSignPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Placeholder title="404 Not Found" />} />
        </Routes>
    );
}

export default App;
