import { useState, useEffect } from 'react';

export default function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Use Cases', href: '#usecases' },
    { label: 'FAQs', href: '#faqs' },
  ];

  const scrollTo = (href) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(109,53,217,0.1)' : '1px solid transparent',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6d35d9, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700, fontSize: 18,
            color: '#0a0a0a', letterSpacing: -0.5,
          }}>GeoSync</span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}
          className="desktop-nav">
          {navLinks.map(link => (
            <button key={link.label}
              onClick={() => scrollTo(link.href)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 500,
                color: '#3a3a3a',
                transition: 'color 0.2s',
                padding: '4px 0',
              }}
              onMouseEnter={e => e.target.style.color = '#6d35d9'}
              onMouseLeave={e => e.target.style.color = '#3a3a3a'}
            >
              {link.label}
            </button>
          ))}

          <button onClick={onGetStarted} style={{
            background: '#0a0a0a',
            color: 'white',
            border: 'none', cursor: 'pointer',
            borderRadius: 999,
            padding: '7px 16px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s',
            letterSpacing: 0.2,
          }}
            onMouseEnter={e => { e.target.style.background = '#6d35d9'; e.target.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.target.style.background = '#0a0a0a'; e.target.style.transform = 'scale(1)'; }}
          >
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'none', flexDirection: 'column', gap: 5, padding: 4,
          }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block', width: 22, height: 2,
              background: '#0a0a0a', borderRadius: 2,
              transition: 'all 0.2s',
            }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid #f0eef8',
          padding: '16px 24px 20px',
        }}>
          {navLinks.map(link => (
            <button key={link.label}
              onClick={() => scrollTo(link.href)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 500,
                color: '#3a3a3a', padding: '12px 0',
                borderBottom: '1px solid #f5f3ff',
              }}>
              {link.label}
            </button>
          ))}
          <button onClick={onGetStarted} style={{
            marginTop: 16, width: '100%',
            background: '#0a0a0a', color: 'white',
            border: 'none', cursor: 'pointer', borderRadius: 999,
            padding: '10px', fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 600,
          }}>
            Get Started
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}