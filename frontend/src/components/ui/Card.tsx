import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './Badge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-gradient-card border border-default rounded-lg p-5 overflow-hidden',
                    hoverEffect && 'transition-all duration-300 hover:border-accent hover:shadow-glow-teal hover:-translate-y-[2px]',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
