import { Siren, GraduationCap, MapPin, Truck, Plane, Monitor } from 'lucide-react';

const cases = [
  {
    tag: 'Field Operations',
    title: 'Emergency Response Coordination',
    desc: 'Command center operators broadcast live map positions to field teams. Everyone sees the same terrain, same zoom, same orientation — no radio confusion.',
    icon: Siren,
    accent: '#6d35d9',
  },
  {
    tag: 'Education',
    title: 'Geography & Navigation Training',
    desc: 'Instructors lead students through maps in real-time. Point to a region, zoom to a street — all students follow without needing to find it themselves.',
    icon: GraduationCap,
    accent: '#0a0a0a',
  },
  {
    tag: 'Remote Work',
    title: 'Collaborative Route Planning',
    desc: 'Teams in different cities explore the same map simultaneously. No screen-sharing lag, no "can you see my screen?" — just synchronized spatial context.',
    icon: MapPin,
    accent: '#6d35d9',
  },
  {
    tag: 'Logistics',
    title: 'Fleet & Delivery Monitoring',
    desc: 'Dispatchers track and broadcast delivery routes. Drivers on the Tracked role see the same map view the dispatcher is analysing.',
    icon: Truck,
    accent: '#0a0a0a',
  },
  {
    tag: 'Tourism',
    title: 'Live Virtual Tours',
    desc: 'Tour guides navigate maps while guests follow along on their own devices. Explore cities, landmarks, and routes together — from anywhere.',
    icon: Plane,
    accent: '#6d35d9',
  },
  {
    tag: 'Development',
    title: 'Real-time GIS Demos',
    desc: 'Developers and clients explore geospatial features together without screensharing. The client sees exactly what the developer is demonstrating.',
    icon: Monitor,
    accent: '#0a0a0a',
  },
];

export default function UseCases() {
  return (
    <section id="usecases" style={{
      background: 'white',
      padding: '50px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, color: '#6d35d9',
            fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', display: 'block', marginBottom: 16,
          }}>Use Cases</span>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, color: '#0a0a0a',
            lineHeight: 1.1, letterSpacing: -1.5,
          }}>
            Built for real problems.
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {cases.map((c, i) => {
            const IconComponent = c.icon;
            return (
            <div key={i} style={{
              border: '1px solid #000',
              borderRadius: 16, padding: '28px 28px 32px',
              background: 'white',
              transition: 'all 0.25s',
              cursor: 'default',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#000';
                e.currentTarget.style.boxShadow = '4px 4px 0 0 #a78bfa, -4px 4px 0 0 #a78bfa, 4px -4px 0 0 #000, -4px -4px 0 0 #000';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#000';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Corner accent */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 60, height: 60,
                background: `linear-gradient(225deg, ${c.accent}18 0%, transparent 60%)`,
              }} />

              <div style={{ marginBottom: 16 }}><IconComponent size={32} color={c.accent} /></div>

              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, color: c.accent === '#6d35d9' ? '#6d35d9' : '#9892b8',
                fontWeight: 700, letterSpacing: 2.5,
                textTransform: 'uppercase',
                display: 'block', marginBottom: 10,
              }}>{c.tag}</span>

              <h3 style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 15, fontWeight: 700,
                color: '#0a0a0a', marginBottom: 12,
                lineHeight: 1.3, letterSpacing: -0.3,
              }}>{c.title}</h3>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, color: '#5c5780', lineHeight: 1.7,
              }}>{c.desc}</p>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
}