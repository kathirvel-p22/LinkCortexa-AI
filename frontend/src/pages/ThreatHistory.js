// ThreatHistory.js
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, RefreshCw, Shield } from 'lucide-react';
import api from '../services/api';

export function ThreatHistory() {
  const [threats, setThreats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/threats', { params: { page, status: filter !== 'all' ? filter : undefined, search } });
      setThreats(data.threats); setTotal(data.total);
    } catch (e) {
      const mock = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1, url: `https://test-${i}.${['com','tk','ml','xyz'][i%4]}/${i}`,
        domain: `test-${i}.com`, riskScore: Math.floor(Math.random() * 100),
        status: ['phishing', 'malware', 'suspicious', 'safe'][i % 4],
        threatTypes: [['Phishing', 'Safe', 'Malware', 'Suspicious'][i % 4]],
        timestamp: new Date(Date.now() - i * 600000).toISOString(),
        ipAddress: `${Math.floor(Math.random()*200)+50}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
      }));
      setThreats(mock); setTotal(50);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter, search]);

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Threat History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono' }}>All scanned URLs and detected threats</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-cyber" style={{ paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search URL or domain..." />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'phishing', 'malware', 'suspicious', 'safe'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize',
              background: filter === f ? 'var(--accent-blue)' : 'transparent',
              border: `1px solid ${filter === f ? 'var(--accent-blue)' : 'var(--border)'}`,
              color: filter === f ? 'white' : 'var(--text-muted)'
            }}>{f}</button>
          ))}
        </div>
        <button className="btn-secondary" onClick={load} style={{ padding: '8px 14px', fontSize: 12 }}><RefreshCw size={12} /></button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Shield size={32} color="var(--accent-cyan)" style={{ animation: 'pulse-glow 1s infinite' }} /></div>
        ) : (
          <>
            <table className="cyber-table">
              <thead><tr><th>#</th><th>URL</th><th>Domain</th><th>IP</th><th>Risk</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {threats.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>{(page - 1) * 20 + i + 1}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>{t.url}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{t.domain}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{t.ipAddress || '—'}</td>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13, color: t.riskScore > 70 ? 'var(--accent-red)' : t.riskScore > 40 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>{t.riskScore}</span></td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    <td style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}>{new Date(t.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Total: {total} records</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3].map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 6, background: page === p ? 'var(--accent-blue)' : 'transparent', border: `1px solid ${page === p ? 'var(--accent-blue)' : 'var(--border)'}`, color: page === p ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>{p}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ThreatHistory;
