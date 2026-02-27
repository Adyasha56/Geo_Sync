import { Zap, Target, RotateCw, Map, Plug, Radio } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Zap,
      title: 'Sub-100ms Sync',
      desc: 'Socket.io with server-side throttling at 30fps ensures map movements arrive in near real-time without flooding the network.',
    },
    {
      icon: Target,
      title: 'Role-Based Control',
      desc: 'The Tracker owns the map. The Tracked observes. Clear separation of control prevents conflicts and accidental overrides.',
    },
    {
      icon: RotateCw,
      title: 'Re-sync on Demand',
      desc: 'Tracked users can freely explore, then snap back to the Tracker\'s exact position with one click.',
    },
    {
      icon: Map,
      title: 'Full Map State',
      desc: 'Syncs latitude, longitude, zoom, bearing, and pitch — so even 3D tilted views stay perfectly matched.',
    },
    {
      icon: Plug,
      title: 'Disconnect Resilience',
      desc: 'If the Tracker drops, the last known map state is preserved in Redis. Tracked users see a frozen snapshot, not a blank screen.',
    },
    {
      icon: Radio,
      title: 'Session Rooms',
      desc: 'Each session gets a unique 8-character ID. Share it with your observer and you\'re synced in seconds.',
    },
  ];

  return (
    <section id="about" style={{
      background: '#0a0a0a',
      padding: '50px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Section label */}
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, color: '#6d35d9',
            fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase',
          }}>About the platform</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40, alignItems: 'start', marginBottom: 50,
        }}>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, color: 'white',
            lineHeight: 1.1, letterSpacing: -1.5,
          }}>
            Built for precision.<br />
            <span style={{ color: '#8b5cf6' }}>Not approximation.</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, color: '#9892b8',
            lineHeight: 1.75, paddingTop: 8,
          }}>
            GeoSync is a real-time map synchronization platform built on Node.js,
            Socket.io, Redis, and MapLibre GL. It demonstrates how WebSocket-based
            state synchronization can be applied to spatial data — keeping two maps
            pixel-perfectly in sync across any network.
          </p>
        </div>

        {/* Feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
        }}>
          {features.map((f, i) => {
            const IconComponent = f.icon;
            return (
            <div key={i} style={{
              padding: '32px 28px',
              background: '#111111',
              border: '1px solid #1e1e1e',
              borderRadius: i === 0 ? '16px 0 0 0' : i === 2 ? '0 16px 0 0' : i === 3 ? '0 0 0 16px' : i === 5 ? '0 0 16px 0' : 0,
              transition: 'background 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#16102a'}
              onMouseLeave={e => e.currentTarget.style.background = '#111111'}
            >
              <div style={{ marginBottom: 16 }}><IconComponent size={28} color="#8b5cf6" /></div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 14, fontWeight: 700,
                color: 'white', marginBottom: 10, letterSpacing: -0.3,
              }}>{f.title}</div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, color: '#5c5780', lineHeight: 1.7,
              }}>{f.desc}</p>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
}