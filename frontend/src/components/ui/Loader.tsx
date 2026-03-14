import { cn } from './Badge';

export function Loader({ className }: { className?: string }) {
    return (
        <div className={cn("relative w-12 h-12 flex items-center justify-center", className)}>
            {/* Outer orbit path */}
            <div className="absolute inset-0 rounded-full border border-default/20" />

            {/* Meteor rotating */}
            <div className="absolute inset-0 animate-[orbit_1.5s_linear_infinite]">
                <div className="relative w-full h-full">
                    {/* Meteor head */}
                    <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-accent-primary rounded-full blur-[2px] -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white rounded-full -translate-y-1/2" />

                    {/* Meteor tail */}
                    <div className="absolute top-1/2 right-0 w-8 h-[2px] bg-gradient-to-l from-accent-primary to-transparent -translate-y-1/2" />
                </div>
            </div>

            {/* Center dot */}
            <div className="w-1.5 h-1.5 bg-surface rounded-full border border-accent/30" />
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
            <Loader />
            <span className="text-muted text-xs font-mono uppercase tracking-widest animate-pulse">Initializing Data</span>
        </div>
    );
}
