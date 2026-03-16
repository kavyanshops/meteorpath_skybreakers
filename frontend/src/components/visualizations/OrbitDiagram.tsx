

interface OrbitProps {
  a_au: number;
  e: number;
  omega_deg: number;
  q_au?: number;
}

export function OrbitDiagram({ a_au, e, omega_deg, q_au }: OrbitProps) {
  if (!a_au || !e) {
    return <div className="text-slate-500 text-sm font-mono h-[300px] flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg">No orbital elements computed.</div>;
  }

  const size = 320;
  const center = size / 2;
  const zoomFactor = Math.min((size / 2 - 40) / Math.max(1.5, a_au * (1 + e)), 120);

  const c_au = a_au * e;
  const c_px = c_au * zoomFactor;
  const a_px = a_au * zoomFactor;
  const b_px = (e < 1.0) ? a_au * Math.sqrt(1 - e * e) * zoomFactor : a_px;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-center w-full min-h-[320px] p-4 bg-void border border-subtle rounded-xl relative overflow-hidden group">
        {/* Decorative faint grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <svg width={size} height={size} className="overflow-visible z-10">
          {/* Plane Orbits */}
          <circle cx={center} cy={center} r={0.39 * zoomFactor} fill="none" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
          <circle cx={center} cy={center} r={0.72 * zoomFactor} fill="none" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
          <circle cx={center} cy={center} r={1.0 * zoomFactor} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          <circle cx={center} cy={center} r={1.52 * zoomFactor} fill="none" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
          
          {/* Labels for planets */}
          <text x={center + 1.0 * zoomFactor} y={center + 5} className="fill-slate-500 font-mono text-[8px]">EARTH</text>

          {/* The Sun */}
          <circle cx={center} cy={center} r={6} fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.9))' }} />
          <circle cx={center} cy={center} r={16} fill="#fbbf24" opacity="0.1" />

          {/* Meteor Orbit */}
          <g transform={`translate(${center}, ${center}) rotate(${omega_deg})`}>
            {e < 1.0 ? (
              <ellipse cx={-c_px} cy={0} rx={a_px} ry={b_px} fill="none" stroke="#2dd4bf" strokeWidth="2" opacity="0.9" style={{ filter: 'drop-shadow(0 0 4px rgba(45,212,191,0.4))' }} />
            ) : (
              <path d={`M ${-size} ${size} Q ${a_px} 0 ${-size} ${-size}`} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
            )}
            
            {/* Perihelion dot */}
            <circle cx={a_px - c_px} cy={0} r={4} fill="#2dd4bf" className="animate-pulse" />
            <text x={a_px - c_px + 8} y={4} className="fill-accent-primary font-mono text-[10px] uppercase font-bold">Perihelion</text>
          </g>
        </svg>
        
        {/* HUD Info */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 font-mono text-[10px] text-slate-500">
          <div><span className="text-accent-primary font-bold">q = {q_au?.toFixed(3) || (a_au * (1 - e)).toFixed(3)} AU</span></div>
          <div><span className="text-slate-600">SYSTEM: J2000 HELIOCENTRIC</span></div>
        </div>
      </div>
    </div>
  );
}
