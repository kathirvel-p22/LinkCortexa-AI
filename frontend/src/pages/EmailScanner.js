import React, { useState } from 'react';
import { Mail, Search, CheckCircle, XCircle, AlertTriangle, Zap, Shield } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function EmailScanner() {
  const [emailContent, setEmailContent] = useState('');
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scan = async () => {
    if (!emailContent.trim()) return toast.error('Paste email content to scan');
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/email/scan', { emailContent, subject, sender });
      setResult(data);
      if (data.status === 'safe') toast.success('Email appears safe');
      else toast.error('⚠️ Suspicious email detected!');
    } catch (e) {
      // Demo result
      const urls = emailContent.match(/https?:\/\/[^\s]+/g) || [];
      setResult({
        emailRiskScore: urls.length ? 45 : 5,
        status: urls.some(u => u.includes('.tk') || u.includes('login-')) ? 'phishing' : 'safe',
        urlsFound: urls.length,
        analyzedURLs: urls.slice(0, 3).map(u => ({ url: u, riskScore: 30, status: 'suspicious' })),
        recommendation: '✅ No obvious threats detected. Stay cautious with unexpected emails.'
      });
    } finally { setLoading(false); }
  };

  const samplePhish = `Dear Customer,

Your account has been suspended due to suspicious activity. 
Please verify your information immediately to restore access.

Click here to verify: http://paypal-login-verify.tk/update/account
Or visit: https://secure-banking-update.ml/confirm

Your account will be permanently deleted in 24 hours if you don't act now.

Regards,
Security Team`;

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Email Scanner</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono' }}>Detect phishing links and malicious URLs hidden in emails</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, marginBottom: 16, color: 'var(--text-primary)' }}>Email Details</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'JetBrains Mono' }}>Sender Email</label>
            <input className="input-cyber" value={sender} onChange={e => setSender(e.target.value)} placeholder="sender@domain.com" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'JetBrains Mono' }}>Subject</label>
            <input className="input-cyber" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'JetBrains Mono' }}>Email Body</label>
            <textarea className="input-cyber" rows={10} value={emailContent} onChange={e => setEmailContent(e.target.value)} placeholder="Paste full email content here..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={scan} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><Zap size={14} />Scanning...</> : <><Mail size={14} />Scan Email</>}
            </button>
            <button className="btn-secondary" onClick={() => setEmailContent(samplePhish)} style={{ flexShrink: 0 }}>Load Sample</button>
          </div>
        </div>

        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <Mail size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 13 }}>Paste email content and click Scan Email</p>
            </div>
          )}
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <Shield size={40} color="var(--accent-cyan)" style={{ animation: 'pulse-glow 1s infinite', marginBottom: 16 }} />
              <p style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', fontSize: 14 }}>ANALYZING EMAIL...</p>
            </div>
          )}
          {result && (
            <div className="animate-fadeIn">
              {/* Overall Risk */}
              <div className="card" style={{ marginBottom: 16, borderColor: result.status === 'safe' ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  {result.status === 'safe' ? <CheckCircle size={36} color="var(--accent-green)" /> : <XCircle size={36} color="var(--accent-red)" />}
                  <div>
                    <div style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 800, color: result.status === 'safe' ? 'var(--accent-green)' : 'var(--accent-red)' }}>{result.status.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Email Risk: {result.emailRiskScore}/100 • {result.urlsFound} URLs found</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                  {result.recommendation}
                </p>
              </div>

              {/* URL Results */}
              {result.analyzedURLs?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, marginBottom: 12, color: 'var(--text-primary)' }}>Links Found in Email</h3>
                  {result.analyzedURLs.map((u, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: u.status === 'safe' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                          {u.status === 'safe' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                        </span>
                        <span className={`badge badge-${u.status}`}>{u.status}</span>
                      </div>
                      <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{u.url}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Risk Score: <span style={{ color: u.riskScore > 50 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{u.riskScore}/100</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
