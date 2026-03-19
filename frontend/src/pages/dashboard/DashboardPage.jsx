import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
    });

    if (isLoading) {
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
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.monthly_revenue}>
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
        </div>
    );
}
