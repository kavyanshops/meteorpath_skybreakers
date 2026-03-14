import { HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gmn' | 'nasa' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const baseStyles = 'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono uppercase font-medium transition-colors border';

    const variants = {
        default: 'bg-elevated text-primary border-default',
        success: 'bg-status-success/10 text-status-success border-status-success/20',
        warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
        error: 'bg-status-error/10 text-status-error border-status-error/20',
        info: 'bg-status-info/10 text-status-info border-status-info/20',
        gmn: 'bg-gradient-badge-gmn text-accent-primary border-border-accent',
        nasa: 'bg-gradient-badge-nasa text-status-info border-status-info/40',
        outline: 'bg-transparent text-secondary border-strong',
    };

    return (
        <span
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        />
    );
}
