import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';
import { cn } from './Badge';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
}

export function TooltipProvider({ children }: { children: ReactNode }) {
    return <TooltipPrimitive.Provider delayDuration={200}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({ children, content, side = 'top', align = 'center', className }: TooltipProps) {
    return (
        <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    align={align}
                    sideOffset={5}
                    className={cn(
                        'z-50 overflow-hidden rounded-md bg-overlay px-3 py-1.5 text-xs text-primary shadow-md border border-default animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                        className
                    )}
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-overlay" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
}
