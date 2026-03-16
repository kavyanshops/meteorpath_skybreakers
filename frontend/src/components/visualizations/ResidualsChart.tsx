import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, ReferenceLine } from 'recharts';

interface ResidualDataPoint {
  station_code: string;
  residual_arcsec: number;
  index: number;
}

interface ResidualsChartProps {
  data: ResidualDataPoint[];
}

export function ResidualsChart({ data }: ResidualsChartProps) {
  if (!data || data.length === 0) return <div className="text-slate-500 text-sm tracking-wide h-64 flex items-center justify-center">No projection residual data available.</div>;

  const residuals = data.map(d => d.residual_arcsec);
  const median = residuals.sort((a, b) => a - b)[Math.floor(residuals.length / 2)] || 0;
  const max = Math.max(...residuals, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3 px-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Analysis Summary</span>
          <div className="flex gap-2 font-mono text-[11px]">
              <span className="text-slate-400">Median: <span className="text-secondary">{median.toFixed(1)}&Prime;</span></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Max: <span className="text-secondary">{max.toFixed(1)}&Prime;</span></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Outliers removed: <span className="text-slate-500">0</span></span>
          </div>
      </div>
      
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              type="category" 
              dataKey="station_code" 
              name="Station" 
              stroke="#64748b"
              tick={{fill: '#64748b', fontSize: 10}}
              angle={-35}
              textAnchor="end"
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis 
              type="number" 
              dataKey="residual_arcsec" 
              name="Residual" 
              stroke="#64748b"
              tick={{fill: '#64748b'}}
              unit="&Prime;"
              domain={[0, (maxValue: number) => Math.max(40, maxValue * 1.2)]}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis type="number" range={[40, 40]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3', stroke: '#334155' }}
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
              itemStyle={{ color: '#d946ef' }}
              formatter={(value: number, name: string) => {
                if (name === "Residual") return [`${value.toFixed(2)} arcsec`, "Angular Error"];
                return [value, name];
              }}
            />
            
            <ReferenceLine y={10} stroke="#10b981" strokeDasharray="4 4" opacity={0.5} label={{ position: 'right', value: '10"', fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 4" opacity={0.5} label={{ position: 'right', value: '30"', fill: '#f59e0b', fontSize: 10 }} />
            
            <Scatter name="Residuals" data={data} fill="#d946ef" opacity={0.8} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
