import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { freelancersApi } from '../../api/freelancers';
import { workRequestsApi } from '../../api/workRequests';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { 
    User as UserIcon, 
    Star, 
    Zap, 
    Mail, 
    Phone, 
    Globe, 
    Calendar,
    Briefcase,
    ShieldCheck,
    MessageSquare,
    ChevronLeft,
    Plus,
    X,
    Upload,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Check,
    Clock
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function FreelancerProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    const { data: freelancer, isLoading } = useQuery({
        queryKey: ['freelancer', id],
        queryFn: () => freelancersApi.get(id),
    });

    const sendRequestMutation = useMutation({
        mutationFn: (data) => workRequestsApi.create(data),
        onSuccess: () => {
            setRequestSuccess(true);
            setTimeout(() => {
                setIsRequestModalOpen(false);
                setRequestSuccess(false);
            }, 3000);
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin text-primary">
                    <Zap className="w-8 h-8 fill-current" />
                </div>
            </div>
        );
    }

    if (!freelancer) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-black">Freelancer not found</h2>
                <button 
                    onClick={() => navigate('/portal/freelancers')}
                    className="mt-4 text-primary font-bold"
                >
                    Back to discovery
                </button>
            </div>
        );
    }

    const isClient = currentUser?.role === 'CLIENT';

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Navigation */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Header & Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-card rounded-3xl border border-border p-8 text-center space-y-6 shadow-xl shadow-primary/5">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-3xl bg-muted overflow-hidden border-4 border-background shadow-2xl mx-auto">
                                {freelancer.avatar ? (
                                    <img src={freelancer.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                        <UserIcon className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            {freelancer.availability && (
                                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-background shadow-xl" />
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl font-black tracking-tight">{freelancer.first_name} {freelancer.last_name}</h1>
                            <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">
                                {freelancer.title || 'Professional Freelancer'}
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                            <div className="text-center">
                                <p className="text-xl font-black">{freelancer.rating?.toFixed(1) || '5.0'}</p>
                                <div className="flex items-center gap-0.5 mt-0.5 justify-center">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-2.5 h-2.5 text-yellow-500 fill-current" />)}
                                </div>
                            </div>
                            <div className="w-px h-8 bg-border" />
                            <div className="text-center">
                                <p className="text-xl font-black">{freelancer.completed_jobs || '12'}</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Projects Done</p>
                            </div>
                        </div>

                        {isClient && (
                            <button 
                                onClick={() => setIsRequestModalOpen(true)}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all group flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Send Work Request
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>

                    <div className="bg-card rounded-3xl border border-border p-8 space-y-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest border-b border-border pb-4">Availability Status</h3>
                        {freelancer.availability ? (
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
                                <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                                    <Zap className="w-5 h-5 fill-current" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-green-700 uppercase tracking-tight">Available Now</p>
                                    <p className="text-[10px] text-green-600 font-bold opacity-80">Ready to start immediately</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border opacity-60">
                                <div className="w-10 h-10 rounded-xl bg-muted-foreground/20 text-muted-foreground flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-tight">Busy</p>
                                    <p className="text-[10px] text-muted-foreground font-bold">Currently in a project</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Profile Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* About Section */}
                    <div className="bg-card rounded-3xl border border-border p-8 md:p-10 space-y-8 shadow-sm">
                        <div>
                            <h3 className="text-xl font-black mb-4">About the Professional</h3>
                            <p className="text-muted-foreground leading-relaxed font-medium">
                                {freelancer.bio || "With a passion for excellence and a commitment to delivering high-quality results, I bring years of experience to every project. I specialize in creating innovative solutions that help businesses grow and succeed in today's competitive landscape."}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Expertise & Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {(freelancer.skills || ['React', 'Node.js', 'Typescript', 'Figma', 'UI/UX Design', 'PostgreSQL']).map((skill) => (
                                    <span key={skill} className="px-4 py-2 bg-muted rounded-xl text-xs font-bold text-foreground border border-border shadow-sm hover:border-primary/30 transition-colors cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Items */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black">Portfolio Showcase</h3>
                            <div className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary/10">
                                {freelancer.portfolio_items?.length || 0} Pieces
                            </div>
                        </div>

                        {freelancer.portfolio_items?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {freelancer.portfolio_items.map((item) => (
                                    <div key={item.id} className="group bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5">
                                        <div className="aspect-video bg-muted relative overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/[0.03]">
                                                    <Briefcase className="w-12 h-12 text-primary opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 space-y-2">
                                            <h4 className="font-black text-lg">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground font-medium line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-muted/30 rounded-3xl border-2 border-dashed border-border py-20 text-center">
                                <Briefcase className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground font-bold italic">Portfolio items will appear here soon.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Work Request Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsRequestModalOpen(false)} />
                    <div className="relative bg-card w-full max-w-xl rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {requestSuccess ? (
                            <div className="p-12 text-center space-y-6">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black mb-2">Request Sent!</h2>
                                    <p className="text-muted-foreground font-medium">
                                        Your work request has been sent to {freelancer.first_name}. You'll be notified when they respond.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    sendRequestMutation.mutate({
                                        freelancer: id,
                                        title: formData.get('title'),
                                        description: formData.get('description'),
                                        deadline: formData.get('deadline'),
                                    });
                                }}
                                className="p-8 space-y-6"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">Send Work Request</h2>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">To: {freelancer.first_name} {freelancer.last_name}</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setIsRequestModalOpen(false)}
                                        className="p-2 hover:bg-muted rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Project Title</label>
                                        <input 
                                            name="title"
                                            required
                                            placeholder="What do you need help with?"
                                            className="w-full px-4 py-3.5 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Project Description</label>
                                        <textarea 
                                            name="description"
                                            required
                                            rows={5}
                                            placeholder="Provide some details about the project, requirements, and scope..."
                                            className="w-full px-4 py-3.5 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Timeline / Deadline</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input 
                                                name="deadline"
                                                type="date"
                                                required
                                                className="w-full pl-11 pr-4 py-3.5 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tighter">Attach Files</p>
                                                <p className="text-[10px] text-muted-foreground font-bold">Briefs, images, or docs</p>
                                            </div>
                                        </div>
                                        <button type="button" className="px-4 py-2 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors">
                                            Browse
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsRequestModalOpen(false)}
                                        className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={sendRequestMutation.isPending}
                                        className="flex-[2] py-4 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-foreground/10"
                                    >
                                        {sendRequestMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Submit Request
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Dummy DIV for styled component if needed, or just use regular div
const DIV = 'div';
