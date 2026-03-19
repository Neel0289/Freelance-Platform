import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contractsApi } from '../../api/contracts';
import {
    FileCheck,
    Search,
    Clock,
    CheckCircle2,
    Plus,
    ArrowRight,
    User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function ContractsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const { data, isLoading } = useQuery({
        queryKey: ['contracts', { search, statusFilter }],
        queryFn: () => contractsApi.list({
            search,
            status: statusFilter === 'ALL' ? undefined : statusFilter
        }),
    });

    const contracts = data?.results || [];

    const statusColors = {
        DRAFT: "bg-muted text-muted-foreground border-border",
        SENT: "bg-blue-100 text-blue-700 border-blue-200",
        SIGNED: "bg-green-100 text-green-700 border-green-200",
        CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage legal agreements and signatures
                    </p>
                </div>
                <Link
                    to="/contracts/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Create Contract
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search contracts by project title or client..."
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 p-1 bg-muted rounded-lg overflow-x-auto whitespace-nowrap">
                    {['ALL', 'DRAFT', 'SENT', 'SIGNED'].map((status) => (
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

            {/* Contracts Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agreement</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                [1, 2].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6"><div className="h-10 bg-muted rounded-md" /></td>
                                    </tr>
                                ))
                            ) : contracts.length > 0 ? (
                                contracts.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                                                    <FileCheck className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <Link
                                                        to={`/contracts/${contract.id}`}
                                                        className="text-sm font-bold hover:text-primary transition-colors"
                                                    >
                                                        {contract.project_title || 'Service Agreement'}
                                                    </Link>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        ID: {contract.id.toString().padStart(6, '0')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                {contract.client_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                                                statusColors[contract.status]
                                            )}>
                                                {contract.status === 'SIGNED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {contract.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(contract.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/contracts/${contract.id}`}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <FileCheck className="w-12 h-12 mb-4" />
                                            <p className="text-lg font-medium">No contracts found</p>
                                            <p className="text-sm">Create an agreement to start working with your clients.</p>
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
