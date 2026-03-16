import { cn } from '../ui/Badge';

interface CompareEventData {
  id: number;
  gmn_id?: string;
  network: string;
  a: number;
  e: number;
  i: number;
  omega: number;
  big_omega: number;
  q: number;
  Q: number;
  period: number;
  orbit_class: string;
  shower: string;
  color: string;
}

interface ComparisonTableProps {
  events: CompareEventData[];
}

export function ComparisonTable({ events }: ComparisonTableProps) {
  if (events.length === 0) return null;

  const baseline = events[0];

  const rows = [
    { label: 'Semi-major Axis (a)', key: 'a', unit: 'AU' },
    { label: 'Eccentricity (e)', key: 'e', unit: '' },
    { label: 'Inclination (i)', key: 'i', unit: '°' },
    { label: 'Arg. Perihelion (ω)', key: 'omega', unit: '°' },
    { label: 'Asc. Node (Ω)', key: 'big_omega', unit: '°' },
    { label: 'Perihelion (q)', key: 'q', unit: 'AU' },
    { label: 'Aphelion (Q)', key: 'Q', unit: 'AU' },
    { label: 'Period', key: 'period', unit: 'yr' },
  ];

  const getDiffClass = (val: any, baselineVal: any) => {
    if (typeof val !== 'number' || typeof baselineVal !== 'number') return '';
    const diff = Math.abs(val - baselineVal);
    const percent = baselineVal !== 0 ? (diff / baselineVal) * 100 : 0;
    return percent > 15 ? 'text-amber-400 bg-amber-400/10' : 'text-slate-300';
  };

  const getOrbitClassColor = (ecc: number) => {
     if (ecc >= 1) return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
     if (ecc > 0.8) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
     return 'text-teal-400 bg-teal-400/10 border-teal-400/20';
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-subtle bg-surface/30">
      <table className="w-full font-mono text-sm">
        <thead>
          <tr className="border-b border-subtle bg-void/50 text-secondary">
            <th className="py-4 px-6 text-left font-semibold">Parameter</th>
            {events.map(e => (
              <th key={e.id} className="py-4 px-6 text-center whitespace-nowrap" style={{ color: e.color }}>
                {e.gmn_id || `ID_${e.id}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle/50">
          {rows.map(row => (
            <tr key={row.key} className="hover:bg-void/30 transition-colors">
              <td className="py-4 px-6 text-secondary">{row.label}</td>
              {events.map(e => {
                const val = (e as any)[row.key];
                const bVal = (baseline as any)[row.key];
                return (
                  <td key={e.id} className={cn("py-4 px-6 text-center tabular-nums transition-colors", getDiffClass(val, bVal))}>
                    {val?.toFixed(3) || '--'} {row.unit}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="bg-void/20">
            <td className="py-4 px-6 text-secondary">Orbit Class</td>
            {events.map(e => (
              <td key={e.id} className="py-4 px-6 text-center">
                <span className={cn("px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider", getOrbitClassColor(e.e))}>
                  {e.orbit_class || 'Unknown'}
                </span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-4 px-6 text-secondary">Shower</td>
            {events.map(e => (
              <td key={e.id} className="py-4 px-6 text-center text-xs text-slate-400">
                {e.shower || 'Sporadic'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
