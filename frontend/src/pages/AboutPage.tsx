import { Github, Globe, Star, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 pb-20 mt-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-blue-100 tracking-tight mb-4">MeteorPath Phase 2</h1>
        <p className="text-slate-400 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
          The ultimate scientific command center for global fireball ingestion, 3D atmospheric trajectory triangulation, and strewn field prediction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="p-8 border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
          <Globe className="w-8 h-8 text-sky-400 mb-6" />
          <h2 className="text-xl font-mono font-semibold text-slate-200 mb-3">Multi-Network Ingestion</h2>
          <p className="text-sm text-slate-400 leading-loose">
            Aggregates live stream data seamlessly from the Global Meteor Network (GMN), FRIPON CSVs, and AMS citizen science reports into a unified PostgreSQL staging schema.
          </p>
        </Card>
        
        <Card className="p-8 border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
          <Star className="w-8 h-8 text-fuchsia-400 mb-6" />
          <h2 className="text-xl font-mono font-semibold text-slate-200 mb-3">Scientific Pipeline</h2>
          <p className="text-sm text-slate-400 leading-loose">
            Powered by Python SciPy, NumPy, Astropy, and Skyfield. Uses Line-of-sight Ray Intersection (Least Squares), NRLMSISE-00 atmospheric models, and numerical symplectic integration for heliocentric orbits.
          </p>
        </Card>
      </div>
      
      <div className="flex justify-center gap-6">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm rounded transition-colors shadow-lg">
           <Github className="w-4 h-4"/> GitHub Repository
        </a>
        <a href="#" className="flex items-center gap-3 px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-sm rounded transition-colors">
           <FileText className="w-4 h-4"/> Architecture Docs
        </a>
      </div>
    </div>
  );
}
