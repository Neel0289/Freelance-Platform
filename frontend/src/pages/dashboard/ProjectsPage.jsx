import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects';
import {
    Plus,
    Search,
    Briefcase,
    Calendar,
    Clock,
    AlertCircle,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function ProjectsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const { data, isLoading } = useQuery({
        queryKey: ['projects', { search, statusFilter }],
        queryFn: () => projectsApi.list({
            search,
            status: statusFilter === 'ALL' ? undefined : statusFilter
        }),
    });

    const projects = data?.results || [];

    const statusStyles = {
        ACTIVE: "bg-[#3B82F61A] text-[#3B82F6] border-[#3B82F633]",
        COMPLETED: "bg-[#22C55E1A] text-[#22C55E] border-[#22C55E33]",
        PAUSED: "bg-[#F59E0B1A] text-[#F59E0B] border-[#F59E0B33]",
        ARCHIVED: "bg-[#1A1A1A] text-[#555555] border-[#222222]",
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight text-[#F5F5F5]">Projects</h1>
                    <p className="text-sm text-[#A0A0A0]">
                        Manage your active works and historical data.
                    </p>
                </div>
                <Link
                    to="/projects/new"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0A0A0A] border border-[#222222] rounded-lg text-sm text-[#F5F5F5] placeholder-[#555555] focus:border-[#7C3AED] outline-none ring-1 ring-transparent focus:ring-[#7C3AED40] transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex p-1 bg-[#111111] border border-[#222222] rounded-lg overflow-x-auto whitespace-nowrap scrollbar-none">
                    {['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all",
                                statusFilter === status
                                    ? "bg-[#1A1A1A] text-[#F5F5F5] shadow-sm border border-[#333333]"
                                    : "text-[#555555] hover:text-[#A0A0A0]"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-56 bg-[#111111] border border-[#222222] rounded-xl animate-pulse" />)}
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-[#111111] rounded-xl border border-[#222222] hover:border-[#333333] transition-all duration-150 group flex flex-col"
                        >
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-[#1A1A1A] border border-[#222222] rounded-lg flex items-center justify-center text-[#A0A0A0] transition-colors group-hover:text-[#F5F5F5]">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight border",
                                        statusStyles[project.status]
                                    )}>
                                        {project.status}
                                    </span>
                                </div>

                                <h3 className="text-base font-semibold text-[#F5F5F5] mb-1 group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                                    {project.title}
                                </h3>
                                <p className="text-[11px] text-[#555555] font-bold uppercase tracking-tight mb-4">
                                    Client: <span className="text-[#A0A0A0]">{project.client_name}</span>
                                </p>

                                <p className="text-xs text-[#A0A0A0] line-clamp-2 mb-6 h-8 leading-relaxed">
                                    {project.description || 'No description provided.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1A1A1A]">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555555]">
                                            <Calendar className="w-3 h-3" />
                                            Due Date
                                        </div>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            project.due_date && new Date(project.due_date) < new Date() && project.status !== 'COMPLETED'
                                                ? "text-[#EF4444]"
                                                : "text-[#F5F5F5]"
                                        )}>
                                            {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'TBD'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555555]">
                                            <Clock className="w-3 h-3" />
                                            Hours
                                        </div>
                                        <p className="text-xs font-medium text-[#F5F5F5]">{project.total_hours} Logged</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-3.5 bg-[#161616]/50 border-t border-[#222222] flex justify-between items-center rounded-b-xl">
                                <div className="text-sm font-semibold text-[#F5F5F5]">
                                    <span className="text-[#555555] font-bold text-xs mr-1">{project.currency}</span>
                                    {project.budget?.toLocaleString()}
                                </div>
                                <Link
                                    to={`/projects/${project.id}`}
                                    className="p-1.5 text-[#555555] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] rounded-lg transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#111111] border border-[#222222] rounded-xl py-20 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center space-y-3 opacity-50">
                        <AlertCircle className="w-10 h-10 text-[#555555]" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-[#F5F5F5]">No projects found</p>
                            <p className="text-xs text-[#555555]">Try adjusting your search or add a new project.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
