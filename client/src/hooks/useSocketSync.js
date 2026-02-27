import { useEffect, useRef, useCallback } from 'react';
import { getSocket, destroySocket } from '../lib/socket';
import { useStore } from '../store/useStore';

const THROTTLE_MS = 33; // match server throttle — ~30fps

export function useSocketSync() {
  const {
    setConnectionStatus,
    setPeerConnected,
    setMapState,
    setLastTrackerState,
    setIsSynced,
    showNotification,
    reset,
    role,
    sessionId,
  } = useStore();

  const lastEmitRef = useRef(0);
  const mapRef = useRef(null); // holds the MapLibre instance

  // ── Register map instance so we can call flyTo on sync ──────────────────
  const registerMap = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  // ── Connect and register all listeners ──────────────────────────────────
  useEffect(() => {
    if (!sessionId || !role) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    // ── Connection lifecycle ─────────────────────────────
    const onConnect = () => {
      console.log('[Socket] Connected:', socket.id);
      setConnectionStatus('connected');
    };

    const onDisconnect = (reason) => {
      console.warn('[Socket] Disconnected:', reason);
      setConnectionStatus('disconnected');
      showNotification('Connection lost. Attempting to reconnect…', 'error');
    };

    const onReconnect = () => {
      setConnectionStatus('connected');
      showNotification('Reconnected to server', 'info');
    };

    // ── Session events ───────────────────────────────────
    const onPeerJoined = ({ role: peerRole }) => {
      setPeerConnected(true);
      showNotification(
        `${peerRole === 'tracker' ? 'Tracker' : 'Tracked'} user connected`,
        'info'
      );
    };

    const onPeerDisconnected = ({ role: peerRole, lastMapState, message }) => {
      setPeerConnected(false);

      if (peerRole === 'tracker' && lastMapState) {
        setLastTrackerState(lastMapState);
        setIsSynced(false);
      }

      showNotification(message, 'warning');
    };

    // ── Map sync (Tracked receives from Tracker) ─────────
    const onMapSync = (state) => {
      if (role !== 'tracked') return;

      setMapState(state);
      setIsSynced(true);

      // Smoothly fly the map to the new position
      if (mapRef.current) {
        mapRef.current.easeTo({
          center: [state.lng, state.lat],
          zoom: state.zoom,
          bearing: state.bearing,
          pitch: state.pitch,
          duration: 80,   // fast enough to feel real-time, smooth enough to not jitter
          easing: (t) => t, // linear — preserves sync fidelity
        });
      }
    };

    // Register all listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('session:peer_joined', onPeerJoined);
    socket.on('session:peer_disconnected', onPeerDisconnected);
    socket.on('map:sync', onMapSync);

    // ── Cleanup — remove ALL listeners on unmount ────────
    // This is the single most important thing for preventing memory leaks
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      socket.off('session:peer_joined', onPeerJoined);
      socket.off('session:peer_disconnected', onPeerDisconnected);
      socket.off('map:sync', onMapSync);
    };
  }, [sessionId, role, setConnectionStatus, setPeerConnected, setMapState, setLastTrackerState, setIsSynced, showNotification]);

  // ── Tracker emits map movement (throttled) ───────────────────────────────
  const emitMapUpdate = useCallback((mapState) => {
    if (role !== 'tracker') return;

    const now = Date.now();
    if (now - lastEmitRef.current < THROTTLE_MS) return;
    lastEmitRef.current = now;

    const socket = getSocket();
    if (!socket.connected) return;

    socket.emit('map:update', mapState);
  }, [role]);

  // ── Tracked requests re-sync ─────────────────────────────────────────────
  const requestResync = useCallback(() => {
    const socket = getSocket();
    socket.emit('map:request_sync', (response) => {
      if (response.success) {
        setIsSynced(true);
        showNotification('Re-synced to Tracker position', 'info');
      } else {
        showNotification(response.error || 'Re-sync failed', 'error');
      }
    });
  }, [setIsSynced, showNotification]);

  // ── Leave session ────────────────────────────────────────────────────────
  const leaveSession = useCallback(() => {
    const socket = getSocket();
    socket.emit('session:leave', () => {
      destroySocket();
      reset();
    });
  }, [reset]);

  return { registerMap, emitMapUpdate, requestResync, leaveSession };
}