import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workRequestsApi } from '../../api/workRequests';
import {
    Briefcase,
    Clock,
    MessageSquare,
    Loader2,
    ChevronRight,
    Calendar,
    DollarSign,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function MyRequestsPage() {
    const { data: requestsData, isLoading: isRequestsLoading, error } = useQuery({
        queryKey: ['portal-requests-all'],
        queryFn: () => workRequestsApi.list(),
    });

    const queryClient = useQueryClient();
    
    const clientAcceptMutation = useMutation({
        mutationFn: (id) => workRequestsApi.clientAccept(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['portal-requests-all']);
            queryClient.invalidateQueries(['portal-projects']);
            queryClient.invalidateQueries(['portal-stats']);
        },
    });

    const declineMutation = useMutation({
        mutationFn: (id) => workRequestsApi.decline(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['portal-requests-all']);
        },
    });

    const requests = requestsData?.results || [];

    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black mb-2">Failed to load requests</h2>
                <p className="text-muted-foreground max-w-md">
                    There was an error fetching your work requests. Please try refreshing the page.
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-all active:scale-95"
                >
                    Retry Now
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">My Requests</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your sent freelancing requests and manage active proposals.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border w-fit">
                    <Clock className="w-3 h-3 text-primary" />
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Sent Requests</h3>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {isRequestsLoading ? (
                        <div className="p-12 space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-12 h-12 bg-muted rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-1/4" />
                                        <div className="h-3 bg-muted rounded w-1/3" />
                                    </div>
                                    <div className="w-24 h-8 bg-muted rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : requests.length > 0 ? (
                        requests.map((request) => (
                            <div key={request.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/30 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                        request.status === 'ACCEPTED' ? "bg-green-100 text-green-600" : 
                                        request.status === 'PROPOSED' ? "bg-blue-100 text-blue-600 shadow-lg shadow-blue-500/10" :
                                        request.status === 'DECLINED' ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-lg">{request.title}</h4>
                                            <span className={cn(
                                                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase border",
                                                request.status === 'ACCEPTED' ? "bg-green-50 text-green-700 border-green-200" :
                                                request.status === 'PROPOSED' ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
                                                request.status === 'DECLINED' ? "bg-red-50 text-red-700 border-red-200" : 
                                                "bg-muted text-muted-foreground border-border"
                                            )}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                                            {request.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                    <span className="text-[10px]">{request.freelancer_name?.charAt(0)}</span>
                                                </div>
                                                For: <span className="text-foreground">{request.freelancer_name}</span>
                                            </div>
                                            <span className="w-1 h-1 bg-border rounded-full hidden sm:block" />
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Sent: {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                            {request.budget && (
                                                <>
                                                    <span className="w-1 h-1 bg-border rounded-full hidden sm:block" />
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        Budget: ₹{parseFloat(request.budget).toLocaleString()}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-stretch md:items-end gap-3 min-w-[200px]">
                                    {request.status === 'PROPOSED' ? (
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-3">
                                            <div className="flex items-center justify-between gap-6">
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Proposed Budget</p>
                                                    <p className="text-lg font-black text-blue-700">₹{parseFloat(request.budget).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deadline</p>
                                                    <p className="text-xs font-black text-foreground">{new Date(request.deadline).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-1 border-t border-blue-100/50">
                                                <button 
                                                    onClick={() => declineMutation.mutate(request.id)}
                                                    disabled={declineMutation.isPending}
                                                    className="flex-1 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100 uppercase tracking-widest"
                                                >
                                                    Reject
                                                </button>
                                                <button 
                                                    onClick={() => clientAcceptMutation.mutate(request.id)}
                                                    disabled={clientAcceptMutation.isPending}
                                                    className="flex-[2] py-2 bg-primary text-primary-foreground text-[10px] font-black rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    {clientAcceptMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                                                        <>
                                                            Confirm Proposal
                                                            <ChevronRight className="w-3 h-3" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : request.status === 'ACCEPTED' ? (
                                        <Link 
                                            to="/portal" 
                                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-green-500/10"
                                        >
                                            View in Dashboard
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-xl border border-border">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                                                {request.status === 'PENDING' ? 'Awaiting Freelancer Review' : 
                                                 request.status === 'DECLINED' ? 'Freelancer Declined' : 'Request Closed'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-black mb-2 tracking-tight">No requests found</h3>
                            <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                                You haven't sent any freelancing requests yet. Start by discovering top talent and sharing your project vision.
                            </p>
                            <Link 
                                to="/portal/freelancers" 
                                className="inline-flex items-center gap-3 px-8 py-3 bg-foreground text-background text-xs font-black rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-2xl shadow-foreground/20 uppercase tracking-widest"
                            >
                                Browse Talents
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Design Footer Tip */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/10">
                <div className="flex items-center gap-4 text-primary">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm uppercase">Pro Tip: Negotiation</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Freelancers might propose a different budget or deadline. You can accept their proposal here to kickstart the project.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
