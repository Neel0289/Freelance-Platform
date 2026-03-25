import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard';
import { workRequestsApi } from '../../api/workRequests';
import {
    Users,
    Briefcase,
    FileText,
    DollarSign,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Check,
    X,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, icon: Icon, description, trend, trendValue }) => (
    <div className="bg-[#111111] p-5 rounded-xl border border-[#222222] hover:border-[#333333] transition-all duration-150 group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#1A1A1A] rounded-lg text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            {trend && (
                <div className={cn(
                    "flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    trend === 'up' ? "bg-[#22C55E1A] text-[#22C55E]" : "bg-[#EF44441A] text-[#EF4444]"
                )}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {trendValue}%
                </div>
            )}
        </div>
        <div className="space-y-1">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#555555]">{title}</h3>
            <p className="text-2xl font-semibold text-[#F5F5F5] tracking-tight">{value}</p>
            {description && <p className="text-xs text-[#555555] font-medium">{description}</p>}
        </div>
    </div>
);

export default function DashboardPage() {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [proposedBudget, setProposedBudget] = useState('');
    const [proposedDeadline, setProposedDeadline] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
    });

    const { data: requestsData, isLoading: isRequestsLoading } = useQuery({
        queryKey: ['incoming-requests'],
        queryFn: () => workRequestsApi.list(),
    });

    const acceptMutation = useMutation({
        mutationFn: ({ id, budget, deadline }) => workRequestsApi.accept(id, { budget, deadline }),
        onSuccess: () => {
            queryClient.invalidateQueries(['incoming-requests']);
            setSelectedRequest(null);
            setProposedBudget('');
            setProposedDeadline('');
        },
    });

    const declineMutation = useMutation({
        mutationFn: (id) => workRequestsApi.decline(id),
        onSuccess: () => queryClient.invalidateQueries(['incoming-requests']),
    });

    const requests = requestsData?.results?.filter(r => ['PENDING', 'PROPOSED'].includes(r.status)) || [];

    useEffect(() => {
        const requestId = searchParams.get('request');
        if (requestId && requestsData?.results) {
            const req = requestsData.results.find(r => r.id.toString() === requestId);
            if (req) {
                setSelectedRequest(req);
                setProposedBudget(req.budget || '');
                setProposedDeadline(req.deadline || '');
                // Clear the search param after selecting so it doesn't reopen on every render
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('request');
                setSearchParams(newParams, { replace: true });
            }
        }
    }, [searchParams, requestsData, setSearchParams]);

    if (isStatsLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <div className="h-7 w-48 bg-[#1A1A1A] animate-pulse rounded" />
                    <div className="h-4 w-64 bg-[#1A1A1A] animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#111111] border border-[#222222] rounded-xl animate-pulse" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-[#111111] border border-[#222222] rounded-xl animate-pulse" />
                    <div className="h-96 bg-[#111111] border border-[#222222] rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight text-[#F5F5F5]">Dashboard Overview</h1>
                    <p className="text-sm text-[#A0A0A0]">
                        Track your business performance and recent activities.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/invoices/new"
                        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150 active:scale-[0.98] flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </Link>
                </div>
            </div>

            {/* Incoming Requests Section (Only if there are pending requests) */}
            {requests.length > 0 && (
                <div className="bg-[#111111] border border-primary/20 rounded-xl overflow-hidden shadow-2xl shadow-primary/5 animate-in slide-in-from-top-4 duration-500">
                    <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">New Work Inquiries</h3>
                        </div>
                        <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full">
                            {requests.length} Action Required
                        </span>
                    </div>
                    <div className="divide-y divide-[#222222]">
                        {requests.map((request) => (
                            <div 
                                key={request.id} 
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#1A1A1A] transition-colors cursor-pointer group/item"
                                onClick={(e) => {
                                    if (e.target.closest('button')) return;
                                    setSelectedRequest(request);
                                }}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#333333] flex items-center justify-center shrink-0">
                                        <Briefcase className="w-6 h-6 text-[#555555]" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[#F5F5F5] font-semibold group-hover/item:text-primary transition-colors">{request.title}</h4>
                                        <p className="text-sm text-[#A0A0A0] line-clamp-1">{request.description}</p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <p className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">From: {request.client_name}</p>
                                            <span className="w-1 h-1 bg-[#333333] rounded-full" />
                                            <p className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Deadline: {new Date(request.deadline).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {request.status === 'PROPOSED' ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-3 py-1 bg-[#3B82F61A] text-[#3B82F6] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#3B82F633]">
                                                Proposal Sent
                                            </span>
                                            <p className="text-[9px] text-[#555555] font-bold uppercase tracking-wider">Waiting for client</p>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => declineMutation.mutate(request.id)}
                                                disabled={declineMutation.isPending}
                                                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#EF44441A] text-[#555555] hover:text-[#EF4444] text-[10px] font-black uppercase tracking-widest border border-[#333333] hover:border-[#EF4444] rounded-lg transition-all"
                                            >
                                                Decline
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setProposedBudget(request.budget || '');
                                                    setProposedDeadline(request.deadline || '');
                                                }}
                                                disabled={acceptMutation.isPending}
                                                className="px-6 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2"
                                            >
                                                {acceptMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3" /> Accept</>}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.total_revenue?.toLocaleString() || '0'}`}
                    icon={DollarSign}
                    trend="up"
                    trendValue="12"
                    description="Gross earnings"
                />
                <StatCard
                    title="Active Projects"
                    value={stats?.active_projects || '0'}
                    icon={Briefcase}
                    description="In progress"
                />
                <StatCard
                    title="Pending Invoices"
                    value={stats?.pending_invoices || '0'}
                    icon={FileText}
                    description={`₹${stats?.pending_amount?.toLocaleString() || '0'} total`}
                />
                <StatCard
                    title="Total Clients"
                    value={stats?.total_clients || '0'}
                    icon={Users}
                    description="In network"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-[#111111] p-6 rounded-xl border border-[#222222]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-medium text-[#F5F5F5]">Revenue Overview</h3>
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#555555] px-2 py-1 bg-[#1A1A1A] rounded border border-[#222222]">
                            Last 6 Months
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        {stats?.monthly_revenue ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthly_revenue}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222222" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#555555' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#555555' }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1A1A1A',
                                            borderColor: '#333333',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            color: '#F5F5F5'
                                        }}
                                        itemStyle={{ color: '#7C3AED' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#7C3AED"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRev)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A] rounded-lg">
                                <p className="text-xs text-[#555555]">No revenue data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-[#111111] p-6 rounded-xl border border-[#222222] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-[#F5F5F5]">Recent Invoices</h3>
                        <Link to="/invoices" className="text-xs font-medium text-[#7C3AED] hover:underline">View all</Link>
                    </div>
                    <div className="space-y-4 flex-1">
                        {stats?.recent_invoices?.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#222222] flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-[#555555]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-[#F5F5F5]">{invoice.client_name}</p>
                                        <p className="text-[11px] text-[#555555] font-medium uppercase tracking-tight">{invoice.invoice_number}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-sm font-semibold text-[#F5F5F5]">₹{invoice.total.toLocaleString()}</p>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                        invoice.status === 'PAID' ? "bg-[#22C55E1A] text-[#22C55E]" :
                                            invoice.status === 'OVERDUE' ? "bg-[#EF44441A] text-[#EF4444]" :
                                                "bg-[#3B82F61A] text-[#3B82F6]"
                                    )}>
                                        {invoice.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link
                        to="/invoices/new"
                        className="w-full mt-6 py-2.5 bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] text-xs font-medium rounded-lg border border-[#222222] hover:border-[#333333] transition-all duration-150 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Invoice
                    </Link>
                </div>
            </div>
            {/* Work Request Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setSelectedRequest(null)} />
                    <div className="relative bg-[#111111] w-full max-w-2xl rounded-2xl border border-[#222222] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#F5F5F5] tracking-tight">Work Inquiry Details</h2>
                                        <p className="text-[10px] font-bold text-[#555555] uppercase tracking-widest mt-1">From: {selectedRequest.client_name}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedRequest(null)}
                                    className="p-2 hover:bg-[#1A1A1A] rounded-xl transition-colors border border-transparent hover:border-[#333333]"
                                >
                                    <X className="w-5 h-5 text-[#555555]" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-lg font-semibold text-[#F5F5F5]">{selectedRequest.title}</h4>
                                    <div className="p-6 bg-[#0A0A0A] rounded-2xl border border-[#222222] min-h-[200px]">
                                        <p className="text-sm text-[#A0A0A0] leading-relaxed whitespace-pre-wrap">
                                            {selectedRequest.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl border border-[#222222]">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#555555]" />
                                        <p className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Client's Target Deadline</p>
                                    </div>
                                    <p className="text-xs font-semibold text-[#F5F5F5]">{new Date(selectedRequest.deadline).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#555555] uppercase tracking-widest ml-1">Your Proposed Budget (₹)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                                            <input 
                                                type="number" 
                                                value={proposedBudget}
                                                onChange={(e) => setProposedBudget(e.target.value)}
                                                placeholder="e.g. 5000"
                                                className="w-full pl-9 pr-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#F5F5F5] outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#555555] uppercase tracking-widest ml-1">Your Proposed Deadline</label>
                                        <input 
                                            type="date" 
                                            value={proposedDeadline}
                                            onChange={(e) => setProposedDeadline(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#F5F5F5] outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => {
                                        declineMutation.mutate(selectedRequest.id);
                                        setSelectedRequest(null);
                                    }}
                                    disabled={declineMutation.isPending}
                                    className="flex-1 py-4 bg-[#1A1A1A] text-[#555555] hover:text-[#EF4444] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#222222] hover:border-[#EF4444] transition-all"
                                >
                                    Decline Request
                                </button>
                                <button 
                                    onClick={() => {
                                        acceptMutation.mutate({ 
                                            id: selectedRequest.id, 
                                            budget: proposedBudget, 
                                            deadline: proposedDeadline 
                                        });
                                    }}
                                    disabled={acceptMutation.isPending}
                                    className="flex-[2] py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                                >
                                    {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Accept Project</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
