import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../../api/invoices';
import { projectsApi } from '../../api/projects';
import {
    FileText,
    Briefcase,
    Clock,
    CheckCircle2,
    CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function PortalDashboardPage() {
    const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
        queryKey: ['portal-invoices'],
        queryFn: () => invoicesApi.list(),
    });

    const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
        queryKey: ['portal-projects'],
        queryFn: () => projectsApi.list(),
    });

    const invoices = invoicesData?.results || [];
    const projects = projectsData?.results || [];

    const pendingInvoices = invoices.filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE');
    const totalOutstanding = pendingInvoices.reduce((acc, inv) => acc + parseFloat(inv.total), 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
                <p className="text-muted-foreground mt-1">
                    View your invoices, projects, and manage payments.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Outstanding Balance</h3>
                        <p className="text-2xl font-bold tracking-tight">₹{totalOutstanding.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{pendingInvoices.length} unpaid invoices</p>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Active Projects</h3>
                        <p className="text-2xl font-bold tracking-tight">{projects.length}</p>
                        <p className="text-xs text-muted-foreground">In progress with your freelancer</p>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Completed Work</h3>
                        <p className="text-2xl font-bold tracking-tight">0</p>
                        <p className="text-xs text-muted-foreground">Projects finalized and archived</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Unpaid Invoices */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-lg">Unpaid Invoices</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {isInvoicesLoading ? (
                            <div className="p-6 animate-pulse space-y-4">
                                {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
                            </div>
                        ) : pendingInvoices.length > 0 ? (
                            pendingInvoices.map((invoice) => (
                                <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{invoice.invoice_number}</p>
                                            <p className="text-xs text-muted-foreground">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-bold">₹{parseFloat(invoice.total).toLocaleString()}</p>
                                        <Link
                                            to={`/portal/${invoice.id}/pay`}
                                            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            Pay Now
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-muted-foreground">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                <p className="text-sm">You're all caught up! No pending invoices.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Projects */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-lg">Our Recent Work</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {isProjectsLoading ? (
                            <div className="p-6 animate-pulse space-y-4">
                                {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
                            </div>
                        ) : projects.length > 0 ? (
                            projects.map((project) => (
                                <div key={project.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{project.title}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                                                {project.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border",
                                        project.status === 'ACTIVE' ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-muted text-muted-foreground border-border"
                                    )}>
                                        {project.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-muted-foreground">
                                <Clock className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">No active projects at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
