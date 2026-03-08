import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { useAlert } from '../context/AlertContext';

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} end={to==='/'} style={({isActive}) => ({
    display:'flex',alignItems:'center',gap:12,padding:'11px 16px',borderRadius:10,
    textDecoration:'none',fontWeight:600,fontSize:14,transition:'all 0.2s',
    color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
    background: isActive ? 'var(--cyan-dim)' : 'transparent',
    border: isActive ? '1px solid rgba(0,200,255,0.2)' : '1px solid transparent'
  })}>
    <span style={{fontSize:18}}>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const [threatCount, setThreatCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('threat_detected', (data) => {
      setThreatCount(c => c+1);
      addAlert(`🚨 Threat detected: ${data.domain} (Score: ${data.riskScore})`, 'danger');
    });
    return () => socket.disconnect();
  }, [addAlert]);

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-primary)'}}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 70 : 240, flexShrink:0,
        background:'var(--bg-secondary)',
        borderRight:'1px solid var(--border)',
        display:'flex',flexDirection:'column',
        transition:'width 0.3s ease',overflow:'hidden',
        position:'sticky',top:0,height:'100vh'
      }}>
        {/* Logo */}
        <div style={{padding:'24px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}>
          <div style={{
            width:38,height:38,borderRadius:10,flexShrink:0,
            background:'linear-gradient(135deg,var(--cyan),#0055ff)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:18,fontWeight:900,color:'#060910'
          }}>LC</div>
          {!collapsed && (
            <div>
              <div style={{fontWeight:800,fontSize:15,letterSpacing:0.5,color:'var(--text-primary)'}}>LinkCortexa</div>
              <div style={{fontSize:10,color:'var(--cyan)',fontFamily:'var(--font-mono)',letterSpacing:1}}>AI SECURITY</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:'16px 10px',display:'flex',flexDirection:'column',gap:4,overflowY:'auto'}}>
          <NavItem to="/" icon="◈" label="Dashboard" />
          <NavItem to="/scanner" icon="🚀" label="URL Scanner" />
          <NavItem to="/threats" icon="⚠" label="Threats" />
          <NavItem to="/analytics" icon="◉" label="Analytics" />
          <NavItem to="/blockchain" icon="⬡" label="Blockchain Logs" />
          <NavItem to="/profile" icon="👤" label="Profile" />
        </nav>

        {/* User */}
        <div style={{padding:'16px 10px',borderTop:'1px solid var(--border)'}}>
          {!collapsed && (
            <div 
              onClick={() => navigate('/profile')}
              style={{
                padding:'12px',background:'var(--bg-card)',borderRadius:10,
                border:'1px solid var(--border)',marginBottom:8,
                cursor:'pointer',transition:'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--cyan)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <div style={{fontSize:13,fontWeight:700,color:'var(--text-primary)'}}>{user?.name}</div>
              <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>{user?.role?.toUpperCase()}</div>
            </div>
          )}
          <button onClick={logout} className="btn-ghost" style={{width:'100%',padding:'9px',fontSize:12}}>
            {collapsed ? '⏻' : '⏻ Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflow:'auto',display:'flex',flexDirection:'column'}}>
        {/* Top bar */}
        <header style={{
          background:'var(--bg-secondary)',borderBottom:'1px solid var(--border)',
          padding:'0 28px',height:60,display:'flex',alignItems:'center',
          justifyContent:'space-between',position:'sticky',top:0,zIndex:100
        }}>
          <button onClick={() => setCollapsed(c => !c)} style={{background:'none',border:'none',color:'var(--text-secondary)',cursor:'pointer',fontSize:18}}>☰</button>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            {threatCount > 0 && (
              <div style={{background:'var(--red-dim)',border:'1px solid rgba(255,51,102,0.3)',color:'var(--red)',padding:'4px 12px',borderRadius:20,fontSize:12,fontFamily:'var(--font-mono)',animation:'pulse-ring 2s infinite'}}>
                ⚠ {threatCount} LIVE THREAT{threatCount > 1 ? 'S' : ''}
              </div>
            )}
            <div style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </header>

        <div style={{flex:1,padding:'28px',maxWidth:1400,margin:'0 auto',width:'100%'}}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
