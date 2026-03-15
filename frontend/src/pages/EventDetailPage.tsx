import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Atom, ChevronRight, Activity, Zap, Clock, ArrowDown, Share2, Globe } from 'lucide-react';
import { useEvent } from '../hooks/useEvent';
import { PageLoader } from '../components/ui/Loader';
import { Card } from '../components/ui/Card';
import { StatChip } from '../components/ui/StatChip';
import { Badge } from '../components/ui/Badge';
import { EarthGlobe } from '../components/globe/EarthGlobe';
import { PlaceholderChart } from '../components/charts/PlaceholderChart';

export function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { data: event, isLoading, error } = useEvent(id);

    const reconstructMutation = useMutation({
        mutationFn: async () => {
            // Simulate calling the reconstruction endpoint
            // In a real app this would POST /api/events/{id}/reconstruct
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { status: 'running' };
        },
        onSuccess: () => {
            // Typically you'd invalidate the query so it polls for the new status
            queryClient.invalidateQueries({ queryKey: ['event', id] });
            alert('Trajectory reconstruction started! (simulated)');
        }
    });

    if (isLoading) return <PageLoader />;
    if (error || !event) return <div className="text-status-error text-center mt-20 font-mono">Event not found.</div>;

    const isComplete = event.has_reconstruction;

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-8 pb-20">

            {/* Breadcrumb Header */}
            <div className="flex items-center gap-2 text-xs font-mono mb-8 text-secondary">
                <Link to="/events" className="hover:text-primary transition-colors">Catalogue</Link>
                <ChevronRight className="w-3 h-3 text-muted" />
                <span className="text-primary truncate max-w-[200px]">{event.gmn_id || `ID_${event.id}`}</span>
                <div className="ml-auto">
                    <button className="p-2 bg-surface border border-default rounded-md hover:bg-elevated transition-colors text-secondary hover:text-primary" title="Share event">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column (40%) - Summary Card */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <Card className="p-6">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h1 className="font-mono text-xl text-primary font-medium tracking-tight mb-2">
                                    {event.gmn_id || `MTR-${format(new Date(event.begin_utc), 'yyyyMMdd-HHmmss')}`}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Badge variant={event.network.toLowerCase() as any}>{event.network}</Badge>
                                    <span className="text-secondary text-sm font-mono">
                                        {format(new Date(event.begin_utc), 'yyyy-MM-dd HH:mm:ss')} UTC
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3-col Grid Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                            <StatChip
                                iconLayout="vertical"
                                icon={<Activity className="w-4 h-4 text-accent-fire" />}
                                label="Entry Vel"
                                value={event.entry_velocity_km_s?.toFixed(1) || '--'}
                                unit="km/s"
                                valueClassName="text-accent-fire font-bold"
                            />
                            <StatChip
                                iconLayout="vertical"
                                icon={<Activity className="w-4 h-4 text-accent-secondary" />}
                                label="Geo Vel"
                                value={event.geocentric_velocity_km_s?.toFixed(1) || '--'}
                                unit="km/s"
                            />
                            <StatChip
                                iconLayout="vertical"
                                icon={<Zap className="w-4 h-4 text-status-warning" />}
                                label="Peak Mag"
                                value={event.peak_abs_magnitude?.toFixed(1) || '--'}
                            />
                            <StatChip
                                iconLayout="vertical"
                                icon={<Clock className="w-4 h-4 text-status-success" />}
                                label="Duration"
                                value={event.duration_sec?.toFixed(2) || '--'}
                                unit="s"
                            />
                            <StatChip
                                iconLayout="vertical"
                                icon={<ArrowDown className="w-4 h-4 text-status-info" />}
                                label="Begin Ht"
                                value={event.begin_ht_km?.toFixed(0) || '--'}
                                unit="km"
                            />
                            <StatChip
                                iconLayout="vertical"
                                icon={<ArrowDown className="w-4 h-4 text-status-info opacity-50" />}
                                label="End Ht"
                                value={event.end_ht_km?.toFixed(0) || '--'}
                                unit="km"
                            />
                        </div>

                        {/* Coordinate Ribbon */}
                        <div className="bg-void rounded-md border border-default p-3 flex justify-between items-center font-mono text-xs mb-8">
                            <span className="text-muted uppercase">Coordinates</span>
                            <span className="text-primary tracking-widest">
                                {event.begin_lat?.toFixed(4) || '--'}° N, {event.begin_lon?.toFixed(4) || '--'}° E
                            </span>
                        </div>

                        {/* Reconstruction Status Section */}
                        <div className="pt-6 border-t border-subtle">
                            <div className="flex items-center justify-between pl-1 mb-4">
                                <div className="flex items-center gap-2 text-primary font-medium">
                                    <Atom className="w-4 h-4 text-accent-primary" />
                                    Trajectory Reconstruction
                                </div>
                                {isComplete ? (
                                    <Badge variant="success">Complete</Badge>
                                ) : reconstructMutation.isPending ? (
                                    <Badge variant="info" className="animate-pulse">Running</Badge>
                                ) : (
                                    <Badge variant="warning">Pending</Badge>
                                )}
                            </div>

                            {!isComplete && (
                                <button
                                    onClick={() => reconstructMutation.mutate()}
                                    disabled={reconstructMutation.isPending}
                                    className="w-full py-3 bg-elevated hover:bg-surface border border-accent-primary/50 text-accent-primary font-medium rounded-md transition-colors shadow-glow-teal disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {reconstructMutation.isPending ? 'Reconstructing...' : 'Run Reconstruction'}
                                </button>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column (60%) - Visualizations */}
                <div className="lg:col-span-7 flex flex-col gap-6">

                    {/* Globe View */}
                    <div className="w-full flex-shrink-0">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <Globe className="w-4 h-4 text-secondary" />
                            <h2 className="font-display font-semibold text-primary">Atmospheric Trajectory</h2>
                        </div>
                        <EarthGlobe event={event} />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <PlaceholderChart
                            title="Velocity Profile"
                            isPending={!isComplete}
                            className="h-64"
                        />
                        <PlaceholderChart
                            title="Heliocentric Orbit"
                            isPending={!isComplete}
                            className="h-64"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
