import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useStore } from '../store/useStore';
import { useSocketSync } from '../hooks/useSocketSync';
import HUD from './HUD';
import Toast from './Toast';

// OpenStreetMap tile style (no API key needed)
const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [{
    id: 'osm-tiles',
    type: 'raster',
    source: 'osm',
    minzoom: 0,
    maxzoom: 19,
  }],
};

export default function MapView() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const isMovingRef = useRef(false); // prevent echo-emitting programmatic moves

  const { role, mapState, setMapState } = useStore();
  const { registerMap, emitMapUpdate, requestResync, leaveSession } = useSocketSync();

  const isTracker = role === 'tracker';

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    console.log('[MapView] Initializing map...', { mapContainer: mapContainer.current, mapState });

    // ── Initialize MapLibre ───────────────────────────────
    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_STYLE,
        center: [mapState.lng, mapState.lat],
        zoom: mapState.zoom,
        bearing: mapState.bearing,
        pitch: mapState.pitch,
        pitchWithRotate: true,
        dragRotate: true,
        touchZoomRotate: true,
        attributionControl: false,
      });

      console.log('[MapView] Map instance created', map);

      map.on('load', () => {
        console.log('[MapView] Map loaded successfully');
      });

      map.on('error', (e) => {
        console.error('[MapView] Map error:', e);
      });

      mapInstance.current = map;
      registerMap(map);

    // ── Tracker: emit on every map move ──────────────────
    if (isTracker) {
      const onMove = () => {
        if (isMovingRef.current) return; // skip programmatic moves

        const center = map.getCenter();
        const state = {
          lat: center.lat,
          lng: center.lng,
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        };

        setMapState(state);   // update local HUD immediately
        emitMapUpdate(state); // emit to server (throttled)
      };

      map.on('move', onMove);
    }

    // ── Tracked: update HUD when map moves (from easeTo) ─
    if (!isTracker) {
      map.on('move', () => {
        const center = map.getCenter();
        setMapState({
          lat: center.lat,
          lng: center.lng,
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      });

      // Tracked can still pan manually (for exploration)
      // but won't broadcast. Re-sync button snaps back.
    }
    } catch (error) {
      console.error('[MapView] Failed to initialize map:', error);
    }

    // ── Cleanup ───────────────────────────────────────────
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mapState, isTracker, registerMap, emitMapUpdate, setMapState]);

  // When tracked receives a new mapState from the store (set by useSocketSync),
  // the easeTo is already called inside useSocketSync — no need to duplicate here.

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* Map canvas */}
      <div ref={mapContainer} style={{ 
        position: 'absolute', 
        inset: 0, 
        width: '100%', 
        height: '100%',
        backgroundColor: '#e5e7eb'
      }} />

      {/* Tracker overlay: purple tinted top border to indicate broadcasting */}
      {isTracker && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '4px', 
          pointerEvents: 'none', 
          zIndex: 10,
          background: 'linear-gradient(90deg, var(--purple-500), var(--purple-300), var(--purple-500))' 
        }} />
      )}

      {/* Tracked overlay: subtle purple vignette to indicate viewing mode */}
      {!isTracker && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          pointerEvents: 'none', 
          zIndex: 1,
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(109,53,217,0.06) 100%)'
        }} />
      )}

      {/* HUD */}
      <HUD onResync={requestResync} onLeave={leaveSession} />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}