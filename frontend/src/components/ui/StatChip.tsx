import { ReactNode } from 'react';
import { cn } from './Badge';

interface StatChipProps {
    iconLayout?: 'horizontal' | 'vertical';
    icon: ReactNode;
    label: string;
    value: ReactNode;
    unit?: string;
    className?: string;
    valueClassName?: string;
}

export function StatChip({
    iconLayout = 'horizontal',
    icon,
    label,
    value,
    unit,
    className,
    valueClassName,
}: StatChipProps) {
    if (iconLayout === 'vertical') {
        return (
            <div className={cn("bg-void rounded-md border border-default p-3 flex flex-col items-center justify-center text-center gap-1.5", className)}>
                <div className="text-secondary opacity-70 mb-1">{icon}</div>
                <span className="text-muted text-[10px] uppercase font-mono tracking-wider">{label}</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={cn("text-primary font-mono text-xl", valueClassName)}>{value}</span>
                    {unit && <span className="text-muted text-xs font-mono">{unit}</span>}
                </div>
            </div>
        );
    }

    // Horizontal layout (default)
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="flex bg-elevated/50 p-2 rounded-md text-secondary">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-muted text-[10px] uppercase font-mono tracking-wider">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className={cn("text-primary font-mono text-sm font-medium", valueClassName)}>{value}</span>
                    {unit && <span className="text-muted text-[10px] font-mono">{unit}</span>}
                </div>
            </div>
        </div>
    );
}
