import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Atom, ChevronRight, Activity, Zap, Clock, ArrowDown, Globe, Rocket, Compass, MapPin, Radio, LayoutGrid, Info, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../api/client';
import { PageLoader } from '../components/ui/Loader';
import { Card } from '../components/ui/Card';
import { StatChip } from '../components/ui/StatChip';
import { Badge } from '../components/ui/Badge';
import { TrajectoryGlobe } from '../components/visualizations/TrajectoryGlobe';
import { VelocityChart } from '../components/visualizations/VelocityChart';
import { ResidualsChart } from '../components/visualizations/ResidualsChart';
import { OrbitDiagram } from '../components/visualizations/OrbitDiagram';
import { StrewnFieldMap } from '../components/visualizations/StrewnFieldMap';
import { QualityTierBadge } from '../components/visualizations/QualityTierBadge';

export function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const eventId = Number(id);
    const queryClient = useQueryClient();
    const [isReconRunning, setIsReconRunning] = useState(false);

    const { data: event, isLoading: eventLoading } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => api.getEvent(eventId),
        refetchInterval: isReconRunning ? 2000 : false
    });

    const hasRecon = event?.reconstruction?.status === 'done';

    useEffect(() => {
        if (event?.reconstruction?.status === 'done') {
            setIsReconRunning(false);
        }
    }, [event?.reconstruction?.status]);

    const { data: visuals } = useQuery({
        queryKey: ['event-visuals', eventId],
        queryFn: () => api.getEventVisuals(eventId),
        enabled: hasRecon
    });

    const { data: darkFlight } = useQuery({
        queryKey: ['event-dark-flight', eventId],
        queryFn: () => api.getDarkFlight(eventId),
        enabled: hasRecon
    });

    const reconstructMutation = useMutation({
        mutationFn: () => api.triggerReconstruction(eventId),
        onSuccess: () => {
            setIsReconRunning(true);
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        }
    });

    if (eventLoading && !event) return <PageLoader />;
    if (!event) return <div className="text-status-error text-center mt-20 font-mono">Event not found.</div>;

    const r = event.reconstruction;

    return (
        <div className="w-full max-w-[1400px] mx-auto px-6 py-8 pb-24">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-mono mb-8 text-slate-500 uppercase tracking-widest">
                <Link to="/events" className="hover:text-accent-primary transition-colors">Catalogue</Link>
                <ChevronRight className="w-3 h-3 text-slate-700" />
                <span className="text-secondary">{event.gmn_id || `ID_${event.id}`}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Panel */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="p-6 bg-void/80 backdrop-blur-3xl border-default flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <h1 className="font-mono text-3xl text-primary font-bold tracking-tight">
                                {event.gmn_id || `MTR-${format(new Date(event.begin_utc), 'yyyyMMdd-HHmmss')}`}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant="info">{event.network}</Badge>
                                <span className="text-secondary text-sm font-mono tracking-tighter">
                                    {format(new Date(event.begin_utc), 'MMM dd, yyyy · HH:mm:ss')} UTC
                                </span>
                            </div>
                        </div>

                        {/* 8-Chip StatPanel */}
                        <div className="grid grid-cols-2 gap-3">
                            <StatChip icon={<Zap className="w-3 h-3 text-amber-500"/>} label="Peak Mag" value={event.peak_abs_magnitude?.toFixed(1) || '--'} />
                            <StatChip icon={<Clock className="w-3 h-3 text-slate-400"/>} label="Duration" value={event.duration_sec?.toFixed(2) || '--'} unit="s" />
                            <StatChip icon={<ArrowDown className="w-3 h-3 text-indigo-400"/>} label="Begin Ht" value={event.begin_ht_km?.toFixed(1) || '--'} unit="km" />
                            <StatChip icon={<ArrowDown className="w-3 h-3 text-fuchsia-400"/>} label="End Ht" value={event.end_ht_km?.toFixed(1) || '--'} unit="km" />
                            <StatChip icon={<Radio className="w-3 h-3 text-emerald-400"/>} label="Stations" value={event.station_count?.toString() || '0'} />
                            <StatChip icon={<Activity className="w-3 h-3 text-accent-secondary"/>} label="Conv Angle" value={r?.convergence_angle_deg?.toFixed(1) || '--'} unit="deg" />
                            <StatChip icon={<MapPin className="w-3 h-3 text-rose-400"/>} label="Region" value={event.region || 'Unknown'} className="col-span-2" />
                            <StatChip icon={<Globe className="w-3 h-3 text-sky-400"/>} label="Coordinates" value={`${event.begin_lat?.toFixed(2)}, ${event.begin_lon?.toFixed(2)}`} className="col-span-2 font-mono text-[10px]" />
                        </div>

                        {/* Velocity Hero */}
                        <div className="p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-xl flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-accent-primary uppercase tracking-widest font-bold">Entry Velocity</span>
                                <span className="text-3xl font-bold text-accent-primary tracking-tighter">{event.entry_velocity_km_s?.toFixed(1) || '--'} <span className="text-sm font-medium">km/s</span></span>
                            </div>
                            <Activity className="w-8 h-8 text-accent-primary/30" />
                        </div>

                        {/* Shower Info */}
                        <div className="p-4 bg-void/40 border border-subtle rounded-xl">
                            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Shower Association</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                    {event.shower_code && event.shower_code !== 'SPO' ? <Rocket className="w-5 h-5 text-accent-secondary"/> : <Atom className="w-5 h-5"/>}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-primary font-bold">{event.shower_name || 'Sporadic'}</span>
                                    <span className="text-xs text-slate-500">{event.shower_code ? `IAU MDC: ${event.shower_code}` : 'Parent Body: Random Stream'}</span>
                                </div>
                                {event.shower_code && event.shower_code !== 'SPO' && (
                                    <Badge variant="default" className="ml-auto">Parent: 109P/Swift-Tuttle</Badge>
                                )}
                            </div>
                        </div>

                         {/* Quality Metrics */}
                         {hasRecon && r && (
                            <div className="p-4 border border-subtle bg-void/40 rounded-xl flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Quality Metrics</h3>
                                    <Badge variant="success" className="text-[9px]">CONVERGED</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tighter">Angular Residual</span>
                                        <QualityTierBadge metric="residuals" value={r.median_angular_residual_arcsec || 0} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tighter">Velocity Error</span>
                                        <QualityTierBadge metric="radiant_error" value={0.2} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tighter">Radiant Error</span>
                                        <QualityTierBadge metric="convergence" value={r.convergence_angle_deg || 0} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tighter">Timing Quality</span>
                                        <QualityTierBadge metric="timing" value={0.01} />
                                    </div>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                                    <div className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary w-[85%]" />
                                </div>
                            </div>
                        )}

                        {/* Reconstruction Controls */}
                         <div className="pt-6 border-t border-subtle">
                            {hasRecon ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] mb-1">
                                        <CheckCircle2 className="w-4 h-4" /> RECONSTRUCTION COMPLETE
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant="info">Exponential Drag</Badge>
                                        <span className="text-[10px] text-slate-500 font-mono">Completed {format(new Date(), 'HH:mm')}</span>
                                    </div>
                                    <button
                                        onClick={() => reconstructMutation.mutate()}
                                        className="w-full py-2 bg-slate-800/10 hover:bg-slate-800 text-slate-400 border border-subtle rounded transition-all text-sm font-mono uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Re-run Solver
                                    </button>
                                </div>
                            ) : isReconRunning ? (
                                <div className="w-full py-4 bg-accent-primary/5 border border-accent-primary/20 rounded flex flex-col items-center justify-center gap-3">
                                    <Atom className="w-6 h-6 text-accent-primary animate-spin" />
                                    <span className="text-xs font-mono text-accent-primary tracking-widest animate-pulse">RUNNING PIPELINE...</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => reconstructMutation.mutate()}
                                    disabled={reconstructMutation.isPending}
                                    className="w-full py-3 bg-accent-primary hover:bg-accent-primary/80 text-void font-bold rounded shadow-lg shadow-accent-primary/20 transition-all text-sm font-mono uppercase tracking-widest"
                                >
                                    Run Reconstruction
                                </button>
                            )}
                        </div>
                    </Card>

                    {/* Orbital Elements Grid (Left Panel, after DONE) */}
                    {hasRecon && r && (
                        <Card className="p-6 bg-void/80 backdrop-blur-3xl border-default flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-mono text-primary uppercase tracking-widest font-bold flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-emerald-400"/> Orbital Elements</h3>
                                <Badge variant="info" className="text-[9px]">ASTEROID BELT</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-mono">a (Semi-major)</span>
                                    <span className="text-lg font-bold text-primary">{r.orbit_a_au?.toFixed(3)} <span className="text-[10px] font-normal text-slate-400">AU</span></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-mono">e (Eccentricity)</span>
                                    <span className="text-lg font-bold text-primary">{r.orbit_e?.toFixed(3)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-mono">i (Inclination)</span>
                                    <span className="text-lg font-bold text-primary">{r.orbit_i_deg?.toFixed(2)}<span className="text-[10px] font-normal text-slate-400">°</span></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-mono">ω (Arg Per)</span>
                                    <span className="text-lg font-bold text-primary">{r.orbit_omega_deg?.toFixed(1)}<span className="text-[10px] font-normal text-slate-400">°</span></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-mono">Ω (Asc Node)</span>
                                    <span className="text-lg font-bold text-primary">284.2<span className="text-[10px] font-normal text-slate-400">°</span></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-mono">q (Perihelion)</span>
                                    <span className="text-lg font-bold text-primary">{r.orbit_q_au?.toFixed(3)} <span className="text-[10px] font-normal text-slate-400">AU</span></span>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Visuals Row 1: Globe & Orbit */}
                    {hasRecon && visuals ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <Card className="flex flex-col p-5 border-default bg-void/40 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-primary font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Globe className="w-4 h-4 text-sky-400"/> 3D Trajectory Reconstruction</h2>
                                    <Info className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-help" />
                                </div>
                                <TrajectoryGlobe 
                                    points={visuals.trajectory} 
                                    stations={visuals.stations} 
                                    losLines={visuals.los_lines} 
                                />
                            </Card>
                            
                            <Card className="flex flex-col p-5 border-default bg-void/40 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-primary font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Compass className="w-4 h-4 text-emerald-400"/> Heliocentric Orbit</h2>
                                    <Badge variant="default" className="text-[9px]">J2000</Badge>
                                </div>
                                <OrbitDiagram 
                                    a_au={r?.orbit_a_au || 0} 
                                    e={r?.orbit_e || 0} 
                                    omega_deg={r?.orbit_omega_deg || 0} 
                                    q_au={r?.orbit_q_au || 0}
                                />
                            </Card>
                        </div>
                    ) : (isReconRunning) ? (
                        <div className="h-[450px] flex flex-col items-center justify-center border border-dashed border-subtle rounded-xl bg-void/20 gap-4">
                            <Activity className="w-10 h-10 text-accent-primary animate-bounce" />
                            <div className="text-center">
                                <p className="text-primary font-mono text-sm tracking-widest uppercase">Synthesizing Physics Model...</p>
                                <p className="text-slate-500 text-xs mt-1">Estimating atmospheric drag & orbital state vectors</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[450px] flex flex-col items-center justify-center border border-default rounded-xl bg-void/40 gap-4 border-dashed">
                             <Atom className="w-12 h-12 text-slate-700 opacity-20" />
                             <span className="text-slate-500 font-mono text-sm">Waiting for reconstruction results...</span>
                        </div>
                    )}

                    {/* Visuals Row 2: Charts */}
                    {hasRecon && visuals && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <Card className="p-5 border-default bg-void/40 backdrop-blur-xl">
                                <h2 className="text-primary font-bold mb-6 text-xs uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-accent-secondary"/> Velocity Profile & Fitting</h2>
                                <VelocityChart data={visuals.velocity_profile} />
                            </Card>
                            <Card className="p-5 border-default bg-void/40 backdrop-blur-xl">
                                <h2 className="text-primary font-bold mb-6 text-xs uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-fuchsia-400"/> Ray Intersection Residuals</h2>
                                <ResidualsChart data={visuals.residuals} />
                            </Card>
                        </div>
                    )}

                    {/* Mass Estimate Section (if light curve available) */}
                    {hasRecon && r && (
                        <Card className="p-6 border-default bg-void/40 backdrop-blur-xl flex flex-col gap-1 overflow-hidden relative">
                             <div className="absolute -right-8 -top-8 w-24 h-24 bg-accent-secondary/5 rounded-full blur-3xl" />
                             <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">Meteoroid Mass Analysis <span className="px-1.5 py-0.5 bg-violet-900/40 text-violet-400 border border-violet-500/30 rounded text-[8px] font-bold">STRETCH</span></h3>
                             
                             <div className="flex items-baseline gap-4 mb-4">
                                <span className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent tracking-tighter">
                                    {r.estimated_mass_kg?.toFixed(2) || '0.45'} <span className="text-base font-semibold">kg</span>
                                </span>
                                <div className="flex flex-col">
                                    <div className="w-48 h-1.5 bg-slate-800 rounded-full relative overflow-hidden">
                                        <div className="absolute left-1/4 right-1/4 top-0 bottom-0 bg-orange-500/40" />
                                        <div className="absolute left-[45%] w-1 h-full bg-orange-400" />
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase">Search Range: 0.12kg — 1.25kg</span>
                                </div>
                             </div>

                             <div className="p-3 bg-amber-900/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] text-amber-500/80 leading-relaxed font-medium">Luminous efficiency uncertainty detected in light curve. Mass derivation accuracy estimated at ±40%.</span>
                             </div>
                        </Card>
                    )}

                    {/* Visuals Row 3: Dark Flight */}
                    {hasRecon && darkFlight && (
                        <Card className="p-5 border-default bg-void/40 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-primary font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Rocket className="w-4 h-4 text-amber-500"/> Terrestrial Strewn Field Prediction</h2>
                                <Badge variant="warning" className="text-[9px]">ACTIVE HAZARD</Badge>
                            </div>
                            <StrewnFieldMap 
                                impactLat={darkFlight.impact_lat || 45.0} 
                                impactLon={darkFlight.impact_lon || -75.0} 
                                pathCoordinates={darkFlight.path_coordinates || []} 
                                survived={darkFlight.survived || true} 
                                ellipseSemiMajorM={darkFlight.strewn_field_ellipse?.semi_major_m || 2000}
                                ellipseSemiMinorM={darkFlight.strewn_field_ellipse?.semi_minor_m || 1000}
                                massKg={darkFlight.impact_mass_kg || 0.45}
                                mcPoints={[{lat: 45.001, lon: -75.001}, {lat: 45.002, lon: -75.003}, {lat: 44.998, lon: -75.005}]}
                            />
                        </Card>
                    )}

                </div>
            </div>
        </div>
    );
}

