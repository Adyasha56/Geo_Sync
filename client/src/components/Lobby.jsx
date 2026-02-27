import { useState } from 'react';
import { getSocket } from '../lib/socket';
import { useStore } from '../store/useStore';

export default function Lobby() {
  const { setSession, setConnectionStatus } = useStore();

  const [mode, setMode] = useState(null);       // 'create' | 'join'
  const [sessionInput, setSessionInput] = useState('');
  const [preferredRole, setPreferredRole] = useState('tracker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connect = (cb) => {
    const socket = getSocket();
    setConnectionStatus('connecting');

    if (socket.connected) {
      cb(socket);
      return;
    }

    socket.connect();
    socket.once('connect', () => cb(socket));
    socket.once('connect_error', () => {
      setError('Cannot reach server. Is it running on port 3001?');
      setConnectionStatus('disconnected');
      setLoading(false);
    });
  };

  const handleCreate = () => {
    setLoading(true);
    setError('');

    connect((socket) => {
      socket.emit('session:create', (res) => {
        if (!res.success) {
          setError(res.error || 'Failed to create session');
          setLoading(false);
          return;
        }

        // Auto-join as tracker after creating
        socket.emit('session:join',
          { sessionId: res.sessionId, preferredRole: 'tracker' },
          (joinRes) => {
            setLoading(false);
            if (!joinRes.success) {
              setError(joinRes.error || 'Failed to join session');
              return;
            }
            setSession(joinRes.sessionId, joinRes.role, joinRes.userId);
            setConnectionStatus('connected');
            if (joinRes.peerConnected) {
              useStore.getState().setPeerConnected(true);
            }
          }
        );
      });
    });
  };

  const handleJoin = () => {
    const id = sessionInput.trim().toUpperCase();
    if (!id) { setError('Enter a session ID'); return; }

    setLoading(true);
    setError('');

    connect((socket) => {
      socket.emit('session:join',
        { sessionId: id, preferredRole },
        (res) => {
          setLoading(false);
          if (!res.success) {
            setError(res.error || 'Failed to join session');
            return;
          }
          setSession(res.sessionId, res.role, res.userId);
          setConnectionStatus('connected');
          if (res.lastMapState) {
            useStore.getState().setMapState(res.lastMapState);
          }
          if (res.peerConnected) {
            useStore.getState().setPeerConnected(true);
          }
        }
      );
    });
  };

  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      overflow: 'hidden',
      background: 'var(--white)' 
    }}>

      {/* Background grid decoration */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Purple glow orb */}
      <div style={{
        position: 'absolute',
        pointerEvents: 'none',
        width: '80vw',
        maxWidth: 600,
        height: '80vw',
        maxHeight: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      <div className="animate-slide-up" style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '28rem',
        padding: '0 1rem',
      }}>

        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--purple-600)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
              <div className="animate-pulse-ring" style={{
                position: 'absolute',
                top: '-0.25rem',
                right: '-0.25rem',
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                background: 'var(--purple-500)'
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(18px, 5vw, 22px)',
              fontWeight: 700,
              color: 'var(--purple-900)',
              letterSpacing: '-0.5px',
            }}>
              GeoSync
            </span>
          </div>
          <p style={{ color: 'var(--gray-600)', fontSize: 'clamp(12px, 3.5vw, 14px)', fontFamily: 'var(--font-sans)' }}>
            Real-time map synchronization
          </p>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: '1rem',
          padding: 'clamp(1rem, 5vw, 1.5rem)',
          background: 'var(--white)',
          border: '1px solid var(--purple-100)',
          boxShadow: 'var(--shadow-purple)',
        }}>

          {!mode ? (
            /* Mode selection */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                color: 'var(--gray-400)',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>
                Select an option
              </p>

              <button onClick={() => setMode('create')}
                className="transition-all"
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  padding: 'clamp(12px, 3vw, 16px)',
                  textAlign: 'left',
                  background: 'var(--purple-600)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}>
                <div style={{ fontWeight: 600, fontSize: 'clamp(14px, 3.5vw, 15px)', marginBottom: 4 }}>
                  Create Session
                </div>
                <div style={{ fontSize: 'clamp(12px, 3vw, 13px)', opacity: 0.8 }}>
                  Start a new room as Tracker
                </div>
              </button>

              <button onClick={() => setMode('join')}
                className="transition-all"
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  padding: 'clamp(12px, 3vw, 16px)',
                  textAlign: 'left',
                  background: 'var(--purple-50)',
                  color: 'var(--purple-900)',
                  border: '1px solid var(--purple-100)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}>
                <div style={{ fontWeight: 600, fontSize: 'clamp(14px, 3.5vw, 15px)', marginBottom: 4 }}>
                  Join Session
                </div>
                <div style={{ fontSize: 'clamp(12px, 3vw, 13px)', color: 'var(--gray-600)' }}>
                  Enter a session ID to join
                </div>
              </button>
            </div>

          ) : mode === 'create' ? (
            /* Create flow */
            <div className="animate-fade-in">
              <button onClick={() => setMode(null)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  marginBottom: '1.25rem',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: 'var(--gray-400)', 
                  fontSize: 'clamp(12px, 3vw, 13px)', 
                  fontFamily: 'var(--font-sans)' 
                }}>
                ← Back
              </button>
              <p style={{ color: 'var(--purple-900)', fontWeight: 600, marginBottom: 8, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
                Create a new session
              </p>
              <p style={{ fontSize: 'clamp(12px, 3vw, 13px)', color: 'var(--gray-600)', marginBottom: 20, lineHeight: 1.5 }}>
                You'll be assigned as the <strong>Tracker</strong>. Share the session ID with someone to let them observe your map.
              </p>

              {error && <ErrorBox message={error} />}

              <button onClick={handleCreate} disabled={loading}
                className="transition-all"
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  padding: 'clamp(10px, 2.5vw, 12px)',
                  background: loading ? 'var(--purple-300)' : 'var(--purple-600)',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(14px, 3.5vw, 15px)',
                  fontFamily: 'var(--font-sans)',
                }}>
                {loading ? 'Creating…' : 'Create & Start'}
              </button>
            </div>

          ) : (
            /* Join flow */
            <div className="animate-fade-in">
              <button onClick={() => setMode(null)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  marginBottom: '1.25rem',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: 'var(--gray-400)', 
                  fontSize: 'clamp(12px, 3vw, 13px)', 
                  fontFamily: 'var(--font-sans)' 
                }}>
                ← Back
              </button>
              <p style={{ color: 'var(--purple-900)', fontWeight: 600, marginBottom: '1rem', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
                Join a session
              </p>

              {/* Session ID input */}
              <label style={{ 
                fontSize: 'clamp(11px, 2.5vw, 12px)', 
                color: 'var(--gray-600)',
                fontFamily: 'var(--font-mono)', 
                letterSpacing: 1, 
                display: 'block', 
                marginBottom: '0.375rem' 
              }}>
                SESSION ID
              </label>
              <input
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="e.g. A1B2C3D4"
                maxLength={8}
                style={{
                  width: '100%',
                  padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 14px)',
                  borderRadius: 10,
                  border: '1.5px solid var(--purple-200)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  letterSpacing: 4,
                  color: 'var(--purple-900)',
                  outline: 'none',
                  marginBottom: '1rem',
                  background: 'var(--purple-50)',
                  textTransform: 'uppercase',
                }}
              />

              {/* Role selector */}
              <label style={{ 
                fontSize: 'clamp(11px, 2.5vw, 12px)', 
                color: 'var(--gray-600)',
                fontFamily: 'var(--font-mono)', 
                letterSpacing: 1, 
                display: 'block', 
                marginBottom: '0.5rem' 
              }}>
                PREFERRED ROLE
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {['tracker', 'tracked'].map((r) => (
                  <button key={r} onClick={() => setPreferredRole(r)}
                    style={{
                      flex: 1,
                      padding: 'clamp(6px, 2vw, 8px) clamp(10px, 2.5vw, 12px)',
                      borderRadius: 8,
                      border: preferredRole === r
                        ? '1.5px solid var(--purple-500)'
                        : '1.5px solid var(--purple-100)',
                      background: preferredRole === r ? 'var(--purple-50)' : 'transparent',
                      color: preferredRole === r ? 'var(--purple-700)' : 'var(--gray-400)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(11px, 2.5vw, 12px)',
                      cursor: 'pointer',
                      fontWeight: preferredRole === r ? 700 : 400,
                      textTransform: 'capitalize',
                      transition: 'all 0.15s',
                    }}>
                    {r}
                  </button>
                ))}
              </div>

              {error && <ErrorBox message={error} />}

              <button onClick={handleJoin} disabled={loading}
                className="transition-all"
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  padding: 'clamp(10px, 2.5vw, 12px)',
                  background: loading ? 'var(--purple-300)' : 'var(--purple-600)',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(14px, 3.5vw, 15px)',
                  fontFamily: 'var(--font-sans)',
                }}>
                {loading ? 'Joining…' : 'Join Session'}
              </button>
            </div>
          )}
        </div>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '1.25rem', 
          fontSize: 'clamp(10px, 2.5vw, 12px)',
          color: 'var(--gray-400)', 
          fontFamily: 'var(--font-mono)' 
        }}>
          GeoSync v1.0 · Built with MapLibre GL + Socket.io
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="animate-fade-in"
      style={{ 
        borderRadius: '0.5rem',
        padding: 'clamp(8px, 2vw, 12px) clamp(10px, 2.5vw, 12px)',
        marginBottom: '1rem',
        background: '#fff1f1', 
        border: '1px solid #fca5a5',
        color: '#dc2626', 
        fontSize: 'clamp(12px, 3vw, 13px)', 
        fontFamily: 'var(--font-sans)' 
      }}>
      {message}
    </div>
  );
}