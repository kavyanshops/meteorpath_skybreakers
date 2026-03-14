import { AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';

interface PlaceholderChartProps {
    title: string;
    className?: string;
    isPending?: boolean;
}

export function PlaceholderChart({ title, className, isPending = true }: PlaceholderChartProps) {
    return (
        <Card className={`relative flex flex-col ${className}`}>
            <h3 className="text-secondary font-mono text-xs uppercase tracking-widest mb-4">
                {title}
            </h3>

            <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-subtle rounded bg-deep/50 p-6 text-center">
                <AlertCircle className="w-8 h-8 text-muted mb-3" />

                {isPending ? (
                    <>
                        <p className="text-primary font-medium text-sm mb-1">Data Unavailable</p>
                        <p className="text-muted text-xs">
                            This chart will populate once trajectory reconstruction is complete.
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-primary font-medium text-sm mb-1">Insufficient Data</p>
                        <p className="text-muted text-xs">
                            Not enough points to generate this visualization.
                        </p>
                    </>
                )}
            </div>

            {/* Fake grid lines in background */}
            <div className="absolute inset-x-5 inset-y-[4.5rem] pointer-events-none overflow-hidden opacity-10">
                <div className="w-full h-full border-t border-l border-primary/20 flex flex-col justify-between">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-full h-[1px] bg-primary/20" />
                    ))}
                </div>
            </div>
        </Card>
    );
}
