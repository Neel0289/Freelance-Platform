import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { invoicesApi } from '../../api/invoices';
import {
    ShieldCheck,
    CreditCard,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    FileText
} from 'lucide-react';

export default function PaymentPage() {
    const { id } = useParams();
    const invoiceId = parseInt(id || '0');
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const { data: invoice, isLoading } = useQuery({
        queryKey: ['invoice', invoiceId],
        queryFn: () => invoicesApi.get(invoiceId),
        enabled: !!invoiceId,
    });

    const verifyMutation = useMutation({
        mutationFn: (data) => invoicesApi.verifyPayment(invoiceId, data),
        onSuccess: () => {
            setIsSuccess(true);
            setIsProcessing(false);
        },
        onError: () => {
            setIsProcessing(false);
            alert('Payment verification failed. Please contact support.');
        }
    });

    const handlePayment = async () => {
        if (!invoice) return;
        setIsProcessing(true);

        try {
            const orderData = await invoicesApi.createOrder(invoiceId);

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Freelancer Platform',
                description: `Payment for Invoice ${invoice.invoice_number}`,
                order_id: orderData.order_id,
                handler: (response) => {
                    verifyMutation.mutate({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                },
                prefill: {
                    name: invoice.client_name,
                    email: '',
                },
                theme: {
                    color: '#000000',
                },
                modal: {
                    ondismiss: () => setIsProcessing(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setIsProcessing(false);
            alert('Failed to initialize payment. Please try again later.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading invoice details...</p>
            </div>
        );
    }

    if (!invoice) return <div className="text-center py-20">Invoice not found.</div>;

    if (isSuccess || invoice.status === 'PAID') {
        return (
            <div className="max-w-md mx-auto bg-card rounded-2xl border border-border shadow-xl p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Payment Successful!</h2>
                    <p className="text-muted-foreground text-sm">
                        Thank you for your payment. Invoice <strong>{invoice.invoice_number}</strong> is now marked as paid.
                    </p>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => navigate('/portal')}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-colors hover:bg-primary/90"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Invoice Summary */}
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/portal')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Portal
                </button>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Invoice Summary
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice #</span>
                            <span className="font-bold">{invoice.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Issued Date</span>
                            <span className="font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Due Date</span>
                            <span className="font-medium text-destructive">{new Date(invoice.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="pt-6 border-t border-border flex justify-between items-center">
                            <span className="text-lg font-bold">Total Amount</span>
                            <span className="text-2xl font-black text-primary">₹{parseFloat(invoice.total).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your payment is secure and processed through Razorpay. We do not store your credit card information.
                    </p>
                </div>
            </div>

            {/* Payment Action */}
            <div className="bg-card rounded-2xl border border-border shadow-lg p-8 space-y-8 h-full flex flex-col justify-center">
                <div className="text-center space-y-4">
                    <div className="p-4 bg-primary/10 w-fit mx-auto rounded-full text-primary">
                        <CreditCard className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Complete Payment</h2>
                        <p className="text-sm text-muted-foreground">
                            Select your preferred payment method in the next step. We support UPI, Cards, Netbanking, and Wallets.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Pay ₹{parseFloat(invoice.total).toLocaleString()}
                        </>
                    )}
                </button>

                <div className="flex items-center justify-center gap-6 grayscale opacity-50">
                    <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-6" />
                </div>

                {invoice.status === 'OVERDUE' && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-bold">This invoice is overdue. Please pay immediately.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
