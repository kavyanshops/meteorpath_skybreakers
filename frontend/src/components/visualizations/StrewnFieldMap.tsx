import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertTriangle } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface StrewnFieldProps {
  impactLat: number;
  impactLon: number;
  pathCoordinates: [number, number, number][]; // [lon, lat, alt]
  survived: boolean;
  ellipseSemiMajorM: number;
  ellipseSemiMinorM: number;
  massKg: number;
  mcPoints?: { lat: number, lon: number }[];
}

function BoundsUpdater({ impactLat, impactLon }: { impactLat: number, impactLon: number }) {
  const map = useMap();
  useEffect(() => {
    if (impactLat && impactLon) {
      map.setView([impactLat, impactLon], 13);
    }
  }, [impactLat, impactLon, map]);
  return null;
}

export function StrewnFieldMap({ impactLat, impactLon, pathCoordinates, survived, ellipseSemiMajorM, massKg, mcPoints = [] }: StrewnFieldProps) {
  if (!survived || !impactLat) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-void border border-subtle rounded-xl min-h-[300px]">
        <span className="text-secondary font-mono">Meteorite ablated during atmospheric flight.</span>
        <span className="text-slate-500 text-xs mt-2 italic">No dark-flight footprint detected.</span>
      </div>
    );
  }

  const polyline = pathCoordinates.map(p => [p[1], p[0]] as [number, number]);

  return (
    <div className="flex flex-col gap-3">
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-subtle shadow-lg relative z-0">
        <MapContainer center={[impactLat, impactLon]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <BoundsUpdater impactLat={impactLat} impactLon={impactLon} />
            
            {/* Dark flight path line visible (violet) */}
            <Polyline positions={polyline} color="#8b5cf6" weight={4} opacity={0.7} dashArray="8, 12" />
            
            {/* Orange MC scatter points visible */}
            {mcPoints.map((p, i) => (
                <Circle key={i} center={[p.lat, p.lon]} radius={15} color="#f97316" weight={1} fillOpacity={0.6} />
            ))}

            {/* Strewn field ellipse overlay drawn */}
            <Circle 
            center={[impactLat, impactLon]} 
            radius={ellipseSemiMajorM || 1500} 
            color="#f59e0b" 
            fillColor="#f59e0b" 
            fillOpacity={0.15} 
            weight={2} 
            dashArray="10, 10"
            />
            
            {/* Nominal impact marker has popup with lat/lon */}
            <Marker position={[impactLat, impactLon]}>
            <Popup className="font-mono text-xs">
                <b className="text-accent-primary block mb-1">Impact Nominal</b>
                <div>Lat: {impactLat.toFixed(6)}°</div>
                <div>Lon: {impactLon.toFixed(6)}°</div>
                <div className="mt-1 pt-1 border-t border-slate-700 text-emerald-400">Mass: {(massKg || 0).toFixed(2)} kg</div>
            </Popup>
            </Marker>
        </MapContainer>
        </div>

        {/* Amber warning strip visible below map */}
        <div className="flex items-center gap-3 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
            <div className="flex flex-col">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Ground Impact Hazard</span>
                <span className="text-[11px] text-amber-500/80">Predicted strewn field covers populated terrain. Local recovery efforts advised.</span>
            </div>
        </div>
    </div>
  );
}
