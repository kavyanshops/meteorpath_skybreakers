import { motion } from 'framer-motion';

interface EventRadiant {
    id: number;
    gmn_id?: string;
    ra: number;
    dec: number;
    sigma_ra: number;
    sigma_dec: number;
    color: string;
}

interface RadiantSkyMapProps {
    events: EventRadiant[];
}

export function RadiantSkyMap({ events }: RadiantSkyMapProps) {
    const width = 600;
    const height = 300;
    const padding = 40;

    // Projection helpers (Simple cylindrical for demo, but using RA/Dec units)
    const projectX = (ra: number) => padding + ((ra / 360) * (width - 2 * padding));
    const projectY = (dec: number) => height - padding - (((dec + 90) / 180) * (height - 2 * padding));

    return (
        <div className="relative w-full aspect-[2/1] bg-void border border-subtle rounded-xl overflow-hidden group">
            {/* Grid Background */}
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <defs>
                    <radialGradient id="sky-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width={width} height={height} fill="url(#sky-glow)" />

                {/* Grid Lines */}
                {Array.from({ length: 13 }).map((_, i) => (
                    <line 
                        key={`ra-${i}`}
                        x1={projectX(i * 30)} y1={padding} 
                        x2={projectX(i * 30)} y2={height - padding} 
                        stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2"
                    />
                ))}
                {Array.from({ length: 7 }).map((_, i) => (
                    <line 
                        key={`dec-${i}`}
                        x1={padding} y1={projectY(i * 30 - 90)} 
                        x2={width - padding} y2={projectY(i * 30 - 90)} 
                        stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2"
                    />
                ))}

                {/* Axes Labels */}
                <text x={width/2} y={height - 10} className="fill-slate-500 text-[10px] font-mono text-center" textAnchor="middle">RIGHT ASCENSION (RA) 0° → 360°</text>
                <text x={10} y={height/2} className="fill-slate-500 text-[10px] font-mono" transform={`rotate(-90 10 ${height/2})`} textAnchor="middle">DECLINATION (DEC)</text>

                {/* Events */}
                {events.map((e) => {
                    const cx = projectX(e.ra);
                    const cy = projectY(e.dec);
                    const rx = (e.sigma_ra / 360) * (width - 2 * padding) * 10; // Scaled for visibility
                    const ry = (e.sigma_dec / 180) * (height - 2 * padding) * 10;

                    return (
                        <g key={e.id} className="cursor-pointer">
                            {/* Error Ellipse */}
                            <ellipse 
                                cx={cx} cy={cy} rx={rx} ry={ry}
                                fill={e.color} fillOpacity="0.1"
                                stroke={e.color} strokeWidth="1" strokeDasharray="1 1"
                            />
                            {/* Radiant Dot */}
                            <motion.circle 
                                cx={cx} cy={cy} r="4" 
                                fill={e.color}
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="shadow-lg"
                                style={{ filter: `drop-shadow(0 0 4px ${e.color})` }}
                            />
                            
                            {/* Hover Tooltip (Conceptual within SVG) */}
                            <title>{`${e.gmn_id || e.id}: RA ${e.ra.toFixed(1)}°, Dec ${e.dec.toFixed(1)}° (±${e.sigma_ra.toFixed(1)}″)`}</title>
                        </g>
                    );
                })}
            </svg>
            
            <div className="absolute top-4 left-4 font-mono text-[10px] text-slate-500 pointer-events-none">
                COORD SYSTEM: J2000 CELESTIAL
            </div>
        </div>
    );
}
