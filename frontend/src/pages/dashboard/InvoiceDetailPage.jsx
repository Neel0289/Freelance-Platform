import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../../api/invoices';
import {
    ArrowLeft,
    FileText,
    Calendar,
    Clock,
    Send,
    Download,
    CheckCircle2,
    AlertCircle,
    Building2,
    Receipt,
    Printer,
    Pencil
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const invoiceId = parseInt(id || '0');
    const queryClient = useQueryClient();

    const { data: invoice, isLoading } = useQuery({
        queryKey: ['invoice', invoiceId],
        queryFn: () => invoicesApi.get(invoiceId),
        enabled: !!invoiceId,
    });

    const sendMutation = useMutation({
        mutationFn: () => invoicesApi.send(invoiceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
            alert('Invoice sent successfully!');
        },
    });

    if (isLoading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-[500px] bg-card rounded-xl border border-border" />
        </div>;
    }

    if (!invoice) return <div>Invoice not found</div>;

    const statusConfig = {
        DRAFT: { color: "bg-muted text-muted-foreground", icon: Clock },
        SENT: { color: "bg-blue-100 text-blue-700", icon: Send },
        PAID: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
        OVERDUE: { color: "bg-red-100 text-red-700", icon: AlertCircle },
        CANCELLED: { color: "bg-gray-100 text-gray-500", icon: AlertCircle },
    };

    const config = statusConfig[invoice.status] || statusConfig.DRAFT;
    const StatusIcon = config.icon;

    const handleDownload = async () => {
        try {
            const blob = await invoicesApi.downloadPdf(invoiceId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${invoice.invoice_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to download PDF');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/invoices"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{invoice.invoice_number}</h1>
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border",
                                config.color
                            )}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {invoice.status}
                            </span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            For client: <Link to={`/clients/${invoice.client}`} className="text-primary hover:underline">{invoice.client_name}</Link>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {invoice.status === 'DRAFT' && (
                        <Link
                            to={`/invoices/${id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Draft
                        </Link>
                    )}
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        Print / PDF
                    </button>

                    {invoice.status === 'DRAFT' && (
                        <button
                            onClick={() => sendMutation.mutate()}
                            disabled={sendMutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            {sendMutation.isPending ? 'Sending...' : 'Send Invoice'}
                        </button>
                    )}

                    {invoice.status === 'SENT' && (
                        <button
                            onClick={() => window.open(`/portal/${invoice.id}/pay`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                        >
                            <Receipt className="w-4 h-4" />
                            Pay Links
                        </button>
                    )}
                </div>
            </div>

            {/* Invoice Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Invoice Preview */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden flex flex-col min-h-[700px]">
                        {/* Invoice Top */}
                        <div className="p-8 md:p-12 border-b border-border bg-primary/5">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                        <span className="text-primary-foreground font-bold text-2xl">A</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Freelancer Services</h2>
                                        <p className="text-sm text-muted-foreground">Professional Software Development</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <h2 className="text-3xl font-black uppercase text-primary/20 tracking-tighter">Invoice</h2>
                                    <p className="font-bold text-lg">{invoice.invoice_number}</p>
                                    <p className="text-xs text-muted-foreground">Issued on {new Date(invoice.issue_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mt-12">
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Bill To:</h4>
                                    <div className="space-y-1">
                                        <p className="font-bold text-lg">{invoice.client_name}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5" />
                                            Client Business Name
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Payment Details:</h4>
                                    <div className="space-y-1 text-sm font-medium">
                                        <p className="flex justify-end items-center gap-2">
                                            Due Date: <span className="text-destructive">{new Date(invoice.due_date).toLocaleDateString()}</span>
                                        </p>
                                        <p>Currency: {invoice.subtotal.includes('$') ? 'USD' : 'INR'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="flex-1 p-8 md:p-12">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <th className="pb-4">Description</th>
                                        <th className="pb-4 text-center">Qty / Rate</th>
                                        <th className="pb-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {invoice.items?.map((item, idx) => (
                                        <tr key={idx} className="text-sm">
                                            <td className="py-6">
                                                <p className="font-bold text-base mb-1">{item.description}</p>
                                                <p className="text-xs text-muted-foreground">Work performed for project: {invoice.project_title || 'General'}</p>
                                            </td>
                                            <td className="py-6 text-center tabular-nums">
                                                {item.quantity} × {item.unit_price}
                                            </td>
                                            <td className="py-6 text-right font-bold tabular-nums">
                                                {item.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="p-8 md:p-12 bg-muted/30 border-t border-border">
                            <div className="flex flex-col items-end space-y-3">
                                <div className="flex justify-between w-full max-w-[240px] text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{invoice.subtotal}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-[240px] text-sm">
                                    <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
                                    <span className="font-medium text-destructive">+{invoice.tax_amount}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-[240px] pt-4 border-t border-border mt-2">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-black text-2xl text-primary">{invoice.total}</span>
                                </div>
                            </div>

                            {invoice.notes && (
                                <div className="mt-12 pt-8 border-t border-border/50 text-xs text-muted-foreground max-w-md">
                                    <h4 className="font-bold uppercase mb-2 text-foreground/70">Notes:</h4>
                                    <p className="leading-relaxed">{invoice.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Status & Actions */}
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Payment Status</h4>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        invoice.status === 'PAID' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    )}>
                                        {invoice.status === 'PAID' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{invoice.status === 'PAID' ? 'Payment Received' : 'Waiting for Payment'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {invoice.paid_at ? `Completed on ${new Date(invoice.paid_at).toLocaleDateString()}` : `Due in ${Math.ceil((new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Integrations</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-muted-foreground">Razorpay Order</span>
                                    <span className="font-mono text-[10px] truncate max-w-[120px] bg-muted px-2 py-0.5 rounded">
                                        {invoice.razorpay_order_id || 'NOT_LINKED'}
                                    </span>
                                </div>
                                {invoice.razorpay_payment_id && (
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-muted-foreground">Payment ID</span>
                                        <span className="font-mono text-[10px] truncate max-w-[120px] bg-muted px-2 py-0.5 rounded text-green-600">
                                            {invoice.razorpay_payment_id}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-2">
                            <Link
                                to={`/invoices/${id}/edit`}
                                className="w-full py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors border border-border inline-flex items-center justify-center"
                            >
                                Edit Invoice
                            </Link>
                            <button className="w-full py-2 text-destructive hover:bg-destructive/5 text-sm font-medium rounded-lg transition-colors">
                                Cancel Invoice
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 space-y-4">
                        <h4 className="font-bold text-sm text-primary">Need help?</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            If your client is having trouble paying, you can manually verify the payment or resend the notification email.
                        </p>
                        <button className="text-xs font-bold text-primary hover:underline">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
