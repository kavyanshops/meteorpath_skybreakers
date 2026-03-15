import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Star, Camera, ArrowDown, Clock } from 'lucide-react';
import { EventSummary } from '../../types';
import { Badge, cn } from '../ui/Badge';
import { Card } from '../ui/Card';
import { StatChip } from '../ui/StatChip';

interface EventCardProps {
    event: EventSummary;
}

export function EventCard({ event }: EventCardProps) {
    const getVelocityTextGradient = (v: number | null) => {
        if (!v) return '';
        if (v < 20) return 'bg-gradient-to-r from-status-success to-teal-200';
        if (v < 40) return 'bg-gradient-teal';
        if (v < 60) return 'bg-gradient-fire';
        return 'bg-gradient-to-r from-status-error to-rose-400';
    };

    const velocityGradient = getVelocityTextGradient(event.entry_velocity_km_s);

    return (
        <Link to={`/events/${event.id}`} className="block h-full cursor-pointer">
            <Card hoverEffect className="h-full flex flex-col relative group">

                {/* Top Row: Network + Time */}
                <div className="flex justify-between items-start mb-4">
                    <Badge variant={event.network.toLowerCase() as any}>{event.network}</Badge>
                    <span className="font-mono text-xs text-muted">
                        {format(new Date(event.begin_utc), 'yyyy-MM-dd HH:mm:ss')}
                    </span>
                </div>

                <div className="h-[1px] w-full bg-border-subtle mb-6" />

                {/* Center: The Big Stat */}
                <div className="flex flex-col items-center justify-center mb-8 flex-grow">
                    <div className="flex items-baseline gap-2">
                        <span className={cn(
                            "font-display font-bold text-6xl tracking-tighter bg-clip-text text-transparent",
                            velocityGradient || "bg-secondary"
                        )}>
                            {event.entry_velocity_km_s?.toFixed(1) || '--'}
                        </span>
                        <span className="text-lg text-secondary font-medium">km/s</span>
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-muted mt-2">Entry Velocity</span>
                </div>

                {/* 2x2 Grid Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatChip
                        icon={<Star className="w-4 h-4 text-accent-fire" />}
                        label="Peak Mag"
                        value={event.peak_abs_magnitude?.toFixed(1) || '--'}
                        valueClassName="text-accent-fire"
                    />
                    <StatChip
                        icon={<Camera className="w-4 h-4 text-accent-primary" />}
                        label="Stations"
                        value={event.station_count || '--'}
                    />
                    <StatChip
                        icon={<ArrowDown className="w-4 h-4 text-status-info" />}
                        label="Begin Ht"
                        value={event.begin_ht_km?.toFixed(0) || '--'}
                        unit="km"
                    />
                    <StatChip
                        icon={<Clock className="w-4 h-4 text-status-success" />}
                        label="Duration"
                        value={'--'} // Duration not in summary, just a stub
                        unit="s"
                    />
                </div>

                {/* Bottom tags */}
                <div className="flex items-center justify-between mt-auto">
                    {event.shower_code ? (
                        <Badge variant="outline" className="text-accent-secondary border-accent-secondary/30 bg-accent-secondary-glow">
                            {event.shower_code}
                        </Badge>
                    ) : (
                        <Badge variant="default" className="opacity-70">Sporadic</Badge>
                    )}
                    <span className="text-sm text-primary truncate max-w-[150px]" title={event.region || ''}>
                        {event.region || 'Unknown Region'}
                    </span>
                </div>

                {/* Status Indicator (Pending/Done) */}
                <div className="absolute top-4 right-1/2 translate-x-12 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={cn("w-2 h-2 rounded-full", event.has_reconstruction ? "bg-status-success animate-pulse-ring" : "bg-muted")} />
                </div>

                {/* Very bottom gradient accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-teal opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
        </Link>
    );
}
