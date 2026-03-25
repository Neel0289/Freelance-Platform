import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../api/notifications';
import { Bell, Check, Clock, Info, Briefcase, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationsApi.list(),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
    
    const notifications = notificationsData?.results || [];

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const markReadMutation = useMutation({
        mutationFn: (id) => notificationsApi.markRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => notificationsApi.markAllRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleNotificationClick = (n) => {
        if (!n.is_read) {
            markReadMutation.mutate(n.id);
        }
        
        if (n.type === 'WORK_REQUEST' && n.data?.work_request_id) {
            navigate(`/dashboard?request=${n.data.work_request_id}`);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-border flex justify-between items-center">
                            <h3 className="font-bold">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllReadMutation.mutate()}
                                    className="text-[10px] font-bold text-primary hover:underline uppercase"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto divide-y divide-border">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={cn(
                                            "p-4 flex gap-3 transition-colors hover:bg-muted/50 cursor-pointer relative group",
                                            !n.is_read && "bg-primary/5"
                                        )}
                                    >
                                        <div className="mt-1">
                                            {n.type === 'PAYMENT' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : n.type === 'INVOICE' ? (
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            ) : n.type === 'WORK_REQUEST' ? (
                                                <Briefcase className="w-4 h-4 text-primary" />
                                            ) : (
                                                <Info className="w-4 h-4 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs leading-relaxed">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!n.is_read && (
                                            <button
                                                onClick={() => markReadMutation.mutate(n.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded-md transition-all self-center"
                                            >
                                                <Check className="w-3 h-3 text-primary" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground italic text-sm">
                                    No new notifications
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
