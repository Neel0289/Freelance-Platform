import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../../api/clients';
import { projectsApi } from '../../api/projects';
import { invoicesApi } from '../../api/invoices';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Plus,
    Briefcase,
    FileText,
    ArrowLeft,
    Settings,
    Edit
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ClientDetailPage() {
    const { id } = useParams();
    const clientId = parseInt(id || '0');
    const [activeTab, setActiveTab] = useState('projects');

    const { data: client, isLoading: isClientLoading } = useQuery({
        queryKey: ['client', clientId],
        queryFn: () => clientsApi.get(clientId),
        enabled: !!clientId,
    });

    const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
        queryKey: ['client-projects', clientId],
        queryFn: () => projectsApi.list({ client: clientId }),
        enabled: !!clientId,
    });

    const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
        queryKey: ['client-invoices', clientId],
        queryFn: () => invoicesApi.list({ client: clientId }),
        enabled: !!clientId,
    });

    if (isClientLoading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-48 bg-card rounded-xl border border-border" />
            <div className="h-96 bg-card rounded-xl border border-border" />
        </div>;
    }

    if (!client) return <div>Client not found</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/clients"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Building2 className="w-4 h-4" />
                            {client.company || 'Individual Client'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/clients/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Client
                    </Link>
                    <Link
                        to="/invoices/new"
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/5 rounded-md transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Invoice
                    </Link>
                    <Link
                        to="/projects/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </Link>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        Contact Information
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span className="text-foreground">{client.email}</span>
                        </div>
                        {client.phone && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span className="text-foreground">{client.phone}</span>
                            </div>
                        )}
                        {client.address && (
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span className="text-foreground">{client.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                        <Briefcase className="w-4 h-4" />
                        Project Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Active Projects</p>
                            <p className="text-xl font-bold">{projectsData?.count || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-xl font-bold">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                        <FileText className="w-4 h-4" />
                        Billing Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Total Invoiced</p>
                            <p className="text-xl font-bold">{client.currency} 0</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Outstanding</p>
                            <p className="text-xl font-bold text-destructive">{client.currency} 0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={cn(
                            "flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'projects' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={cn(
                            "flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'invoices' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        Invoices
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'projects' ? (
                        <div className="space-y-4">
                            {isProjectsLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    {[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-lg" />)}
                                </div>
                            ) : projectsData?.results && projectsData.results.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projectsData.results.map((project) => (
                                        <Link
                                            key={project.id}
                                            to={`/projects/${project.id}`}
                                            className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h4>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                    project.status === 'ACTIVE' ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {project.description || 'No description provided.'}
                                            </p>
                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <p>Due: {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No date'}</p>
                                                <p className="font-medium text-foreground">{project.currency} {project.budget}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <Briefcase className="w-8 h-8 mx-auto mb-2" />
                                    <p>No projects found for this client.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {isInvoicesLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    {[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-lg" />)}
                                </div>
                            ) : invoicesData?.results && invoicesData.results.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-xs text-muted-foreground uppercase border-b border-border">
                                            <tr>
                                                <th className="pb-3">Invoice #</th>
                                                <th className="pb-3">Issue Date</th>
                                                <th className="pb-3">Status</th>
                                                <th className="pb-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {invoicesData.results.map((invoice) => (
                                                <tr key={invoice.id} className="group hover:bg-muted/30">
                                                    <td className="py-4">
                                                        <Link to={`/invoices/${invoice.id}`} className="font-medium hover:text-primary">
                                                            {invoice.invoice_number}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4 text-sm text-muted-foreground">
                                                        {new Date(invoice.issue_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={cn(
                                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                            invoice.status === 'PAID' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                        )}>
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right font-semibold">
                                                        {client.currency} {invoice.total}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <FileText className="w-8 h-8 mx-auto mb-2" />
                                    <p>No invoices found for this client.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
