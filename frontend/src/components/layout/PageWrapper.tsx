import { ReactNode } from 'react';
import { cn } from '../ui/Badge';

export function PageWrapper({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <main className={cn("flex-1 w-full max-w-7xl mx-auto px-6 py-8", className)}>
            {children}
        </main>
    );
}
