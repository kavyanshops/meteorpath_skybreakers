import { format } from 'date-fns';
import { Network } from 'lucide-react';
import { EventSummary } from '../../types';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import { useCompareStore } from '../../store/compareStore';

interface EventTableProps {
    events: EventSummary[];
}

export function EventTable({ events }: EventTableProps) {
    const navigate = useNavigate();
    const { selectedEventIds, toggleEvent } = useCompareStore();

    const getVelocityColorClass = (v: number | null) => {
        if (!v) return 'text-secondary';
        if (v < 20) return 'text-status-success';
        if (v < 40) return 'text-accent-primary';
        if (v < 60) return 'text-accent-fire';
        return 'text-status-error';
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap border-collapse">
                <thead className="sticky top-0 z-10 bg-deep border-b border-subtle">
                    <tr>
                        <th className="px-4 py-3 w-8"></th>
                        <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-muted">Time (UTC)</th>
                        <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-muted">Network</th>
                        <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-muted">Region</th>
                        <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-muted">Entry Vel.</th>
                        <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-muted">Stations</th>
                        <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-muted">Peak Mag</th>
                        <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-muted">Shower</th>
                        <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-muted">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => {
                        const isSelected = selectedEventIds.includes(event.id);
                        return (
                        <tr
                            key={event.id}
                            onClick={() => navigate(`/events/${event.id}`)}
                            className={`h-14 border-b border-subtle bg-transparent hover:bg-elevated cursor-pointer transition-colors ${isSelected ? 'bg-accent-primary/5' : ''}`}
                        >
                            <td className="px-4 w-8" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    disabled={!isSelected && selectedEventIds.length >= 5}
                                    onChange={() => toggleEvent(event.id)}
                                    title={!isSelected && selectedEventIds.length >= 5 ? "Max 5 events selected" : "Select for comparison"}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-accent-primary focus:ring-accent-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                />
                            </td>
                            {/* Time */}
                            <td className="px-4 font-mono text-[13px] text-secondary">
                                {format(new Date(event.begin_utc), 'yyyy-MM-dd HH:mm:ss')}
                            </td>

                            {/* Network */}
                            <td className="px-4">
                                <Badge variant={event.network.toLowerCase() as any}>{event.network}</Badge>
                            </td>

                            {/* Region */}
                            <td className="px-4 text-sm font-medium text-primary max-w-[150px] truncate" title={event.region || ''}>
                                {event.region || 'Unknown'}
                            </td>

                            {/* Velocity */}
                            <td className={`px-4 font-mono text-sm ${getVelocityColorClass(event.entry_velocity_km_s)}`}>
                                {event.entry_velocity_km_s?.toFixed(1) || '--'}
                                <span className="text-[10px] text-muted ml-1">km/s</span>
                            </td>

                            {/* Stations (dots) */}
                            <td className="px-4">
                                <div className="flex items-center gap-1.5" title={`${event.station_count || 0} stations`}>
                                    <span className="font-mono text-xs text-secondary w-3">{event.station_count || 0}</span>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: Math.min(event.station_count || 0, 5) }).map((_, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent-primary opacity-60" />
                                        ))}
                                        {(event.station_count || 0) > 5 && (
                                            <span className="text-[10px] text-muted ml-1">+</span>
                                        )}
                                    </div>
                                </div>
                            </td>

                            {/* Peak Mag */}
                            <td className="px-4 font-mono text-sm">
                                <span className={event.peak_abs_magnitude && event.peak_abs_magnitude < -4 ? 'text-accent-fire font-bold' : 'text-primary'}>
                                    {event.peak_abs_magnitude?.toFixed(1) || '--'}
                                </span>
                            </td>

                            {/* Shower */}
                            <td className="px-4">
                                {event.shower_code ? (
                                    <Badge variant="outline" className="text-accent-secondary border-accent-secondary/30">
                                        {event.shower_code}
                                    </Badge>
                                ) : (
                                    <Badge variant="default" className="text-muted">SPO</Badge>
                                )}
                            </td>

                            {/* Status */}
                            <td className="px-4">
                                <div className="flex items-center justify-center w-full">
                                    <div title={event.has_reconstruction ? "Reconstruction Complete" : "Pending"}
                                        className={`w-2 h-2 rounded-full ${event.has_reconstruction ? 'bg-status-success shadow-[0_0_8px_var(--status-success)]' : 'bg-muted'}`} />
                                </div>
                            </td>
                        </tr>
                    )})}
                    {events.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-muted text-sm">
                                <div className="flex flex-col items-center gap-3">
                                    <Network className="w-8 h-8 opacity-20" />
                                    <span>No events found matching current criteria.</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
