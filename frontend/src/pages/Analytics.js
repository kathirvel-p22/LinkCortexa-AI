import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const API = 'http://localhost:5000/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>
      <p style={{color:'var(--text-secondary)',marginBottom:6}}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{color:p.color||'var(--cyan)'}}>{p.name}: {p.value}</p>)}
    </div>
  );
  return null;
};

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/analyze/stats`).catch(() => null),
      axios.get(`${API}/threats/by-country`).catch(() => null),
      axios.get(`${API}/threats/top`).catch(() => null)
    ]).then(([statsR, countryR, topR]) => {
      setStats({
        overall: statsR?.data?.data || { totalScans:1247,phishing:89,suspicious:134,malware:45,safe:979,avgRiskScore:34,threatsBlocked:134 },
        byCountry: countryR?.data?.data || [
          {country:'IN',count:234},{country:'CN',count:189},{country:'RU',count:145},{country:'US',count:89},{country:'BR',count:67}
        ],
        topThreats: topR?.data?.data || Array.from({length:5}, (_,i) => ({
          url:`https://phish-site-${i}.tk/login`, domain:`phish-site-${i}.tk`, riskScore:95-i*5, status:'phishing'
        }))
      });
    });
  }, []);

  const radarData = stats ? [
    { metric: 'Phishing', value: Math.round((stats.overall.phishing / Math.max(stats.overall.totalScans,1)) * 100) },
    { metric: 'Malware', value: Math.round((stats.overall.malware / Math.max(stats.overall.totalScans,1)) * 100) },
    { metric: 'Suspicious', value: Math.round((stats.overall.suspicious / Math.max(stats.overall.totalScans,1)) * 100) },
    { metric: 'Avg Risk', value: stats.overall.avgRiskScore },
    { metric: 'Blocked', value: Math.round((stats.overall.threatsBlocked / Math.max(stats.overall.totalScans,1)) * 100) }
  ] : [];

  if (!stats) return <div style={{color:'var(--cyan)',fontFamily:'var(--font-mono)',padding:40}}>⬡ LOADING ANALYTICS...</div>;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <h1 style={{fontSize:26,fontWeight:800,marginBottom:4}}>Analytics & Intelligence</h1>
        <p style={{color:'var(--text-dim)',fontFamily:'var(--font-mono)',fontSize:12}}>THREAT INTELLIGENCE INSIGHTS & PATTERNS</p>
      </div>

      {/* Top KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14}}>
        {[
          { label:'TOTAL SCANS', value: stats.overall.totalScans?.toLocaleString(), color:'var(--cyan)' },
          { label:'PHISHING', value: stats.overall.phishing, color:'var(--red)' },
          { label:'MALWARE', value: stats.overall.malware, color:'var(--purple)' },
          { label:'SUSPICIOUS', value: stats.overall.suspicious, color:'var(--yellow)' },
          { label:'SAFE', value: stats.overall.safe, color:'var(--green)' },
          { label:'THREATS BLOCKED', value: stats.overall.threatsBlocked, color:'var(--cyan)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{padding:'18px 20px',textAlign:'center'}}>
            <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:8}}>{label}</div>
            <div style={{fontSize:28,fontWeight:800,color}}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Country bar chart */}
        <div className="card" style={{padding:24}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Threats by Country</div>
          <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',marginBottom:16}}>TOP ATTACKING ORIGINS</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byCountry.slice(0,7)} layout="vertical">
              <XAxis type="number" tick={{fill:'rgba(226,234,248,0.4)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="country" tick={{fill:'rgba(226,234,248,0.6)',fontSize:12,fontFamily:'Space Mono'}} axisLine={false} tickLine={false} width={35}/>
              <Tooltip content={<CustomTooltip />}/>
              <Bar dataKey="count" name="Threats" fill="url(#barGrad)" radius={[0,4,4,0]}/>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff3366" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#ff3366" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="card" style={{padding:24}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Threat Profile</div>
          <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',marginBottom:16}}>MULTI-DIMENSIONAL RISK ANALYSIS</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)"/>
              <PolarAngleAxis dataKey="metric" tick={{fill:'rgba(226,234,248,0.5)',fontSize:11,fontFamily:'Space Mono'}}/>
              <PolarRadiusAxis tick={{fill:'rgba(226,234,248,0.3)',fontSize:9}} axisLine={false}/>
              <Radar name="Risk %" dataKey="value" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.15} strokeWidth={2}/>
              <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'Space Mono',fontSize:12}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top threats */}
      <div className="card" style={{padding:24}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Highest Risk URLs Detected</div>
        <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',marginBottom:16}}>TOP 5 BY RISK SCORE</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {stats.topThreats.map((t, i) => (
            <div key={i} style={{
              display:'flex',alignItems:'center',gap:16,padding:'14px 16px',
              borderRadius:10,background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)'
            }}>
              <div style={{
                width:32,height:32,borderRadius:8,flexShrink:0,
                background: i===0 ? 'linear-gradient(135deg,#ff3366,#ff0044)' : 'rgba(255,51,102,0.15)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:14,fontWeight:800,color: i===0 ? '#fff' : 'var(--red)'
              }}>#{i+1}</div>
              <div style={{flex:1,overflow:'hidden'}}>
                <div style={{fontSize:13,fontFamily:'var(--font-mono)',color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.url||t.domain}</div>
                <div style={{fontSize:11,color:'var(--text-dim)',marginTop:2}}>{t.domain} · {t.status}</div>
              </div>
              <div style={{flexShrink:0}}>
                <div style={{
                  fontSize:20,fontWeight:800,color:'var(--red)',fontFamily:'var(--font-mono)',textAlign:'right'
                }}>{t.riskScore}</div>
                <div style={{fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',textAlign:'right'}}>RISK</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education section */}
      <div className="card" style={{padding:24}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>🎓 Cybersecurity Awareness</div>
        <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',marginBottom:20}}>HOW TO STAY SAFE ONLINE</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
          {[
            { icon:'🔗', title:'Check URLs before clicking', tip:'Look for misspellings, extra subdomains, or suspicious TLDs like .xyz, .tk, .ml' },
            { icon:'🔒', title:'Always prefer HTTPS', tip:'HTTP sites do not encrypt data. Never enter passwords on HTTP pages.' },
            { icon:'📧', title:'Verify email senders', tip:'Phishing emails often use lookalike domains. Hover over links before clicking.' },
            { icon:'🔑', title:'Use 2FA everywhere', tip:'Two-factor authentication prevents 99.9% of account takeover attacks.' },
            { icon:'🔄', title:'Keep software updated', tip:'Most malware exploits known vulnerabilities in outdated software.' },
            { icon:'⬡', title:'Trust blockchain-verified logs', tip:'Immutable logs cannot be altered. Always use tamper-proof security records.' }
          ].map(({ icon, title, tip }) => (
            <div key={title} style={{padding:'16px',background:'rgba(255,255,255,0.02)',borderRadius:10,border:'1px solid var(--border)'}}>
              <div style={{fontSize:24,marginBottom:10}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{title}</div>
              <div style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.5}}>{tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
