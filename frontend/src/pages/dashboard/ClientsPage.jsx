import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../api/clients';
import {
    Plus,
    Search,
    Mail,
    Phone,
    Building2,
    ExternalLink,
    Trash2,
    Edit2,
    MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function ClientsPage() {
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['clients', { search }],
        queryFn: () => clientsApi.list({ search }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => clientsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });

    const clients = data?.results || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight text-[#F5F5F5]">Clients</h1>
                    <p className="text-sm text-[#A0A0A0]">
                        Manage your network and client information.
                    </p>
                </div>
                <Link
                    to="/clients/new"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Client
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0A0A0A] border border-[#222222] rounded-lg text-sm text-[#F5F5F5] placeholder-[#555555] focus:border-[#7C3AED] outline-none ring-1 ring-transparent focus:ring-[#7C3AED40] transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg px-3 py-2 text-xs font-medium text-[#A0A0A0] flex items-center gap-2 cursor-pointer hover:bg-[#111111] transition-colors">
                    Filter by Currency
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#0A0A0A] border-b border-[#222222]">
                                <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-widest text-[#555555]">Client</th>
                                <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-widest text-[#555555]">Contact Details</th>
                                <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-widest text-[#555555]">Currency</th>
                                <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-widest text-[#555555]">Date Added</th>
                                <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-widest text-[#555555]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A1A1A]">
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="px-5 py-4"><div className="h-4 w-32 bg-[#1A1A1A] animate-pulse rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-48 bg-[#1A1A1A] animate-pulse rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-12 bg-[#1A1A1A] animate-pulse rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-[#1A1A1A] animate-pulse rounded" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-8 bg-[#1A1A1A] animate-pulse rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : clients.length > 0 ? (
                                clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-[#161616] transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#222222] text-[#A0A0A0] flex items-center justify-center text-xs font-bold">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <Link
                                                        to={`/clients/${client.id}`}
                                                        className="text-sm font-medium text-[#F5F5F5] hover:text-[#7C3AED] transition-colors"
                                                    >
                                                        {client.name}
                                                    </Link>
                                                    {client.company && (
                                                        <p className="text-[11px] text-[#555555] font-medium flex items-center gap-1 mt-0.5">
                                                            <Building2 className="w-3 h-3" />
                                                            {client.company}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                <p className="text-xs text-[#A0A0A0] flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-[#555555]" />
                                                    {client.email}
                                                </p>
                                                {client.phone && (
                                                    <p className="text-xs text-[#A0A0A0] flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-[#555555]" />
                                                        {client.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1A1A1A] text-[#A0A0A0] rounded border border-[#222222] uppercase tracking-tight">
                                                {client.currency}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-[#555555]">
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/clients/${client.id}/edit`}
                                                    className="p-1.5 text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this client?')) {
                                                            deleteMutation.mutate(client.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#EF44441A] rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="p-1.5 text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] rounded-lg">
                                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2 opacity-50">
                                            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-[#555555]" />
                                            </div>
                                            <p className="text-sm font-medium text-[#F5F5F5]">No clients found</p>
                                            <p className="text-xs text-[#555555]">Add your first client to get started</p>
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
