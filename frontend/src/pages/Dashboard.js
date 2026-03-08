import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="card" style={{padding:'22px 24px',position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:-10,right:-10,fontSize:60,opacity:0.05}}>{icon}</div>
    <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:8}}>{label}</div>
    <div style={{fontSize:36,fontWeight:800,color,lineHeight:1,marginBottom:6}}>{value}</div>
    {sub && <div style={{fontSize:12,color:'var(--text-secondary)'}}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) return (
    <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>
      <p style={{color:'var(--text-secondary)',marginBottom:6}}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{color:p.color}}>{p.name}: {p.value}</p>)}
    </div>
  );
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const r = await axios.get(`${API}/dashboard/overview`);
      setData(r.data.data);
    } catch (e) {
      // Use mock data
      setData({
        totalScans: 1247, threatsToday: 23, threatsWeek: 156, blockchainLogs: 1183,
        avgRiskScore: 34,
        statusBreakdown: { phishing: 89, suspicious: 134, malware: 45, safe: 979 },
        dailyData: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
          day, total: 30+i*15, phishing: 5+i*2, suspicious: 10+i*3, safe: 15+i*10
        })),
        recentThreats: []
      });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const iv = setInterval(fetchData, 30000); return () => clearInterval(iv); }, []);

  if (loading) return <div style={{color:'var(--cyan)',fontFamily:'var(--font-mono)',padding:40}}>⬡ LOADING INTELLIGENCE DATA...</div>;

  const pieData = data ? [
    { name: 'Safe', value: data.statusBreakdown.safe, color: '#00ff88' },
    { name: 'Suspicious', value: data.statusBreakdown.suspicious, color: '#ffaa00' },
    { name: 'Phishing', value: data.statusBreakdown.phishing, color: '#ff3366' },
    { name: 'Malware', value: data.statusBreakdown.malware, color: '#a855f7' }
  ] : [];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>
            Security Overview
          </h1>
          <p style={{color:'var(--text-dim)',fontFamily:'var(--font-mono)',fontSize:12}}>
            REAL-TIME THREAT INTELLIGENCE DASHBOARD
          </p>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>Welcome back</div>
          <div style={{fontWeight:700,color:'var(--cyan)'}}>{user?.name}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
        <StatCard label="TOTAL SCANS" value={data?.totalScans?.toLocaleString()} sub="All time" color="var(--cyan)" icon="⬡" />
        <StatCard label="THREATS TODAY" value={data?.threatsToday} sub="Last 24 hours" color="var(--red)" icon="⚠" />
        <StatCard label="THREATS THIS WEEK" value={data?.threatsWeek} sub="Last 7 days" color="var(--yellow)" icon="⚠" />
        <StatCard label="BLOCKCHAIN LOGS" value={data?.blockchainLogs?.toLocaleString()} sub="Tamper-proof records" color="var(--purple)" icon="⬡" />
        <StatCard label="AVG RISK SCORE" value={`${data?.avgRiskScore}/100`} sub="Composite score" color="var(--green)" icon="◉" />
      </div>

      {/* Charts row */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        {/* Area chart */}
        <div className="card" style={{padding:'24px'}}>
          <div style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Threat Activity</div>
            <div style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>7-DAY DETECTION TREND</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.dailyData || []}>
              <defs>
                <linearGradient id="colPhish" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3366" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff3366" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colSusp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffaa00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colSafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fill:'rgba(226,234,248,0.4)',fontSize:12,fontFamily:'Space Mono'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'rgba(226,234,248,0.4)',fontSize:11}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="phishing" name="Phishing" stroke="#ff3366" fill="url(#colPhish)" strokeWidth={2} />
              <Area type="monotone" dataKey="suspicious" name="Suspicious" stroke="#ffaa00" fill="url(#colSusp)" strokeWidth={2} />
              <Area type="monotone" dataKey="safe" name="Safe" stroke="#00ff88" fill="url(#colSafe)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card" style={{padding:'24px'}}>
          <div style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Threat Breakdown</div>
            <div style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>STATUS DISTRIBUTION</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'Space Mono',fontSize:12}} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {pieData.map((d, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:13}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:10,height:10,borderRadius:3,background:d.color}} />
                  <span style={{color:'var(--text-secondary)'}}>{d.name}</span>
                </div>
                <span style={{fontFamily:'var(--font-mono)',color:d.color,fontWeight:700}}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div style={{
        background:'linear-gradient(135deg,rgba(0,200,255,0.08),rgba(0,85,255,0.08))',
        border:'1px solid rgba(0,200,255,0.2)',borderRadius:12,padding:'20px 24px',
        display:'flex',alignItems:'center',gap:20
      }}>
        <div style={{
          width:48,height:48,borderRadius:12,
          background:'linear-gradient(135deg,var(--cyan),#0055ff)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:22,flexShrink:0
        }}>⬡</div>
        <div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Blockchain Security Active</div>
          <div style={{fontSize:13,color:'var(--text-secondary)'}}>All threat detections are being cryptographically logged to the blockchain. Logs are tamper-proof and forensics-ready.</div>
        </div>
        <div style={{marginLeft:'auto',textAlign:'right',flexShrink:0}}>
          <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>NETWORK</div>
          <div style={{fontSize:13,color:'var(--purple)',fontWeight:700}}>Sepolia Testnet</div>
        </div>
      </div>
    </div>
  );
}
