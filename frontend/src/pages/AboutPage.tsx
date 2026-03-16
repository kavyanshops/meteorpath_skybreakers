import { Globe, Zap, Search, Layers, Cpu, BarChart3, Database, Heart, Map as MapIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';

export function AboutPage() {
  const steps = [
    { icon: <Database className="w-5 h-5 text-sky-400" />, title: 'Ingestion', desc: 'Batch & stream polling from GMN, NASA, FRIPON & AMS.' },
    { icon: <Search className="w-5 h-5 text-indigo-400" />, title: 'Preprocessing', desc: 'Metadata validation and unit conversion to J2000.' },
    { icon: <Layers className="w-5 h-5 text-emerald-400" />, title: 'Triangulation', desc: 'Weighted Least Squares intersection of LOS rays.' },
    { icon: <Cpu className="w-5 h-5 text-fuchsia-400" />, title: 'Atmosphere', desc: 'NRLMSISE-00 density profile integration.' },
    { icon: <Zap className="w-5 h-5 text-amber-400" />, title: 'Motion Fitting', desc: 'Exponential drag (W-J) and fragmentation analysis.' },
    { icon: <MapIcon className="w-5 h-5 text-rose-400" />, title: 'Dark Flight', desc: '4th-order Runge-Kutta simulation to landing site.' },
    { icon: <Globe className="w-5 h-5 text-teal-400" />, title: 'Orbit Compute', desc: 'Transform to heliocentric state for orbital elements.' },
    { icon: <BarChart3 className="w-5 h-5 text-blue-400" />, title: 'Monte Carlo', desc: '100-run perturbation for uncertainty bounds.' }
  ];

  const sources = [
    { name: 'NASA ASG', type: 'Direct API', capabilities: ['Trajectory', 'Orbit', 'Mass'], access: 'Public/NASA' },
    { name: 'Global Meteor Network', type: 'GMN API', capabilities: ['Raw Rays', 'Triangulation', 'Orbit'], access: 'Public/RMS' },
    { name: 'FRIPON', type: 'CSV/Sync', capabilities: ['Triangulation', 'Orbit', 'Dark Flight'], access: 'Academic' },
    { name: 'AMS', type: 'Witness Reports', capabilities: ['Location Only'], access: 'Crowdsourced' }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-12 pb-32">
      
      {/* Hero Stats */}
      <section className="text-center mb-20">
        <h1 className="text-5xl font-display font-bold text-primary tracking-tighter mb-6">MeteorPath Pipeline</h1>
        <p className="text-secondary max-w-2xl mx-auto font-mono text-sm leading-relaxed mb-12">
          The next-generation scientific command center for global fireball ingestion, 3D atmospheric trajectory triangulation, and strewn field prediction.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="p-8 bg-surface/30 border-subtle flex flex-col items-center">
              <span className="text-4xl font-display font-bold text-accent-primary mb-2">100+</span>
              <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Active Events</span>
           </Card>
           <Card className="p-8 bg-surface/30 border-subtle flex flex-col items-center">
              <span className="text-4xl font-display font-bold text-accent-secondary mb-2">3D</span>
              <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Trajectory Engine</span>
           </Card>
           <Card className="p-8 bg-surface/30 border-subtle flex flex-col items-center">
              <span className="text-4xl font-display font-bold text-primary mb-2">&lt;3″</span>
              <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Radiant Precision</span>
           </Card>
        </div>
      </section>

      {/* Triangulation Visual */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
        <div className="relative aspect-square bg-void border border-subtle rounded-3xl overflow-hidden p-8">
           <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Earth Curve */}
              <path d="M 0 350 Q 200 320 400 350" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
              
              {/* Stations */}
              <circle cx="80" cy="330" r="4" fill="#3b82f6" />
              <circle cx="320" cy="340" r="4" fill="#3b82f6" />
              <text x="80" y="350" className="fill-slate-500 font-mono text-[8px]" textAnchor="middle">STATION A</text>
              <text x="320" y="360" className="fill-slate-500 font-mono text-[8px]" textAnchor="middle">STATION B</text>

              {/* LOS Rays */}
              <motion.line 
                x1="80" y1="330" x2="250" y2="80" 
                stroke="#3b82f6" strokeWidth="1" opacity="0.4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.line 
                x1="320" y1="340" x2="150" y2="80" 
                stroke="#3b82f6" strokeWidth="1" opacity="0.4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />

              {/* Intersecting Trajectory */}
              <motion.path 
                d="M 120 40 L 280 180" 
                stroke="#2dd4bf" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity }}
              />
              
              <text x="200" y="40" className="fill-accent-primary font-mono text-[10px] uppercase font-bold" textAnchor="middle">3D RECONSTRUCTION</text>
           </svg>
           <div className="absolute bottom-6 left-6 right-6 flex justify-between">
              <div className="bg-void/80 backdrop-blur-md px-3 py-1.5 rounded border border-subtle text-[8px] font-mono text-secondary">
                 WEIGHTED LEAST SQUARES (WLS)
              </div>
              <div className="bg-void/80 backdrop-blur-md px-3 py-1.5 rounded border border-subtle text-[8px] font-mono text-secondary">
                 RMS RESIDUAL &lt; 0.05°
              </div>
           </div>
        </div>

        <div>
           <h2 className="text-3xl font-display font-bold text-primary mb-6">Scientific Methodology</h2>
           <div className="space-y-8">
              {[
                { title: 'Observe', desc: 'Raw pixels from GMN/NASA cameras are centroided and mapped to stars for astrometry.', icon: <Search className="w-5 h-5 text-sky-400" /> },
                { title: 'Transform', desc: 'Local coordinates are projected to ECEF vectors with UTC millisecond synchronization.', icon: <Zap className="w-5 h-5 text-amber-400" /> },
                { title: 'Triangulate', desc: 'Intersecting rays from multiple stations define the unique spatial path through the atmosphere.', icon: <Layers className="w-5 h-5 text-emerald-400" /> }
              ].map((m, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">{m.icon}</div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-1">{m.title}</h3>
                    <p className="text-xs text-secondary leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Pipeline Stepper */}
      <section className="mb-32">
         <h2 className="text-sm font-mono text-secondary uppercase tracking-widest mb-10 text-center">8-Step Sequential Pipeline</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Card key={i} className="p-6 bg-surface/20 border-subtle hover:border-accent-primary/30 transition-all flex flex-col items-center text-center group">
                 <div className="w-10 h-10 rounded-full bg-surface border border-subtle flex items-center justify-center mb-4 group-hover:bg-accent-primary/10 transition-colors">
                    {s.icon}
                 </div>
                 <div className="text-[10px] font-mono text-slate-500 mb-1">STEP 0{i+1}</div>
                 <div className="text-sm font-display font-bold text-primary mb-2 tracking-tight">{s.title}</div>
                 <p className="text-[10px] text-secondary leading-normal">{s.desc}</p>
              </Card>
            ))}
         </div>
      </section>

      {/* Tables Section */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-32">
         {/* Data Sources */}
         <div>
            <h2 className="text-sm font-mono text-secondary uppercase tracking-widest mb-6 px-1">Global Data Uplinks</h2>
            <div className="overflow-hidden rounded-2xl border border-subtle bg-surface/30">
               <table className="w-full text-left font-mono text-[10px]">
                  <thead className="bg-void/50 text-secondary uppercase tracking-widest border-b border-subtle">
                     <tr>
                        <th className="p-4">Network</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Metric Capabilities</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/50 text-primary">
                     {sources.map(s => (
                        <tr key={s.name} className="hover:bg-void/30 transition-colors">
                           <td className="p-4 font-bold">{s.name}</td>
                           <td className="p-4 text-secondary">{s.type}</td>
                           <td className="p-4 flex flex-wrap gap-1">
                              {s.name === 'AMS' ? (
                                <span className="text-rose-400">❌ No trajectory</span>
                              ) : s.capabilities.map(c => (
                                <span key={c} className="px-1.5 py-0.5 rounded bg-surface border border-subtle text-slate-400">{c}</span>
                              ))}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Benchmarks */}
         <div>
            <h2 className="text-sm font-mono text-secondary uppercase tracking-widest mb-6 px-1">Pipeline Benchmarks</h2>
            <div className="overflow-hidden rounded-2xl border border-subtle bg-surface/30">
               <table className="w-full text-left font-mono text-[10px]">
                  <thead className="bg-void/50 text-secondary uppercase tracking-widest border-b border-subtle">
                     <tr>
                        <th className="p-4">Benchmark</th>
                        <th className="p-4">Gold Tier</th>
                        <th className="p-4">Silver Tier</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/50">
                     <tr>
                        <td className="p-4 text-primary font-bold">Radiant Error</td>
                        <td className="p-4"><span className="text-emerald-400">&lt; 10″</span></td>
                        <td className="p-4 text-secondary">&lt; 30″</td>
                     </tr>
                     <tr>
                        <td className="p-4 text-primary font-bold">Velocity Unc.</td>
                        <td className="p-4"><span className="text-emerald-400">&lt; 0.1 km/s</span></td>
                        <td className="p-4 text-secondary">&lt; 0.5 km/s</td>
                     </tr>
                     <tr>
                        <td className="p-4 text-primary font-bold">Mass Tolerance</td>
                        <td className="p-4"><span className="text-emerald-400">±15%</span></td>
                        <td className="p-4 text-secondary">±40%</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* Acknowledgements */}
      <footer className="pt-12 border-t border-subtle">
         <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-8">
               <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
               <span className="text-sm font-mono text-secondary uppercase tracking-widest">Global Collaborators</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-50 hover:opacity-100 transition-opacity">
               <div className="h-4 w-24 bg-slate-700 rounded-full" title="Placeholder for NASA" />
               <div className="h-4 w-24 bg-slate-700 rounded-full" title="Placeholder for GMN" />
               <div className="h-4 w-24 bg-slate-700 rounded-full" title="Placeholder for FRIPON" />
               <div className="h-4 w-24 bg-slate-700 rounded-full" title="Placeholder for AMS" />
            </div>
         </div>
      </footer>

    </div>
  );
}
