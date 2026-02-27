export default function Footer() {
  const techStack = [
    'Node.js', 'Express', 'Socket.io', 'Redis',
    'React', 'Vite', 'MapLibre GL', 'Zustand', 'Tailwind v4',
  ];

  return (
    <footer style={{
      background: '#0a0a0a',
      borderTop: '1px solid #1e1e1e',
      padding: '30px 24px',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 24,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, #6d35d9, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700, fontSize: 16,
            color: 'white', letterSpacing: -0.5,
          }}>GeoSync</span>
        </div>

        {/* Tech stack pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: 8,
        }}>
          {techStack.map(tech => (
            <span key={tech} style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10, color: '#5c5780',
              background: '#111111',
              border: '1px solid #1e1e1e',
              borderRadius: 999, padding: '4px 12px',
              letterSpacing: 0.5,
            }}>{tech}</span>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: '#1e1e1e' }} />

        {/* Copyright */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: '#3a3a3a',
          letterSpacing: 0.3,
        }}>
          © {new Date().getFullYear()} GeoSync. All rights reserved.
        </p>
      </div>
    </footer>
  );
}