// ThreatMap.js
import React, { useState, useEffect } from 'react';
import { Globe, Activity, Zap } from 'lucide-react';

const ATTACK_ORIGINS = [
  { country: 'China', lat: 35.86, lon: 104.19, count: 89, color: '#ff4444' },
  { country: 'Russia', lat: 61.52, lon: 105.31, count: 67, color: '#ff6644' },
  { country: 'Nigeria', lat: 9.08, lon: 8.67, count: 45, color: '#ff8844' },
  { country: 'Brazil', lat: -14.23, lon: -51.92, count: 34, color: '#ffaa44' },
  { country: 'Ukraine', lat: 48.38, lon: 31.16, count: 28, color: '#ffcc44' },
  { country: 'India', lat: 20.59, lon: 78.96, count: 22, color: '#ffdd44' },
  { country: 'USA', lat: 37.09, lon: -95.71, count: 18, color: '#ff4488' },
];

const LIVE_ATTACKS = [
  'Phishing attempt from CN → India', 'Malware download from RU → Germany',
  'Credential stuffing from NG → UK', 'SQL injection from BR → Australia',
  'DDoS probe from UA → Netherlands', 'Phishing email campaign from CN → USA'
];

export function ThreatMap() {
  const [liveIndex, setLiveIndex] = useState(0);
  const [attacks, setAttacks] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIndex(i => (i + 1) % LIVE_ATTACKS.length);
      setAttacks(prev => [
        { id: Date.now(), text: LIVE_ATTACKS[Math.floor(Math.random() * LIVE_ATTACKS.length)], time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Global Threat Map</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono' }}>
          Real-time visualization of cyber attack origins worldwide
        </p>
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 16px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8 }}>
        <span className="status-dot status-danger" />
        <span style={{ fontSize: 12, color: 'var(--accent-red)', fontFamily: 'JetBrains Mono' }}>LIVE THREAT FEED: {LIVE_ATTACKS[liveIndex]}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Visual Map */}
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, marginBottom: 20, color: 'var(--text-primary)' }}>Attack Origins</h3>
          {/* SVG World Map Representation */}
          <div style={{ position: 'relative', background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden', minHeight: 300 }}>
            <svg viewBox="0 0 800 400" style={{ width: '100%', height: 300 }}>
              {/* World outline shapes (simplified) */}
              <rect x="0" y="0" width="800" height="400" fill="none" />
              {/* Grid */}
              {[...Array(8)].map((_, i) => (
                <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="400" stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
              ))}
              {[...Array(4)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
              ))}
              {/* Continents (simplified shapes) */}
              <path d="M 60 80 Q 120 60 150 100 Q 170 140 140 160 Q 100 170 70 150 Z" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
              <path d="M 320 60 Q 420 50 460 90 Q 480 130 450 170 Q 400 200 340 180 Q 300 150 310 110 Z" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
              <path d="M 470 70 Q 620 50 680 100 Q 720 150 700 220 Q 650 260 580 240 Q 520 210 490 160 Q 460 120 470 70 Z" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
              <path d="M 160 200 Q 250 180 300 220 Q 340 260 300 310 Q 240 340 180 320 Q 140 290 150 250 Z" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
              <path d="M 460 230 Q 530 210 570 250 Q 590 290 560 330 Q 510 360 470 340 Q 440 310 450 270 Z" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
              <path d="M 620 240 Q 680 220 700 260 Q 710 300 680 330 Q 640 350 615 330 Q 600 300 610 270 Z" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />

              {/* Attack Dots */}
              {ATTACK_ORIGINS.map((a, i) => {
                const x = ((a.lon + 180) / 360) * 800;
                const y = ((90 - a.lat) / 180) * 400;
                const r = Math.sqrt(a.count) * 2;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={r * 2} fill={a.color} opacity={0.1} />
                    <circle cx={x} cy={y} r={r} fill={a.color} opacity={0.7}>
                      <animate attributeName="r" values={`${r};${r + 4};${r}`} dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x={x + r + 4} y={y + 4} fill={a.color} fontSize="9" fontFamily="JetBrains Mono">{a.country}</text>
                  </g>
                );
              })}

              {/* Attack Lines from all to center */}
              {ATTACK_ORIGINS.slice(0, 3).map((a, i) => {
                const x1 = ((a.lon + 180) / 360) * 800;
                const y1 = ((90 - a.lat) / 180) * 400;
                return (
                  <line key={i} x1={x1} y1={y1} x2="400" y2="200" stroke={a.color} strokeWidth="0.5" opacity={0.3} strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" values="100;0" dur={`${2 + i}s`} repeatCount="indefinite" />
                  </line>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Stats & Live Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, marginBottom: 14, color: 'var(--text-primary)' }}>Top Attack Sources</h3>
            {ATTACK_ORIGINS.map((a, i) => (
              <div key={a.country} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>#{i + 1} {a.country}</span>
                  <span style={{ fontSize: 11, color: a.color, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{a.count}</span>
                </div>
                <div className="risk-meter">
                  <div className="risk-fill" style={{ width: `${(a.count / 89) * 100}%`, background: a.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, marginBottom: 14, color: 'var(--text-primary)' }}>Live Attack Feed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {attacks.slice(0, 5).map(a => (
                <div key={a.id} style={{ padding: '8px 10px', background: 'rgba(255,68,68,0.05)', borderRadius: 6, border: '1px solid rgba(255,68,68,0.15)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{a.text}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{a.time}</p>
                </div>
              ))}
              {attacks.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>Waiting for events...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreatMap;
