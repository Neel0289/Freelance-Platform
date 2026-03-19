import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '../../api/contracts';
import {
    ArrowLeft,
    FileCheck,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    User,
    ShieldCheck,
    ClipboardList,
    Pencil,
    ExternalLink
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ContractDetailPage() {
    const { id } = useParams();
    const contractId = parseInt(id || '0');
    const queryClient = useQueryClient();

    const { data: contract, isLoading } = useQuery({
        queryKey: ['contract', contractId],
        queryFn: () => contractsApi.get(contractId),
        enabled: !!contractId,
    });

    const sendMutation = useMutation({
        mutationFn: () => contractsApi.send(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
            alert('Contract sent for signature!');
        },
    });

    if (isLoading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-[600px] bg-card rounded-xl border border-border" />
        </div>;
    }

    if (!contract) return <div>Contract not found</div>;

    const statusColors = {
        DRAFT: "bg-muted text-muted-foreground border-border",
        SENT: "bg-blue-100 text-blue-700 border-blue-200",
        SIGNED: "bg-green-100 text-green-700 border-green-200",
        CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/contracts"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {contract.project_title || 'Service Agreement'}
                            </h1>
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border",
                                statusColors[contract.status]
                            )}>
                                {contract.status === 'SIGNED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                {contract.status}
                            </span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Contract with: <Link to={`/clients/${contract.client}`} className="text-primary hover:underline">{contract.client_name}</Link>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {contract.status === 'DRAFT' && (
                        <>
                            <Link
                                to={`/contracts/${id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit Agreement
                            </Link>
                            <button
                                onClick={() => sendMutation.mutate()}
                                disabled={sendMutation.isPending}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                {sendMutation.isPending ? 'Sending...' : 'Send for Signature'}
                            </button>
                        </>
                    )}
                    {contract.status === 'SENT' && (
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <ClipboardList className="w-4 h-4" />
                            Update Terms
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contract Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
                        <div className="p-8 md:p-12 border-b border-border bg-muted/30">
                            <h2 className="text-2xl font-bold text-center uppercase tracking-widest text-foreground/80">
                                Independent Contractor Agreement
                            </h2>
                        </div>
                        <div className="p-8 md:p-12 prose prose-slate max-w-none dark:prose-invert">
                            <div className="whitespace-pre-wrap leading-relaxed text-sm text-foreground/90">
                                {contract.content || 'Your contract terms will appear here.'}
                            </div>
                        </div>
                        {contract.status === 'SIGNED' && (
                            <div className="p-8 md:p-12 border-t border-border bg-green-50/10">
                                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Freelancer Signature</h4>
                                        <div className="pt-4 border-b border-border min-w-[200px]">
                                            <span className="font-serif text-2xl italic">{contract.freelancer_name}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Digitally signed on {new Date(contract.updated_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-4 text-right">
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Client Signature</h4>
                                        <div className="pt-4 border-b border-border min-w-[200px]">
                                            <span className="font-serif text-2xl italic">{contract.client_name}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Verified signature via Portal</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                                    <ShieldCheck className="w-5 h-5" />
                                    This document is legally binding and digitally cryptoverified.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Agreement Details</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Client
                                    </span>
                                    <span className="font-semibold">{contract.client_name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Created
                                    </span>
                                    <span className="font-semibold">{new Date(contract.created_at).toLocaleDateString()}</span>
                                </div>
                                {contract.signed_at && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4" />
                                            Signed
                                        </span>
                                        <span className="font-semibold text-green-600">{new Date(contract.signed_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Sharing</h4>
                            <p className="text-xs text-muted-foreground mb-4">
                                Share this unique link with your client for digital signing:
                            </p>
                            <div className="flex items-center gap-2 p-2 bg-muted rounded border border-border">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/portal/contracts/sign/${contract.signature_token}`}
                                    className="bg-transparent text-[10px] flex-1 outline-none font-mono truncate"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/portal/contracts/sign/${contract.signature_token}`);
                                        alert('Link copied!');
                                    }}
                                    className="p-1 hover:bg-primary/10 rounded group transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 group-hover:text-primary" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <button
                                className="w-full py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors border border-border"
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 space-y-3">
                        <h4 className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Information
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Contracts can't be edited once sent. If you need to make changes, you'll have to cancel this one and create a new version.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
