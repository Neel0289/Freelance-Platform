import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../../api/invoices';
import { projectsApi } from '../../api/projects';
import { contractsApi } from '../../api/contracts';
import { dashboardApi } from '../../api/dashboard';
import { workRequestsApi } from '../../api/workRequests';
import {
    FileText,
    Briefcase,
    Clock,
    CheckCircle2,
    CreditCard,
    ShieldCheck,
    PenLine,
    ExternalLink,
    MessageSquare,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function PortalDashboardPage() {
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['portal-stats'],
        queryFn: () => dashboardApi.getStats(),
    });

    const { data: contractsData, isLoading: isContractsLoading } = useQuery({
        queryKey: ['portal-contracts'],
        queryFn: () => contractsApi.list(),
    });

    const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
        queryKey: ['portal-projects'],
        queryFn: () => projectsApi.list(),
    });

    const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
        queryKey: ['portal-invoices'],
        queryFn: () => invoicesApi.list(),
    });

    const { data: requestsData, isLoading: isRequestsLoading } = useQuery({
        queryKey: ['portal-requests'],
        queryFn: () => workRequestsApi.list(),
    });

    const queryClient = useQueryClient();
    const clientAcceptMutation = useMutation({
        mutationFn: (id) => workRequestsApi.clientAccept(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['portal-requests']);
            queryClient.invalidateQueries(['portal-projects']);
            queryClient.invalidateQueries(['portal-stats']);
        },
    });

    const declineMutation = useMutation({
        mutationFn: (id) => workRequestsApi.decline(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['portal-requests']);
        },
    });

    const projects = projectsData?.results || [];
    const contracts = contractsData?.results || [];
    const invoices = invoicesData?.results || [];
    const requests = requestsData?.results || [];
    const pendingInvoices = invoices.filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE');

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Client Portal</h1>
                    <p className="text-muted-foreground mt-1">
                        View your active agreements, project progress, and manage payments.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border w-fit">
                    <Clock className="w-3 h-3 text-primary" />
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm border-b-4 border-b-primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Balance</h3>
                        <p className="text-2xl font-black tracking-tight">₹{(stats?.pending_amount || 0).toLocaleString()}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">{stats?.pending_invoices || 0} unpaid invoices</p>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm border-b-4 border-b-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Projects</h3>
                        <p className="text-2xl font-black tracking-tight">{stats?.active_projects || 0}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">Ongoing collaboration</p>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm border-b-4 border-b-green-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Signed</h3>
                        <p className="text-2xl font-black tracking-tight">{stats?.signed_contracts || 0}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">Active legal agreements</p>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm border-b-4 border-b-orange-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <PenLine className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending</h3>
                        <p className="text-2xl font-black tracking-tight">{stats?.pending_contracts || 0}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">Agreements to review</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Legal Agreements Section */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-lg">Legal Agreements</h3>
                            </div>
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">Action Required</span>
                        </div>
                        <div className="divide-y divide-border">
                            {isContractsLoading ? (
                                <div className="p-6 space-y-4 animate-pulse">
                                    {[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
                                </div>
                            ) : contracts.length > 0 ? (
                                contracts.map((contract) => (
                                    <div key={contract.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                                contract.status === 'SIGNED' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600 shadow-lg shadow-orange-500/10"
                                            )}>
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground">{contract.title}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                    By {contract.freelancer_name} 
                                                    <span className="w-1 h-1 bg-border rounded-full" /> 
                                                    {new Date(contract.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className={cn(
                                                "text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-tighter border",
                                                contract.status === 'SIGNED' ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200 animate-pulse"
                                            )}>
                                                {contract.status === 'SENT' ? 'Waiting Signature' : contract.status}
                                            </span>
                                            {contract.status === 'SENT' && (
                                                <Link
                                                    to={`/portal/contracts/sign/${contract.signature_token}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                                                >
                                                    View & Sign
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center space-y-4">
                                    <ShieldCheck className="w-12 h-12 text-muted/30 mx-auto" />
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">No legal agreements have been sent to you yet. They will appear here when ready for your signature.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Work Requests Section */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-lg">Work Requests</h3>
                            </div>
                            <Link to="/portal/freelancers" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Discover Talent</Link>
                        </div>
                        <div className="divide-y divide-border">
                            {isRequestsLoading ? (
                                <div className="p-6 space-y-4 animate-pulse">
                                    {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
                                </div>
                            ) : requests.length > 0 ? (
                                requests.slice(0, 5).map((request) => (
                                    <div key={request.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                request.status === 'ACCEPTED' ? "bg-green-100 text-green-600" : 
                                                request.status === 'PROPOSED' ? "bg-blue-100 text-blue-600" :
                                                request.status === 'DECLINED' ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"
                                            )}>
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm">{request.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                        For: {request.freelancer_name}
                                                    </p>
                                                    {request.status === 'PROPOSED' && (
                                                        <>
                                                            <span className="w-1 h-1 bg-border rounded-full" />
                                                            <p className="text-[10px] font-bold text-blue-600 uppercase">Proposal Received</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            {request.status === 'PROPOSED' ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right mr-2 hidden md:block">
                                                        <p className="text-[10px] font-black">₹{parseFloat(request.budget).toLocaleString()}</p>
                                                        <p className="text-[9px] text-muted-foreground font-bold">BY {new Date(request.deadline).toLocaleDateString()}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => declineMutation.mutate(request.id)}
                                                        disabled={declineMutation.isPending}
                                                        className="px-3 py-1.5 text-[10px] font-black text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 uppercase tracking-widest"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button 
                                                        onClick={() => clientAcceptMutation.mutate(request.id)}
                                                        disabled={clientAcceptMutation.isPending}
                                                        className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-black rounded-lg hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/10 uppercase tracking-widest"
                                                    >
                                                        {clientAcceptMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Proposal"}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <span className={cn(
                                                        "text-[9px] font-black px-2 py-0.5 rounded-full uppercase border",
                                                        request.status === 'ACCEPTED' ? "bg-green-50 text-green-700 border-green-200" :
                                                        request.status === 'DECLINED' ? "bg-red-50 text-red-700 border-red-200" : "bg-muted text-muted-foreground border-border"
                                                    )}>
                                                        {request.status}
                                                    </span>
                                                    <p className="text-[10px] text-muted-foreground font-bold whitespace-nowrap">
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center space-y-4">
                                    <MessageSquare className="w-10 h-10 text-muted/30 mx-auto" />
                                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">You haven't sent any work requests yet. Browse top freelancers to get started.</p>
                                    <Link to="/portal/freelancers" className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[10px] font-black rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest shadow-xl shadow-foreground/10">
                                        Browse Talent
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Projects Section */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h3 className="font-bold text-lg">Active Projects</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isProjectsLoading ? (
                                [1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)
                            ) : projects.length > 0 ? (
                                projects.map((project) => (
                                    <div key={project.id} className="p-5 border border-border rounded-2xl hover:border-primary/30 transition-all hover:bg-primary/[0.02] group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase border",
                                                project.status === 'ACTIVE' ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" : 
                                                project.status === 'ACCEPTED' ? "bg-green-50 text-green-700 border-green-200 shadow-sm" :
                                                "bg-muted text-muted-foreground border-border"
                                            )}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-sm mb-1">{project.title}</h4>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                            {project.description || 'Our ongoing collaboration on this project. Tracking milestones and metrics in real-time.'}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">Your active projects with us will be listed here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Unpaid Invoices List */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h3 className="font-bold text-lg text-primary">Pending Invoices</h3>
                        </div>
                        <div className="divide-y divide-border">
                            {isInvoicesLoading ? (
                                <div className="p-6 space-y-4 animate-pulse">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-lg" />)}
                                </div>
                            ) : pendingInvoices.length > 0 ? (
                                pendingInvoices.map((invoice) => (
                                    <div key={invoice.id} className="p-5 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black">{invoice.invoice_number}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(invoice.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <p className="text-xs font-black">₹{parseFloat(invoice.total).toLocaleString()}</p>
                                            <Link
                                                to={`/portal/${invoice.id}/pay`}
                                                className="text-[10px] font-black text-primary hover:underline hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                                            >
                                                PAY NOW
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-4" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Settled</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">No outstanding payments!</p>
                                </div>
                            )}
                        </div>
                        {pendingInvoices.length > 0 && (
                            <div className="p-4 bg-primary/5 border-t border-border">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-[10px] font-bold text-muted-foreground">TOTAL OUTSTANDING</span>
                                    <span className="text-sm font-black">₹{(stats?.pending_amount || 0).toLocaleString()}</span>
                                </div>
                                <Link 
                                    to={`/portal/${pendingInvoices[0].id}/pay`}
                                    className="w-full flex items-center justify-center py-2.5 bg-foreground text-background text-[10px] font-black rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest shadow-xl shadow-foreground/10"
                                >
                                    Pay {pendingInvoices.length > 1 ? 'Next Invoice' : 'Total Balance'}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Support Card */}
                    <div className="p-6 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 space-y-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tighter">Need Assistance?</h4>
                            <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                                Our support team is ready to help you with any questions regarding your agreements or payments.
                            </p>
                        </div>
                        <button className="w-full py-2.5 bg-white text-primary text-[10px] font-black rounded-xl hover:bg-white/90 transition-colors uppercase tracking-widest">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
