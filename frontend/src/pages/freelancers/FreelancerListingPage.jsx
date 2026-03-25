import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { freelancersApi } from '../../api/freelancers';
import { 
    Search, 
    Filter, 
    User as UserIcon, 
    Star, 
    CheckCircle2, 
    MapPin, 
    Briefcase,
    Zap,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function FreelancerListingPage() {
    const [search, setSearch] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');

    const { data: freelancers, isLoading } = useQuery({
        queryKey: ['freelancers', search, skillFilter, availabilityFilter],
        queryFn: () => freelancersApi.list({
            search,
            skill: skillFilter,
            availability: availabilityFilter === 'all' ? '' : availabilityFilter
        }),
    });

    const categories = ['Design', 'Development', 'Marketing', 'Writing', 'Management'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 md:p-12 text-background shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Discover Top Talent</h1>
                    <p className="text-lg opacity-80 font-medium leading-relaxed">
                        Connect with the world's best freelancers. Our network of verified professionals is ready to bring your ideas to life.
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                <div className="lg:col-span-5 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Freelancers</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, title or skill..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category / Skill</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSkillFilter(skillFilter === cat ? '' : cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                    skillFilter === cat 
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Availability</label>
                    <div className="flex bg-card p-1 border border-border rounded-xl">
                        {['all', 'true'].map((val) => (
                            <button
                                key={val}
                                onClick={() => setAvailabilityFilter(val)}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    availabilityFilter === val 
                                        ? "bg-foreground text-background shadow-md shadow-foreground/10" 
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {val === 'all' ? 'All' : 'Available Now'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-card rounded-3xl border border-border p-6 space-y-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-muted" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-muted rounded w-2/3" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-20 bg-muted rounded-2xl" />
                            <div className="flex gap-2">
                                <div className="h-6 bg-muted rounded-full w-16" />
                                <div className="h-6 bg-muted rounded-full w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : freelancers?.results?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {freelancers.results.map((freelancer) => (
                        <Link 
                            key={freelancer.id}
                            to={`/portal/freelancers/${freelancer.id}`}
                            className="group bg-card rounded-3xl border border-border p-6 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                {freelancer.availability ? (
                                    <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                                        <Zap className="w-2.5 h-2.5 fill-current" />
                                        Available
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-border">
                                        Busy
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden border-2 border-background shadow-lg group-hover:scale-105 transition-transform">
                                        {freelancer.avatar ? (
                                            <img src={freelancer.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                                <UserIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    {freelancer.availability && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-sm" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-lg group-hover:text-primary transition-colors truncate">
                                        {freelancer.first_name} {freelancer.last_name}
                                    </h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">
                                        {freelancer.title || 'Freelancer'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium min-h-[32px]">
                                    {freelancer.bio || 'Highly skilled professional ready to tackle your next big project. Passionate about quality and delivering results.'}
                                </p>

                                <div className="flex flex-wrap gap-1.5">
                                    {(freelancer.skills || ['React', 'UI Design', 'Node.js']).slice(0, 3).map((skill) => (
                                        <span key={skill} className="px-2.5 py-1 bg-muted/50 rounded-lg text-[10px] font-bold text-muted-foreground border border-border">
                                            {skill}
                                        </span>
                                    ))}
                                    {freelancer.skills?.length > 3 && (
                                        <span className="px-2 py-1 text-[10px] font-black text-primary">
                                            +{freelancer.skills.length - 3} more
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                            <span className="text-xs font-black">{freelancer.rating?.toFixed(1) || '5.0'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Jobs Done</p>
                                        <span className="text-xs font-black">{freelancer.completed_jobs || '12'} Completed</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="w-full py-3 bg-muted group-hover:bg-primary group-hover:text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group-active:scale-95">
                                        View Profile
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-3xl border-2 border-dashed border-border py-20 text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-lg font-black mb-2">No freelancers found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Try adjusting your search or filters to find the perfect match for your project.
                    </p>
                    <button 
                        onClick={() => {setSearch(''); setSkillFilter(''); setAvailabilityFilter('all');}}
                        className="mt-6 text-xs font-black text-primary hover:underline uppercase tracking-widest"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
}
