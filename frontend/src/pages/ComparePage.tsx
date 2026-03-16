import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useCompareStore } from '../store/compareStore';
import { PageLoader } from '../components/ui/Loader';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { OrbitDiagram } from '../components/visualizations/OrbitDiagram';

export function ComparePage() {
  const { selectedEventIds, clearSelection, toggleEvent } = useCompareStore();

  const { data: events, isLoading } = useQuery({
    queryKey: ['compare', selectedEventIds],
    queryFn: () => api.compareEvents(selectedEventIds),
    enabled: selectedEventIds.length > 0
  });

  if (selectedEventIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <h1 className="text-2xl text-slate-300 font-mono mb-4">Compare Events</h1>
        <p className="text-slate-500 mb-8 max-w-md text-center">Select up to 4 events from the Catalogue to compare their orbital elements, trajectories, and physical properties side-by-side.</p>
        <Link to="/events" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono">Go to Catalogue</Link>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl text-blue-100 font-bold font-mono">Event Comparison</h1>
        <button onClick={clearSelection} className="text-red-400 hover:text-red-300 text-sm font-mono border border-red-500/30 px-3 py-1.5 rounded">
          Clear Selection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {events?.map(e => (
          <Card key={e.id} className="p-5 flex flex-col bg-slate-900 border-slate-800">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-bold text-blue-300 font-mono text-lg">{e.gmn_id || `ID_${e.id}`}</h3>
                  <span className="text-slate-500 text-xs">{new Date(e.begin_utc).toISOString().split('T')[0]}</span>
               </div>
               <button onClick={() => toggleEvent(e.id)} className="text-slate-500 hover:text-slate-300">✕</button>
             </div>

             <div className="space-y-3 font-mono text-sm flex-1">
               <div className="flex justify-between border-b border-slate-800 pb-1">
                 <span className="text-slate-500">Network</span>
                 <span className="text-slate-300">{e.network}</span>
               </div>
               <div className="flex justify-between border-b border-slate-800 pb-1">
                 <span className="text-slate-500">Velocity</span>
                 <span className="text-slate-300">{e.entry_velocity_km_s?.toFixed(1) || '--'} km/s</span>
               </div>
               <div className="flex justify-between border-b border-slate-800 pb-1">
                 <span className="text-slate-500">Peak Angle</span>
                 <span className="text-slate-300">{e.reconstruction?.convergence_angle_deg?.toFixed(1) || '--'}°</span>
               </div>
               <div className="flex justify-between border-b border-slate-800 pb-1">
                 <span className="text-slate-500">Mass (kg)</span>
                 <span className="text-slate-300">{e.reconstruction?.estimated_mass_kg?.toFixed(2) || '--'}</span>
               </div>

               {/* Orbit Thumbnail */}
               <div className="mt-6 border border-slate-800 rounded bg-slate-950/50 p-2">
                 <div className="text-xs text-slate-500 text-center mb-2">Orbit Projection</div>
                 {e.reconstruction?.orbit_a_au ? (
                   <div className="scale-75 origin-top -mt-6">
                     <OrbitDiagram a_au={e.reconstruction.orbit_a_au} e={e.reconstruction.orbit_e!} omega_deg={e.reconstruction.orbit_omega_deg!} />
                   </div>
                 ) : <div className="text-center text-xs text-slate-600 py-6">No Orbit</div>}
               </div>
             </div>
             
             <Link to={`/events/${e.id}`} className="mt-4 text-center py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors uppercase tracking-wider">
               View Details
             </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
