import { Zap, Radio } from 'lucide-react';

export default function Hero({ onGetStarted }) {
  return (
    <section style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      paddingTop: 80,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(109,53,217,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(109,53,217,0.15) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Top-right purple glow */}
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom-left glow */}
      <div style={{
        position: 'absolute', bottom: -80, left: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109,53,217,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1200, width: '100%',
        padding: '0 24px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#f5f3ff',
            border: '1px solid #ddd6fe',
            borderRadius: 999, padding: '6px 16px',
          }}>
            <Zap size={14} color="#6d35d9" />
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, color: '#6d35d9',
              fontWeight: 700, letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}>
              Real-time · Sub-100ms latency
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          textAlign: 'center',
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(36px, 6vw, 80px)',
          fontWeight: 700,
          color: '#0a0a0a',
          lineHeight: 1.15,
          letterSpacing: -2,
          marginBottom: 16,
        }}>
          Maps that move <span style={{ color: '#6d35d9' }}>together.</span>
        </h1>

        {/* Subheadline */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: '#5c5780',
          maxWidth: 560, margin: '0 auto 28px',
          lineHeight: 1.65, fontWeight: 400,
        }}>
          GeoSync lets one user control a map while others observe in perfect sync —
          built on WebSockets with real-time coordinate broadcasting.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={onGetStarted} style={{
            background: '#6d35d9',
            color: 'white', border: 'none', cursor: 'pointer',
            borderRadius: 999,
            padding: '10px 24px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 700,
            letterSpacing: 0.3,
            boxShadow: '0 8px 32px rgba(109,53,217,0.35)',
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(109,53,217,0.45)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 32px rgba(109,53,217,0.35)'; }}
          >
            Get Started →
          </button>

          <button onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'transparent',
              color: '#0a0a0a', cursor: 'pointer',
              border: '1.5px solid #e2dff0',
              borderRadius: 999,
              padding: '10px 24px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#6d35d9'; e.target.style.color = '#6d35d9'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#e2dff0'; e.target.style.color = '#0a0a0a'; }}
          >
            Learn more
          </button>
        </div>

        {/* Map Preview Cards */}
        <div style={{
          marginTop: 72,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20, maxWidth: 900, margin: '72px auto 0',
        }}>
          <MapCard
            label={<><Radio size={16} /> Tracker</>}
            badge="BROADCASTING"
            badgeColor="#6d35d9"
            lat="28.613939"
            lng="77.209021"
            zoom="14.50"
            description="Controls the map — pan, zoom, tilt. Every movement is broadcast to all observers."
            mapSvg={<TrackerMapSVG />}
          />
          <MapCard
            label={<><Radio size={16} /> Tracked</>}
            badge="SYNCING"
            badgeColor="#0a0a0a"
            lat="28.613939"
            lng="77.209021"
            zoom="14.50"
            description="Observes in real-time. Map mirrors the Tracker's view with sub-100ms latency."
            mapSvg={<TrackedMapSVG />}
          />
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: 'clamp(24px, 5vw, 64px)',
          marginTop: 56, flexWrap: 'wrap',
        }}>
          {[
            { value: '<100ms', label: 'Sync Latency' },
            { value: '30fps', label: 'Update Rate' },
            { value: '∞', label: 'Rooms' },
            { value: '2', label: 'Roles' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 700, color: '#0a0a0a',
                letterSpacing: -1,
              }}>{stat.value}</div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, color: '#9892b8',
                marginTop: 4, letterSpacing: 0.5,
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </section>
  );
}

function MapCard({ label, badge, badgeColor, lat, lng, zoom, description, mapSvg }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #ede9fe',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 4px 32px rgba(109,53,217,0.08)',
      transition: 'transform 0.25s, box-shadow 0.25s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(109,53,217,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 32px rgba(109,53,217,0.08)'; }}
    >
      {/* Map visual */}
      <div style={{ position: 'relative', height: 180, background: '#f0eef8', overflow: 'hidden' }}>
        {mapSvg}
        {/* Role badge overlay */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: badgeColor, color: 'white',
          borderRadius: 999, padding: '4px 12px',
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
        }}>
          {badge}
        </div>
      </div>

      {/* HUD strip */}
      <div style={{
        background: '#0a0a0a', padding: '10px 16px',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        {[['LAT', lat], ['LNG', lng], ['ZOOM', zoom]].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#9892b8', letterSpacing: 2 }}>{k}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'white', fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700, fontSize: 15, color: '#0a0a0a', marginBottom: 6,
        }}>{label}</div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, color: '#5c5780', lineHeight: 1.6,
        }}>{description}</p>
      </div>
    </div>
  );
}

