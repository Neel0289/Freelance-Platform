import { Outlet } from 'react-router-dom';

export default function PortalLayout() {
    return (
        <div className="min-h-screen bg-background">
            <header className="h-16 border-b border-border bg-card flex items-center px-4 md:px-8 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto w-full flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">A</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline">Freelancer Platform</span>
                        <span className="text-muted-foreground text-sm ml-2 hidden md:inline border-l border-border pl-4">Client Portal</span>
                    </div>
                </div>
            </header>
            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
