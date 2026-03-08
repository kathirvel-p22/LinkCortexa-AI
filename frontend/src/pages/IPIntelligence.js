import React, { useState } from 'react';
import { Globe, Search, AlertTriangle, CheckCircle, MapPin, Cpu, Zap } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function IPIntelligence() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulkIPs, setBulkIPs] = useState('');
  const [bulkResults, setBulkResults] = useState(null);

  const lookup = async () => {
    if (!ip.trim()) return toast.error('Enter an IP address');
    setLoading(true); setResult(null);
    try {
      const { data } = await api.get(`/ip/lookup/${ip.trim()}`);
      setResult(data);
    } catch (e) {
      // Demo result
      setResult({
        ip, 
        abuse: { abuseScore: Math.floor(Math.random() * 80), country: 'CN', isp: 'China Telecom', usageType: 'Data Center/Web Hosting/Transit', reports: Math.floor(Math.random() * 200) },
        info: { country: 'CN', city: 'Beijing', org: 'AS4134 CHINANET-BACKBONE', timezone: 'Asia/Shanghai', lat: 39.9042, lon: 116.4074 }
      });
    } finally { setLoading(false); }
  };

  const bulkCheck = async () => {
    const ips = bulkIPs.split('\n').map(i => i.trim()).filter(Boolean).slice(0, 5);
    if (!ips.length) return toast.error('Enter IPs');
    setLoading(true);
    try {
      const { data } = await api.post('/ip/bulk-check', { ips });
      setBulkResults(data.results);
      toast.success(`Checked ${ips.length} IPs`);
    } catch (e) {
      toast.error('Bulk check failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>IP Intelligence</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono' }}>Geolocation • Abuse scoring • ISP identification • AbuseIPDB + IPinfo</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Single Lookup */}
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, marginBottom: 16, color: 'var(--text-primary)' }}>Single IP Lookup</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input className="input-cyber" value={ip} onChange={e => setIp(e.target.value)} placeholder="e.g. 8.8.8.8 or 185.220.101.1" onKeyDown={e => e.key === 'Enter' && lookup()} />
            <button className="btn-primary" onClick={lookup} disabled={loading} style={{ flexShrink: 0, padding: '0 16px' }}>
              {loading ? <Zap size={14} /> : <Search size={14} />}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['8.8.8.8', '1.1.1.1', '185.220.101.1', '45.142.212.100'].map(testIP => (
              <button key={testIP} onClick={() => setIp(testIP)} style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'rgba(0,212,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{testIP}</button>
            ))}
          </div>
        </div>

        {/* Bulk */}
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, marginBottom: 16, color: 'var(--text-primary)' }}>Bulk IP Check (max 5)</h3>
          <textarea className="input-cyber" rows={3} value={bulkIPs} onChange={e => setBulkIPs(e.target.value)} placeholder="One IP per line&#10;185.220.101.1&#10;45.142.212.100" style={{ resize: 'none', marginBottom: 10 }} />
          <button className="btn-primary" onClick={bulkCheck} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}><Globe size={14} />Check All IPs</button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, marginBottom: 16, color: 'var(--text-primary)' }}>Abuse Intelligence</h3>
            {result.abuse && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 56, fontWeight: 900, fontFamily: 'Orbitron', color: result.abuse.abuseScore > 50 ? 'var(--accent-red)' : result.abuse.abuseScore > 20 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                    {result.abuse.abuseScore}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Abuse Confidence Score /100</div>
                </div>
                <div className="risk-meter" style={{ marginBottom: 16 }}>
                  <div className="risk-fill" style={{ width: `${result.abuse.abuseScore}%`, background: result.abuse.abuseScore > 50 ? 'var(--accent-red)' : 'var(--accent-orange)' }} />
                </div>
                {[
                  ['Country', result.abuse.country],
                  ['ISP', result.abuse.isp],
                  ['Usage Type', result.abuse.usageType],
                  ['Total Reports', result.abuse.reports]
                ].map(([k, v]) => v && (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="card">
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, marginBottom: 16, color: 'var(--text-primary)' }}>Geolocation Data</h3>
            {result.info && (
              <>
                <div style={{ padding: '20px', background: 'rgba(0,212,255,0.05)', borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center', marginBottom: 16 }}>
                  <MapPin size={32} color="var(--accent-cyan)" style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{result.info.city}, {result.info.country}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>{result.info.org}</p>
                </div>
                {[
                  ['Timezone', result.info.timezone],
                  ['Latitude', result.info.lat],
                  ['Longitude', result.info.lon],
                  ['Organization', result.info.org]
                ].map(([k, v]) => v && (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {bulkResults && (
        <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, marginBottom: 16 }}>Bulk Results</h3>
          <table className="cyber-table">
            <thead><tr><th>IP Address</th><th>Abuse Score</th><th>Country</th><th>ISP</th><th>Status</th></tr></thead>
            <tbody>
              {bulkResults.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>{r.ip}</td>
                  <td><span style={{ color: (r.data?.abuseScore || 0) > 50 ? 'var(--accent-red)' : 'var(--accent-green)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{r.data?.abuseScore || 'N/A'}</span></td>
                  <td>{r.data?.country || '—'}</td>
                  <td style={{ fontSize: 12, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.data?.isp || '—'}</td>
                  <td><span className={`badge badge-${(r.data?.abuseScore || 0) > 50 ? 'phishing' : 'safe'}`}>{(r.data?.abuseScore || 0) > 50 ? 'HIGH RISK' : 'LOW RISK'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
