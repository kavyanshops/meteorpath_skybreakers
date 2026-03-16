import { useQuery } from '@tanstack/react-query';
import { api as apiClient } from '../api/client';
import { useCompareStore } from '../store/compareStore';
import { PageLoader } from '../components/ui/Loader';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { RadiantSkyMap } from '../components/visualizations/RadiantSkyMap';
import { ComparisonTable } from '../components/visualizations/ComparisonTable';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { useState } from 'react';
import { cn } from '../components/ui/Badge';

const COLORS = ['#2dd4bf', '#f43f5e', '#a855f7', '#fbbf24', '#3b82f6'];

export function ComparePage() {
  const { selectedEventIds, clearSelection, toggleEvent } = useCompareStore();
  const [normalizedTime, setNormalizedTime] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ['compare', selectedEventIds],
    queryFn: () => apiClient.compareEvents(selectedEventIds),
    enabled: selectedEventIds.length > 0
  });

  if (selectedEventIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
        <h1 className="text-3xl font-display font-bold text-primary mb-4">Event Comparison</h1>
        <p className="text-secondary mb-8 max-w-md text-center">Select at least 2 events from the Catalogue to compare their orbital elements, trajectories, and physical properties.</p>
        <Link to="/events" className="px-8 py-3 bg-accent-primary hover:bg-accent-primary/80 text-void rounded-full font-bold transition-all shadow-glow-teal">
          Browse Catalogue
        </Link>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  // Prepare data for Sky Map and Table
  const compareData = (events || []).map((e: any, idx: number) => ({
      id: e.id,
      gmn_id: e.gmn_id,
      network: e.network,
      ra: e.reconstruction?.radiant_ra_deg || e.radiant_ra_deg || 0,
      dec: e.reconstruction?.radiant_dec_deg || e.radiant_dec_deg || 0,
      sigma_ra: e.reconstruction?.radiant_ra_sigma_arcsec || 5,
      sigma_dec: e.reconstruction?.radiant_dec_sigma_arcsec || 5,
      a: e.reconstruction?.orbit_a_au || 0,
      e: e.reconstruction?.orbit_e || 0,
      i: e.reconstruction?.orbit_i_deg || 0,
      omega: e.reconstruction?.orbit_omega_deg || 0,
      big_omega: e.reconstruction?.orbit_big_omega_deg || 0,
      q: e.reconstruction?.orbit_q_au || 0,
      Q: (e.reconstruction?.orbit_a_au * (1 + (e.reconstruction?.orbit_e || 0))) || 0,
      period: Math.pow(e.reconstruction?.orbit_a_au || 0, 1.5),
      orbit_class: e.reconstruction?.orbit_a_au > 1.0 ? (e.reconstruction?.orbit_a_au < 1.3 ? 'Amor' : 'Main Belt') : 'Apollo',
      shower: e.shower_name || 'Sporadic',
      color: COLORS[idx % COLORS.length],
      v0: e.entry_velocity_km_s,
      sigma_v: e.reconstruction?.initial_velocity_sigma_km_s || 0.1
  }));

  // Velocity multi-series data preparation
  const velocityData: any[] = [];
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
      const t_norm = i / steps;
      const dataPoint: any = { t_norm };
      events?.forEach((e: any) => {
          dataPoint[`event_${e.id}`] = (e.entry_velocity_km_s || 20) - (t_norm * 5); // simplified drag
      });
      velocityData.push(dataPoint);
  }

  const allShareShower = events && events.length > 1 && events.every((e: any) => e.shower_code && e.shower_code === events[0].shower_code);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 pb-32">
      
      {/* Header & Mini Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary tracking-tight">Multi-Event Analysis</h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {compareData.map((e: any) => (
               <div key={e.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-subtle">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className="text-xs font-mono text-secondary">{e.gmn_id || e.id}</span>
                  <button onClick={() => toggleEvent(e.id)} className="text-slate-500 hover:text-white transition-colors">✕</button>
               </div>
            ))}
          </div>
        </div>
        <button onClick={clearSelection} className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors border-b border-subtle pb-1">
          Reset Comparison
        </button>
      </div>

      {allShareShower && (
        <div className="mb-10 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center gap-3">
           <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
           <span className="text-sm font-mono text-teal-400">Shared Shower Membership Detected: <span className="font-bold">{events[0].shower_name}</span></span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Panel 1: Sky Map */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-300 font-mono text-sm uppercase tracking-widest">Radiant Sky Map</h2>
            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">RA/Dec Equatorial Equirectangular</span>
          </div>
          <RadiantSkyMap events={compareData} />
        </section>

        {/* Panel 2: Orbital Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-300 font-mono text-sm uppercase tracking-widest">Orbital Parameters</h2>
            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Baseline: {compareData[0].gmn_id || compareData[0].id}</span>
          </div>
          <ComparisonTable events={compareData} />
        </section>

        {/* Panel 3: Velocity Overlay */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-300 font-mono text-sm uppercase tracking-widest">Velocity Overlay</h2>
            <div className="flex items-center gap-3">
                <button 
                  onClick={() => setNormalizedTime(!normalizedTime)}
                  className={cn("text-[10px] uppercase font-mono px-2 py-0.5 rounded border transition-all", normalizedTime ? "bg-accent-primary text-void border-accent-primary" : "text-secondary border-subtle hover:text-primary")}
                >
                  {normalizedTime ? "Duration Normalized" : "Absolute Time"}
                </button>
            </div>
          </div>
          <div className="h-[400px] w-full bg-void border border-subtle rounded-xl p-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={velocityData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey={normalizedTime ? "t_norm" : "time_0"} 
                  label={{ value: normalizedTime ? 'Normalized Time (0 -> duration)' : 'Seconds (relative to start)', position: 'bottom', fill: '#64748b', fontSize: 10, offset: 10 }}
                  stroke="#475569" fontSize={10} 
                />
                <YAxis label={{ value: 'km/s', angle: -90, position: 'left', fill: '#64748b', fontSize: 10 }} stroke="#475569" fontSize={10} domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px', opacity: 0.8 }} />
                
                <ReferenceLine y={11.2} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: 'Esc. Velocity', position: 'right', fill: '#f43f5e', fontSize: 10 }} />

                {compareData.map((e: any) => (
                  <Line 
                    key={e.id} 
                    type="monotone" 
                    dataKey={`event_${e.id}`} 
                    name={`${e.gmn_id || e.id}: ${e.v0?.toFixed(1)}±${e.sigma_v?.toFixed(1)}`}
                    stroke={e.color} 
                    strokeWidth={2} 
                    dot={false}
                    animationDuration={1500}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Panel 4: Shower Membership Cards */}
        <section className="space-y-4">
          <h2 className="text-slate-300 font-mono text-sm uppercase tracking-widest">Shower Membership</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {compareData.map((e: any) => (
               <Card key={e.id} className="p-5 bg-surface/20 border-subtle">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Event {e.gmn_id || e.id}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                  </div>
                  <div className="text-xl font-display font-medium text-primary mb-1">{e.shower}</div>
                  <div className="text-[10px] font-mono text-accent-secondary uppercase tracking-widest">
                    {e.shower === 'Sporadic' ? 'Non-Coherent Flux' : 'Meteor Stream Association'}
                  </div>
               </Card>
             ))}
          </div>
        </section>

      </div>
    </div>
  );
}
