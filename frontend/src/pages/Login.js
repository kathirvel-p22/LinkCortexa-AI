import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [showAdminMode, setShowAdminMode] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      setShowAdminMode(true);
      setMode('admin');
      setForm({ name: '', email: '', password: '' });
      // Reset click count after 3 seconds
      setTimeout(() => setClickCount(0), 3000);
    } else if (newCount < 5) {
      // Reset count after 2 seconds if not reached 5
      setTimeout(() => setClickCount(0), 2000);
    }
  };

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'login' || mode === 'admin') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'var(--bg-primary)',position:'relative',overflow:'hidden'
    }} className="grid-bg">
      {/* Animated background orbs */}
      {[...Array(3)].map((_,i) => (
        <div key={i} style={{
          position:'absolute',borderRadius:'50%',filter:'blur(80px)',opacity:0.08,
          width:[400,300,200][i],height:[400,300,200][i],
          background:['var(--cyan)','var(--purple)','var(--green)'][i],
          top:['-10%','60%','30%'][i],left:['70%','-5%','40%'][i],
          animation:`pulse-ring ${[8,10,6][i]}s infinite ease-in-out`
        }} />
      ))}

      <div style={{
        width:'100%',maxWidth:420,padding:'0 20px',position:'relative',
        animation:'fadeInUp 0.6s ease'
      }}>
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <div 
            onClick={handleLogoClick}
            style={{
              width:70,height:70,borderRadius:18,margin:'0 auto 16px',
              background:'linear-gradient(135deg,var(--cyan),#0055ff)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:28,fontWeight:900,color:'#060910',
              boxShadow:'0 0 40px rgba(0,200,255,0.3)',
              cursor:'pointer',
              transition:'transform 0.2s',
              transform: clickCount > 0 ? 'scale(1.1)' : 'scale(1)'
            }}
          >LC</div>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:6}}>LinkCortexa AI</h1>
          <p style={{color:'var(--text-dim)',fontSize:13,fontFamily:'var(--font-mono)',letterSpacing:2}}>CYBER THREAT INTELLIGENCE</p>
          {showAdminMode && (
            <div style={{
              marginTop:12,padding:'8px 16px',background:'rgba(168,85,247,0.15)',
              border:'1px solid rgba(168,85,247,0.3)',borderRadius:8,
              color:'var(--purple)',fontSize:12,fontFamily:'var(--font-mono)',
              animation:'fadeInUp 0.3s ease'
            }}>
              ⬡ ADMIN MODE ACTIVATED
            </div>
          )}
        </div>

        <div className="card" style={{padding:32}}>
          {!showAdminMode && (
            <div style={{display:'flex',gap:0,marginBottom:28,background:'rgba(255,255,255,0.04)',borderRadius:8,padding:4}}>
              {['login','register'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex:1,padding:'9px',border:'none',borderRadius:6,cursor:'pointer',
                  fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,letterSpacing:0.5,
                  background: mode===m ? 'var(--cyan)' : 'transparent',
                  color: mode===m ? '#060910' : 'var(--text-secondary)',
                  transition:'all 0.2s',textTransform:'uppercase'
                }}>{m}</button>
              ))}
            </div>
          )}

          {showAdminMode && (
            <div style={{
              marginBottom:24,padding:'12px 16px',background:'rgba(168,85,247,0.1)',
              border:'1px solid rgba(168,85,247,0.2)',borderRadius:8,
              display:'flex',alignItems:'center',justifyContent:'space-between'
            }}>
              <span style={{color:'var(--purple)',fontSize:13,fontFamily:'var(--font-mono)',fontWeight:700}}>
                ADMINISTRATOR LOGIN
              </span>
              <button 
                onClick={() => { setShowAdminMode(false); setMode('login'); setForm({ name:'', email:'', password:'' }); }}
                style={{
                  background:'transparent',border:'1px solid rgba(168,85,247,0.3)',
                  color:'var(--purple)',padding:'4px 12px',borderRadius:6,
                  fontSize:11,fontFamily:'var(--font-mono)',cursor:'pointer'
                }}
              >EXIT</button>
            </div>
          )}

          {error && (
            <div style={{background:'var(--red-dim)',border:'1px solid rgba(255,51,102,0.3)',color:'var(--red)',padding:'10px 14px',borderRadius:8,marginBottom:20,fontSize:13,fontFamily:'var(--font-mono)'}}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:16}}>
            {mode === 'register' && (
              <div>
                <label style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,display:'block',marginBottom:6}}>FULL NAME</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required />
              </div>
            )}
            <div>
              <label style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,display:'block',marginBottom:6}}>EMAIL</label>
              <input 
                type="email" 
                placeholder={showAdminMode ? "admin@gmail.com" : "kathirvel.p2006@gmail.com"} 
                value={form.email} 
                onChange={e => setForm({...form,email:e.target.value})} 
                required 
              />
            </div>
            <div>
              <label style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,display:'block',marginBottom:6}}>PASSWORD</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{marginTop:8,padding:'14px'}}>
              {loading ? 'AUTHENTICATING...' : showAdminMode ? '⬡ ADMIN ACCESS' : mode === 'login' ? '⬡ ACCESS SYSTEM' : '⬡ CREATE ACCOUNT'}
            </button>
          </form>

          {!showAdminMode && (
            <div style={{marginTop:20,padding:'12px',background:'rgba(0,200,255,0.06)',borderRadius:8,border:'1px solid rgba(0,200,255,0.15)'}}>
              <p style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',textAlign:'center',lineHeight:1.6}}>
                DEMO CREDENTIALS<br/>
                kathirvel.p2006@gmail.com / 1234567890
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