// SVG map illustrations
function TrackerMapSVG() {
  return (
    <svg width="100%" height="180" viewBox="0 0 400 180" style={{ position: 'absolute', inset: 0 }}>
      <rect width="400" height="180" fill="#e8e4f8" />
      {/* Road grid */}
      <line x1="0" y1="90" x2="400" y2="90" stroke="#d4cff0" strokeWidth="8" />
      <line x1="200" y1="0" x2="200" y2="180" stroke="#d4cff0" strokeWidth="8" />
      <line x1="0" y1="45" x2="400" y2="45" stroke="#ddd9f5" strokeWidth="4" />
      <line x1="0" y1="135" x2="400" y2="135" stroke="#ddd9f5" strokeWidth="4" />
      <line x1="100" y1="0" x2="100" y2="180" stroke="#ddd9f5" strokeWidth="4" />
      <line x1="300" y1="0" x2="300" y2="180" stroke="#ddd9f5" strokeWidth="4" />
      {/* Blocks */}
      <rect x="30" y="20" width="50" height="15" rx="3" fill="#c4b5fd" opacity="0.7" />
      <rect x="220" y="55" width="60" height="20" rx="3" fill="#a78bfa" opacity="0.5" />
      <rect x="310" y="100" width="70" height="25" rx="3" fill="#c4b5fd" opacity="0.6" />
      <rect x="30" y="100" width="55" height="18" rx="3" fill="#ddd6fe" opacity="0.8" />
      <rect x="120" y="20" width="65" height="16" rx="3" fill="#ede9fe" opacity="0.9" />
      {/* Tracker pin */}
      <circle cx="200" cy="90" r="14" fill="#6d35d9" opacity="0.2" />
      <circle cx="200" cy="90" r="8" fill="#6d35d9" />
      <circle cx="200" cy="90" r="3" fill="white" />
      {/* Pulse rings */}
      <circle cx="200" cy="90" r="20" fill="none" stroke="#6d35d9" strokeWidth="2" opacity="0.4" />
      <circle cx="200" cy="90" r="28" fill="none" stroke="#6d35d9" strokeWidth="1.5" opacity="0.2" />
    </svg>
  );
}

function TrackedMapSVG() {
  return (
    <svg width="100%" height="180" viewBox="0 0 400 180" style={{ position: 'absolute', inset: 0 }}>
      <rect width="400" height="180" fill="#f0eef8" />
      <line x1="0" y1="90" x2="400" y2="90" stroke="#e2dff0" strokeWidth="8" />
      <line x1="200" y1="0" x2="200" y2="180" stroke="#e2dff0" strokeWidth="8" />
      <line x1="0" y1="45" x2="400" y2="45" stroke="#ede9fe" strokeWidth="4" />
      <line x1="0" y1="135" x2="400" y2="135" stroke="#ede9fe" strokeWidth="4" />
      <line x1="100" y1="0" x2="100" y2="180" stroke="#ede9fe" strokeWidth="4" />
      <line x1="300" y1="0" x2="300" y2="180" stroke="#ede9fe" strokeWidth="4" />
      <rect x="30" y="20" width="50" height="15" rx="3" fill="#ddd6fe" opacity="0.5" />
      <rect x="220" y="55" width="60" height="20" rx="3" fill="#c4b5fd" opacity="0.4" />
      <rect x="310" y="100" width="70" height="25" rx="3" fill="#ddd6fe" opacity="0.5" />
      <rect x="30" y="100" width="55" height="18" rx="3" fill="#ede9fe" opacity="0.7" />
      <rect x="120" y="20" width="65" height="16" rx="3" fill="#f5f3ff" opacity="0.8" />
      {/* Sync indicator crosshair */}
      <line x1="185" y1="90" x2="195" y2="90" stroke="#6d35d9" strokeWidth="2" />
      <line x1="205" y1="90" x2="215" y2="90" stroke="#6d35d9" strokeWidth="2" />
      <line x1="200" y1="75" x2="200" y2="85" stroke="#6d35d9" strokeWidth="2" />
      <line x1="200" y1="95" x2="200" y2="105" stroke="#6d35d9" strokeWidth="2" />
      <circle cx="200" cy="90" r="10" fill="none" stroke="#6d35d9" strokeWidth="2" />
      <circle cx="200" cy="90" r="3" fill="#6d35d9" />
    </svg>
  );
}