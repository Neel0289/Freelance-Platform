import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { contractsApi } from '../../api/contracts';
import {
    ShieldCheck,
    FileCheck,
    Loader2,
    AlertCircle,
    PenLine,
    ChevronRight
} from 'lucide-react';

export default function ContractSignPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { data: contract, isLoading, isError } = useQuery({
        queryKey: ['contract-sign', token],
        queryFn: () => contractsApi.getPublic(token),
        enabled: !!token,
        retry: false,
    });

    const signMutation = useMutation({
        mutationFn: () => contractsApi.sign(token || '', { agreed: true }),
        onSuccess: () => {
            setIsSuccess(true);
        },
        onError: () => {
            alert('Failed to sign contract. Please contact your freelancer.');
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Fetching legal agreement...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-md mx-auto bg-card rounded-xl border border-border p-12 text-center space-y-6">
                <div className="p-4 bg-red-100 text-red-600 w-fit mx-auto rounded-full">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Link Expired or Invalid</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        This signature link is no longer valid. Please request a new link from your freelancer.
                    </p>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto bg-card rounded-2xl border border-border shadow-xl p-12 text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Successfully Signed!</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Legal agreement for <strong>{contract?.project_title || 'Service'}</strong> has been digitally signed and verified.
                    </p>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => navigate('/portal')}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-colors hover:bg-primary/90"
                    >
                        Go to Your Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black tracking-tight">Digital Signature</h1>
                <p className="text-muted-foreground">
                    Please review the terms of the agreement below before signing.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Document Viewer */}
                <div className="flex-1 bg-card rounded-xl border border-border shadow-lg overflow-hidden flex flex-col min-h-[600px]">
                    <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-primary" />
                            <span className="font-bold text-sm uppercase tracking-wider">Independent Contractor Agreement</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">DOCUMENT ID: {token?.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="p-8 md:p-12 overflow-y-auto max-h-[600px] prose prose-slate max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap leading-relaxed text-sm text-foreground/80 font-mono bg-muted/10 p-4 rounded-lg">
                            {contract?.content || 'Terms of service loading...'}
                        </div>
                    </div>
                </div>

                {/* Signing Sidebar */}
                <div className="lg:w-80 space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification</h4>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <div className="p-2 bg-primary/10 rounded text-primary">
                                    <PenLine className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate">Signing as {contract?.client_name || 'Client'}</p>
                                    <p className="text-[10px] text-muted-foreground">Verified by portal link</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirmation</h4>
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    className="w-4 h-4 mt-1 text-primary border-border rounded focus:ring-primary/20"
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                />
                                <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                                    I have read the agreement and I agree to the terms and conditions stated above. I understand that this digital signature is legally binding.
                                </label>
                            </div>
                        </div>

                        <button
                            disabled={!isAgreed || signMutation.isPending}
                            onClick={() => signMutation.mutate()}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-green-700 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none group shadow-lg shadow-green-600/20"
                        >
                            {signMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Confirm & Sign
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3 items-start">
                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase">Secure Signature</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                We use secure tokens and IP verification to ensure the integrity of the signing process.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
