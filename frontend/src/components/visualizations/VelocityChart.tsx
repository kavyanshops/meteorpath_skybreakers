import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';

interface VelocityDataPoint {
  time_sec: number;
  velocity_km_s: number;
  sigma_km_s?: number;
}

interface VelocityChartProps {
  data: VelocityDataPoint[];
}

export function VelocityChart({ data }: VelocityChartProps) {
  if (!data || data.length === 0) return <div className="text-slate-500 text-sm tracking-wide h-64 flex items-center justify-center">No trajectory velocity data available.</div>;

  // Add mock error bands if not present for visual effect
  const chartData = data.map(d => ({
    ...d,
    v_upper: d.velocity_km_s + (d.sigma_km_s || 0.5),
    v_lower: d.velocity_km_s - (d.sigma_km_s || 0.5),
  }));

  return (
    <div className="h-64 w-full font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time_sec" 
            stroke="#64748b" 
            tick={{fill: '#64748b'}}
            tickFormatter={(val) => `${val.toFixed(1)}s`}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            tick={{fill: '#64748b'}}
            domain={['auto', 'auto']}
            tickFormatter={(val) => `${val.toFixed(0)} km/s`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
            itemStyle={{ color: '#2dd4bf' }}
            labelFormatter={(label) => `Time: ${Number(label).toFixed(3)}s`}
          />
          
          {/* Error Band */}
          <Area
            type="monotone"
            dataKey="v_range"
            fill="#334155"
            stroke="none"
            opacity={0.3}
            data={chartData.map(d => ({ ...d, v_range: [d.v_lower, d.v_upper] }))}
          />

          <Line 
            type="monotone" 
            dataKey="velocity_km_s" 
            stroke="#2dd4bf" 
            strokeWidth={2}
            dot={{ r: 2, fill: '#2dd4bf', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#2dd4bf', stroke: '#0f172a', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
