import { Viewer, Entity, PointGraphics, PolylineGraphics } from 'resium';
import * as Cesium from 'cesium';
import { EventDetail } from '../../types';
import { useEffect, useRef, useState } from 'react';

// Required for Cesium in Vite
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface EarthGlobeProps {
    event: EventDetail;
}

export function EarthGlobe({ event }: EarthGlobeProps) {
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const [imageryProvider, setImageryProvider] = useState<Cesium.ImageryProvider | null>(null);

    useEffect(() => {
        // Try to load a dark basemap if possible, fallback to default
        try {
            // Using CartoDB Dark Matter if available via XYZ, otherwise fallback
            const provider = new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                credit: '© CARTO',
            });
            setImageryProvider(provider);
        } catch (e) {
            console.warn('Could not load custom imagery', e);
        }
    }, []);

    useEffect(() => {
        if (!viewerRef.current) return;
        const viewer = viewerRef.current;

        if (event.begin_lat && event.begin_lon) {
            // Fly to the event coordinates
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    event.begin_lon,
                    event.begin_lat,
                    800000 // 800km altitude
                ),
                duration: 2,
            });
        } else {
            // Zoom out to see whole earth if no coords
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(0, 0, 15000000),
                duration: 0,
            });
        }
    }, [event.begin_lat, event.begin_lon]);

    const hasCoords = event.begin_lat && event.begin_lon && event.end_lat && event.end_lon;
    const isPending = !event.has_reconstruction;

    return (
        <div className="relative w-full h-[400px] rounded-lg border border-default overflow-hidden bg-void">
            <Viewer
                ref={(e) => {
                    if (e && e.cesiumElement) {
                        viewerRef.current = e.cesiumElement;
                    }
                }}
                full
                timeline={false}
                animation={false}
                navigationHelpButton={false}
                sceneModePicker={false}
                baseLayerPicker={false}
                geocoder={false}
                homeButton={false}
                infoBox={false}
                selectionIndicator={false}
                fullscreenButton={false}
                requestRenderMode={true} // optimize performance
                imageryProvider={imageryProvider || undefined}
                className="absolute inset-0"
            >
                {/* Render line if we have both points */}
                {hasCoords && (
                    <Entity>
                        <PolylineGraphics
                            positions={Cesium.Cartesian3.fromDegreesArrayHeights([
                                event.begin_lon!, event.begin_lat!, (event.begin_ht_km || 100) * 1000,
                                event.end_lon!, event.end_lat!, (event.end_ht_km || 50) * 1000
                            ])}
                            width={3}
                            material={Cesium.Color.fromCssColorString('#2DD4BF').withAlpha(0.8)}
                        />
                    </Entity>
                )}

                {/* Start Point (Red/Amber) */}
                {event.begin_lat && event.begin_lon && (
                    <Entity
                        position={Cesium.Cartesian3.fromDegrees(event.begin_lon, event.begin_lat, (event.begin_ht_km || 100) * 1000)}
                        description="Trajectory Start"
                    >
                        <PointGraphics pixelSize={8} color={Cesium.Color.fromCssColorString('#F59E0B')} outlineWidth={2} outlineColor={Cesium.Color.fromCssColorString('#1A2236')} />
                    </Entity>
                )}

                {/* End Point (Teal) */}
                {event.end_lat && event.end_lon && (
                    <Entity
                        position={Cesium.Cartesian3.fromDegrees(event.end_lon, event.end_lat, (event.end_ht_km || 50) * 1000)}
                        description="Trajectory End"
                    >
                        <PointGraphics pixelSize={8} color={Cesium.Color.fromCssColorString('#2DD4BF')} outlineWidth={2} outlineColor={Cesium.Color.fromCssColorString('#1A2236')} />
                    </Entity>
                )}
            </Viewer>

            {/* Overlay if reconstruction pending */}
            {isPending && (
                <div className="absolute inset-0 bg-deep/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-surface border border-default flex items-center justify-center mb-4">
                        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h3 className="font-display text-lg text-primary mb-1">Trajectory Reconstruction Pending</h3>
                    <p className="text-secondary text-sm max-w-sm">
                        Run the reconstruction algorithm to calculate the 3D atmospheric path and plot it on the globe.
                    </p>
                </div>
            )}
        </div>
    );
}
