import { useState } from 'react';

const faqs = [
  {
    q: 'How do I create a session?',
    a: 'Click "Get Started" on the landing page. On the next screen, click "Create Session" — you\'ll be automatically assigned as the Tracker and given an 8-character session ID. Share that ID with anyone you want to observe your map.',
  },
  {
    q: 'How does someone join my session as Tracked?',
    a: 'Send them the session ID. They open GeoSync, click "Join Session", paste the ID, select the "tracked" role, and click Join. Within seconds their map mirrors yours — you\'ll both see "PEER ✓" in your HUD.',
  },
  {
    q: 'How do I test both roles on my own?',
    a: 'Open two browser windows side by side — both pointing to the same URL. Window 1: Create Session → note the ID → you become Tracker. Window 2: Join Session → paste the ID → you become Tracked. Then pan/zoom Window 1 and watch Window 2 follow in real time.',
  },
  {
    q: 'Can the Tracked user move the map independently?',
    a: 'Yes — the Tracked user can freely pan and explore. Their movements don\'t broadcast anywhere. When they want to snap back to the Tracker\'s position, they click the "↺ RE-SYNC" button that appears in the top-right corner.',
  },
  {
    q: 'What happens if the Tracker disconnects?',
    a: 'The Tracked user\'s map freezes at the last known position. A notification appears: "Tracker disconnected. Map is frozen at last known position." The session stays alive — the Tracker can rejoin using the same ID and sync resumes.',
  },
  {
    q: 'What map data is being synced?',
    a: 'Every map:update event carries latitude, longitude, zoom level, bearing (rotation), and pitch (tilt angle) — all as full IEEE 754 double-precision floats. Both maps are always identical down to street level.',
  },
  {
    q: 'Is there a limit on rooms or users?',
    a: 'Currently each session supports exactly two roles: one Tracker and one Tracked. There\'s no limit on the number of concurrent sessions. Multi-observer support (one Tracker, many Tracked) is a planned extension.',
  },
  {
    q: 'What\'s the tech stack?',
    a: 'Backend: Node.js + Express + Socket.io + Redis (ioredis). Frontend: React + Vite + Zustand + MapLibre GL JS + Tailwind CSS v4. Maps use OpenStreetMap tiles — no API key required.',
  },
];

export default function FAQs() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faqs" style={{
      background: '#f5f3ff',
      padding: '50px 24px',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, color: '#6d35d9',
            fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', display: 'block', marginBottom: 16,
          }}>FAQs</span>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 700, color: '#0a0a0a',
            lineHeight: 1.1, letterSpacing: -1.5,
          }}>
            Common questions.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: 'white',
              border: '1px solid',
              borderColor: open === i ? '#a78bfa' : '#ede9fe',
              borderRadius: 12,
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '20px 24px',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 16,
                }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15, fontWeight: 600,
                  color: '#0a0a0a', lineHeight: 1.4,
                  textAlign: 'left',
                }}>{faq.q}</span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 18, color: '#6d35d9',
                  flexShrink: 0,
                  transition: 'transform 0.25s',
                  transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}>+</span>
              </button>

              {open === i && (
                <div style={{
                  padding: '0 24px 20px',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{
                    height: 1, background: '#f0eef8', marginBottom: 16,
                  }} />
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, color: '#5c5780',
                    lineHeight: 1.75,
                  }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}