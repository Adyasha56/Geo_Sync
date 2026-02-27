import { create } from 'zustand';

export const useStore = create((set) => ({
  // ── Session ────────────────────────────────────────────
  sessionId: null,
  role: null,           // 'tracker' | 'tracked' | null
  userId: null,
  peerConnected: false,

  // ── Connection ─────────────────────────────────────────
  // 'idle' | 'connecting' | 'connected' | 'disconnected' | 'peer_lost'
  connectionStatus: 'idle',

  // ── Map State ──────────────────────────────────────────
  mapState: {
    lat: 20.5937,   // Default: center of India
    lng: 78.9629,
    zoom: 4,
    bearing: 0,
    pitch: 0,
  },

  lastTrackerState: null,   // frozen state shown when tracker disconnects
  isSynced: true,           // tracked user: are we in sync with tracker?

  // ── UI ─────────────────────────────────────────────────
  notification: null,       // { message, type: 'info'|'warning'|'error' }

  // ── Actions ────────────────────────────────────────────
  setSession: (sessionId, role, userId) =>
    set({ sessionId, role, userId }),

  setConnectionStatus: (connectionStatus) =>
    set({ connectionStatus }),

  setPeerConnected: (peerConnected) =>
    set({ peerConnected }),

  setMapState: (mapState) =>
    set({ mapState }),

  setLastTrackerState: (lastTrackerState) =>
    set({ lastTrackerState }),

  setIsSynced: (isSynced) =>
    set({ isSynced }),

  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => set({ notification: null }), 4000);
  },

  reset: () =>
    set({
      sessionId: null,
      role: null,
      userId: null,
      peerConnected: false,
      connectionStatus: 'idle',
      lastTrackerState: null,
      isSynced: true,
      notification: null,
    }),
}));