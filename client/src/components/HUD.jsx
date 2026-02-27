import { useStore } from '../store/useStore';

export default function HUD({ onResync, onLeave }) {
  const { mapState, connectionStatus, role, sessionId, peerConnected, isSynced } = useStore();

  const isTracker = role === 'tracker';

  const statusConfig = {
    connected:    { label: 'Connected',    color: '#22c55e', blink: false },
    connecting:   { label: 'Connecting…',  color: '#f59e0b', blink: true  },
    disconnected: { label: 'Disconnected', color: '#ef4444', blink: false },
    peer_lost:    { label: 'Peer Lost',    color: '#f59e0b', blink: true  },
    idle:         { label: 'Idle',         color: '#9892b8', blink: false },
  };

  const status = statusConfig[connectionStatus] || statusConfig.idle;

  return (
    <>
      {/* ── Top-left HUD ─────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-10 animate-slide-up"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--purple-100)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-purple)',
          minWidth: 210,
          overflow: 'hidden',
        }}>

        {/* Role badge header */}
        <div className="px-4 py-2.5 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--purple-50)',
            background: isTracker
              ? 'linear-gradient(135deg, var(--purple-600), var(--purple-700))'
              : 'linear-gradient(135deg, var(--purple-100), var(--purple-50))',
          }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full"
              style={{
                background: isTracker ? 'rgba(255,255,255,0.8)' : 'var(--purple-500)',
                animation: 'pulse-ring 1.5s ease-out infinite',
              }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: isTracker ? 'white' : 'var(--purple-700)',
            }}>
              {isTracker ? '📡 Broadcasting' : '📺 Syncing'}
            </span>
          </div>
        </div>

        {/* Coordinates & zoom */}
        <div className="px-4 py-3 space-y-2">
          <DataRow label="LAT" value={mapState.lat.toFixed(6)} />
          <DataRow label="LNG" value={mapState.lng.toFixed(6)} />
          <DataRow label="ZOOM" value={mapState.zoom.toFixed(2)} />
          {mapState.bearing !== 0 && (
            <DataRow label="BEAR" value={`${mapState.bearing.toFixed(1)}°`} />
          )}
          {mapState.pitch !== 0 && (
            <DataRow label="PITCH" value={`${mapState.pitch.toFixed(1)}°`} />
          )}
        </div>

        {/* Status row */}
        <div className="px-4 py-2.5 flex items-center gap-2"
          style={{ borderTop: '1px solid var(--purple-50)' }}>
          <div className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: status.color,
              ...(status.blink ? { animation: 'blink 1.2s ease-in-out infinite' } : {}),
            }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--gray-600)',
            flex: 1,
          }}>
            {status.label}
          </span>
          {peerConnected
            ? <span style={{ fontSize: 10, color: '#22c55e', fontFamily: 'var(--font-mono)' }}>PEER ✓</span>
            : <span style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>NO PEER</span>
          }
        </div>
      </div>

      {/* ── Top-right — Session ID + controls ───────────────────── */}
      <div className="absolute top-4 right-4 z-10 animate-slide-up flex flex-col items-end gap-2">

        {/* Session ID pill */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--purple-100)',
            boxShadow: 'var(--shadow-purple)',
          }}>
          <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
            SESSION
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--purple-700)',
            letterSpacing: 2,
          }}>
            {sessionId}
          </span>
          <button
            onClick={() => { navigator.clipboard?.writeText(sessionId); }}
            title="Copy session ID"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--purple-400)', fontSize: 12, padding: '0 2px',
            }}>
            ⧉
          </button>
        </div>

        {/* Re-sync button (Tracked only, when out of sync) */}
        {!isTracker && !isSynced && (
          <button onClick={onResync}
            className="animate-fade-in px-3 py-2 rounded-xl transition-all"
            style={{
              background: 'var(--purple-600)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              boxShadow: 'var(--glow-purple)',
            }}>
            ↺ RE-SYNC
          </button>
        )}

        {/* Leave button */}
        <button onClick={onLeave}
          className="px-3 py-2 rounded-xl transition-all"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--purple-100)',
            color: 'var(--gray-600)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: 1,
            boxShadow: 'var(--shadow-purple)',
          }}>
          ✕ LEAVE
        </button>
      </div>
    </>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--gray-400)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--purple-800)',
        letterSpacing: 0.5,
      }}>
        {value}
      </span>
    </div>
  );
}