import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../../api/invoices';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Download,
    Send,
    Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function InvoicesPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const { data, isLoading } = useQuery({
        queryKey: ['invoices', { search, statusFilter }],
        queryFn: () => invoicesApi.list({
            search,
            status: statusFilter === 'ALL' ? undefined : statusFilter
        }),
    });

    const invoices = data?.results || [];

    const statusConfig = {
        DRAFT: { color: "bg-muted text-muted-foreground", icon: Clock },
        SENT: { color: "bg-blue-100 text-blue-700", icon: Send },
        PAID: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
        OVERDUE: { color: "bg-red-100 text-red-700", icon: AlertCircle },
        CANCELLED: { color: "bg-gray-100 text-gray-500", icon: AlertCircle },
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground mt-1">
                        Generate and manage invoices for your clients
                    </p>
                </div>
                <Link
                    to="/invoices/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by invoice number or client name..."
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 p-1 bg-muted rounded-lg overflow-x-auto whitespace-nowrap">
                    {['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                                statusFilter === status
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dates</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-10 w-full bg-muted rounded" /></td>
                                    </tr>
                                ))
                            ) : invoices.length > 0 ? (
                                invoices.map((invoice) => {
                                    const config = statusConfig[invoice.status] || statusConfig.DRAFT;
                                    const StatusIcon = config.icon;

                                    return (
                                        <tr key={invoice.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <Link
                                                            to={`/invoices/${invoice.id}`}
                                                            className="text-sm font-bold hover:text-primary transition-colors"
                                                        >
                                                            {invoice.invoice_number}
                                                        </Link>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                                            Project: {invoice.project_title || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {invoice.client_name}
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                                                    config.color
                                                )}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold">₹{parseFloat(invoice.total).toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Link
                                                        to={`/invoices/${invoice.id}`}
                                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const blob = await invoicesApi.downloadPdf(invoice.id);
                                                                const url = window.URL.createObjectURL(blob);
                                                                const link = document.createElement('a');
                                                                link.href = url;
                                                                link.setAttribute('download', `${invoice.invoice_number}.pdf`);
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                link.remove();
                                                            } catch (err) {
                                                                alert('Failed to download PDF');
                                                            }
                                                        }}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                                                        title="Download PDF"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <FileText className="w-12 h-12 mb-4" />
                                            <p className="text-lg font-medium">No invoices found</p>
                                            <p className="text-sm">Create your first invoice to get paid!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
