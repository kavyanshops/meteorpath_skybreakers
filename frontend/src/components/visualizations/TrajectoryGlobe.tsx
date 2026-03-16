import { useState, useRef } from 'react';
import { Viewer, Entity, PolylineGraphics, PointGraphics, LabelGraphics, CesiumComponentRef } from 'resium';
import { Cartesian2, Cartesian3, Color, Ion, Viewer as CesiumViewer } from 'cesium';
import { Layers, Maximize } from 'lucide-react';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN || '';

interface GlobeProps {
  trajectoryHtmlColor?: string;
  points?: { lat: number, lon: number, height: number }[];
  stations?: { id: string | number, lat: number, lon: number, height: number, name: string }[];
  losLines?: { fromLat: number, fromLon: number, fromH: number, toLat: number, toLon: number, toH: number }[];
}

export function TrajectoryGlobe({ points = [], stations = [], losLines = [], trajectoryHtmlColor = "#2dd4bf" }: GlobeProps) {
  const [showLos, setShowLos] = useState(true);
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  if (!points || points.length === 0) {
    return (
      <div className="h-full w-full bg-slate-900/50 flex items-center justify-center text-slate-500 font-mono text-sm border border-slate-800 rounded-lg min-h-[400px]">
        No 3D trajectory data available.
      </div>
    );
  }

  const trajPositions = (points || [])
    .filter(p => p && typeof p.lat === 'number' && typeof p.lon === 'number')
    .map(p => Cartesian3.fromDegrees(p.lon, p.lat, p.height || 0));
    
  const trajColor = Color.fromCssColorString(trajectoryHtmlColor);

  const handleResetView = () => {
    if (viewerRef.current?.cesiumElement && trajPositions.length > 0) {
      const mid = points[Math.floor(points.length / 2)];
      viewerRef.current.cesiumElement.camera.flyTo({
        destination: Cartesian3.fromDegrees(mid.lon, mid.lat, (mid.height || 0) + 150000),
        duration: 2
      });
    }
  };

  return (
    <div className="h-[450px] w-full overflow-hidden rounded-xl border border-slate-800 shadow-xl relative z-0 group">
      
      {/* HUD Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={() => setShowLos(!showLos)}
          className={`p-2 rounded-lg border backdrop-blur-md transition-all ${showLos ? 'bg-accent-primary/20 border-accent-primary text-accent-primary' : 'bg-void/60 border-default text-secondary hover:text-primary'}`}
          title="Toggle LOS Rays"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button 
          onClick={handleResetView}
          className="p-2 rounded-lg bg-void/60 border border-default text-secondary hover:text-primary backdrop-blur-md transition-all"
          title="Reset Camera"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      <Viewer 
        ref={viewerRef}
        full 
        timeline={false} 
        animation={false} 
        baseLayerPicker={true} 
        infoBox={false} 
        navigationHelpButton={false} 
        sceneModePicker={false} 
        geocoder={false} 
        homeButton={false} 
        selectionIndicator={false}
        className="w-full h-full"
      >
        <Entity>
          <PolylineGraphics positions={trajPositions} width={5} material={trajColor} />
        </Entity>

        {(stations || []).filter(s => s && typeof s.lat === 'number' && typeof s.lon === 'number').map((s) => (
          <Entity key={s.id} position={Cartesian3.fromDegrees(s.lon, s.lat, s.height || 0)}>
            <PointGraphics pixelSize={8} color={Color.AQUAMARINE} outlineColor={Color.BLACK} outlineWidth={2} />
            <LabelGraphics text={s.name} font="10px monospace" pixelOffset={new Cartesian2(0, -15)} fillColor={Color.WHITE} showBackground={true} backgroundColor={Color.BLACK.withAlpha(0.6)} />
          </Entity>
        ))}

        {showLos && losLines.map((line, idx) => {
           const pos = [
             Cartesian3.fromDegrees(line.fromLon, line.fromLat, line.fromH),
             Cartesian3.fromDegrees(line.toLon, line.toLat, line.toH)
           ];
           return (
             <Entity key={`los-${idx}`}>
               <PolylineGraphics positions={pos} width={1.5} material={Color.VIOLET.withAlpha(0.3)} />
             </Entity>
           )
        })}
      </Viewer>
    </div>
  );
}
