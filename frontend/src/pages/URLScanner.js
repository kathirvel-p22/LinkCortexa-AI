import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Globe, Cpu, Database, Zap, Link2, Copy, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const RiskMeter = ({ score }) => {
  const color = score >= 70 ? 'var(--accent-red)' : score >= 40 ? 'var(--accent-orange)' : 'var(--accent-green)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Risk Score</span>
        <span style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'Orbitron' }}>{score}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/100</span></span>
      </div>
      <div className="risk-meter" style={{ height: 12 }}>
        <div className="risk-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, var(--accent-green), ${color})` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>SAFE</span>
        <span style={{ fontSize: 10, color: 'var(--accent-orange)', fontFamily: 'JetBrains Mono' }}>SUSPICIOUS</span>
        <span style={{ fontSize: 10, color: 'var(--accent-red)', fontFamily: 'JetBrains Mono' }}>DANGER</span>
      </div>
    </div>
  );
};

const SourceCheck = ({ name, result, icon: Icon }) => {
  if (!result) return null;
  const isClean = !result.detected && !result.isPhishing && !result.isMalicious && !result.isListed && (result.abuseScore || 0) < 50;
  const color = isClean ? 'var(--accent-green)' : 'var(--accent-red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{name}</span>
        {result.simulated && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>(demo)</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {result.positives !== undefined && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{result.positives}/{result.total}</span>}
        {result.abuseScore !== undefined && <span style={{ fontSize: 11, color, fontFamily: 'JetBrains Mono' }}>{result.abuseScore}%</span>}
        {isClean ? <CheckCircle size={16} color="var(--accent-green)" /> : <XCircle size={16} color="var(--accent-red)" />}
      </div>
    </div>
  );
};

export default function URLScanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkResults, setBulkResults] = useState(null);

  const analyze = async () => {
    if (!url.trim()) return toast.error('Enter a URL to scan');
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/analyze', { url: url.trim() });
      setResult(data);
      if (data.status === 'safe') toast.success('URL is safe!');
      else if (data.status === 'phishing') toast.error('⚠️ Phishing detected!');
      else if (data.status === 'malware') toast.error('🚨 Malware detected!');
      else toast('⚠️ Suspicious URL', { icon: '⚠️' });
    } catch (e) {
      toast.error('Analysis failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const analyzeBulk = async () => {
    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(Boolean);
    if (!urls.length) return toast.error('Enter URLs (one per line)');
    setLoading(true);
    try {
      const { data } = await api.post('/analyze/bulk', { urls });
      setBulkResults(data.results);
      toast.success(`Analyzed ${urls.length} URLs`);
    } catch (e) {
      toast.error('Bulk analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    safe: { color: 'var(--accent-green)', bg: 'rgba(0,255,136,0.1)', icon: CheckCircle, text: 'SAFE' },
    suspicious: { color: 'var(--accent-orange)', bg: 'rgba(255,136,0,0.1)', icon: AlertTriangle, text: 'SUSPICIOUS' },
    phishing: { color: 'var(--accent-red)', bg: 'rgba(255,68,68,0.1)', icon: XCircle, text: 'PHISHING' },
    malware: { color: '#ff0066', bg: 'rgba(255,0,102,0.1)', icon: XCircle, text: 'MALWARE' },
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>URL Scanner</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono' }}>
          AI-powered analysis using 6 threat intelligence sources
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['Single URL', false], ['Bulk Scan (up to 10)', true]].map(([label, mode]) => (
          <button key={label} onClick={() => setBulkMode(mode)} style={{
            padding: '8px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500,
            background: bulkMode === mode ? 'var(--accent-blue)' : 'transparent',
            border: `1px solid ${bulkMode === mode ? 'var(--accent-blue)' : 'var(--border)'}`,
            color: bulkMode === mode ? 'white' : 'var(--text-secondary)'
          }}>{label}</button>
        ))}
      </div>

      {/* Input */}
      <div className="card" style={{ marginBottom: 24 }}>
        {!bulkMode ? (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Link2 size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-cyber" style={{ paddingLeft: 42, fontSize: 15 }} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com — paste any URL to scan" onKeyDown={e => e.key === 'Enter' && analyze()} />
              </div>
              <button className="btn-primary" onClick={analyze} disabled={loading} style={{ flexShrink: 0, padding: '0 28px' }}>
                {loading ? <><Zap size={16} />Scanning...</> : <><Search size={16} />Analyze</>}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['https://google.com', 'http://paypal-login-verify.tk/update', 'https://github.com'].map(u => (
                <button key={u} onClick={() => setUrl(u)} style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'rgba(0,212,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{u.slice(0, 35)}...</button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <textarea className="input-cyber" rows={6} value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} placeholder="Paste URLs here, one per line:&#10;https://example1.com&#10;https://example2.com&#10;http://suspicious-site.tk" style={{ resize: 'vertical' }} />
            <button className="btn-primary" onClick={analyzeBulk} disabled={loading} style={{ marginTop: 12 }}>
              {loading ? 'Scanning...' : <><Search size={16} />Bulk Analyze</>}
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ marginBottom: 16 }}>
            <Shield size={48} color="var(--accent-cyan)" style={{ animation: 'pulse-glow 1s infinite' }} />
          </div>
          <p style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', fontSize: 14 }}>SCANNING URL</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8, fontFamily: 'JetBrains Mono' }}>
            Querying VirusTotal • PhishTank • Google Safe Browsing • AbuseIPDB • URLhaus • AI Engine
          </p>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 16 }}>
            {[0,1,2,3,4].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', animation: `blink 1s ${i * 0.2}s infinite` }} />)}
          </div>
        </div>
      )}

      {/* Single Result */}
      {result && !loading && (() => {
        const cfg = statusConfig[result.status] || statusConfig.suspicious;
        const StatusIcon = cfg.icon;
        return (
          <div className="animate-fadeIn">
            {/* Status Banner */}
            <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, borderRadius: 12, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <StatusIcon size={40} color={cfg.color} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Orbitron', fontSize: 22, fontWeight: 800, color: cfg.color }}>{cfg.text}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, wordBreak: 'break-all' }}>{result.url}</div>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast.success('Report copied!'); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', padding: 8 }}>
                <Copy size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Risk & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <RiskMeter score={result.riskScore} />
                  <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(result.threatTypes || []).map(t => (
                      <span key={t} className={`badge badge-${t === 'Clean' ? 'safe' : 'phishing'}`}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontFamily: 'Orbitron' }}>URL Details</h3>
                  {[
                    ['Domain', result.domain],
                    ['IP Address', result.ipAddress || 'Not resolved'],
                    ['ML Score', `${result.mlScore || 0}/100`],
                    ['HTTPS', result.mlFeatures?.hasHTTPS ? '✅ Yes' : '❌ No'],
                    ['Subdomains', result.mlFeatures?.numSubdomains || 0],
                    ['Timestamp', new Date(result.timestamp).toLocaleTimeString()]
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sources & Explanation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'Orbitron' }}>Intelligence Sources</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 12 }}>6 sources checked simultaneously</p>
                  <SourceCheck name="VirusTotal (70+ engines)" result={result.sources?.virustotal} icon={Database} />
                  <SourceCheck name="PhishTank Database" result={result.sources?.phishTank} icon={Shield} />
                  <SourceCheck name="Google Safe Browsing" result={result.sources?.googleSafeBrowsing} icon={Globe} />
                  <SourceCheck name="AbuseIPDB" result={result.sources?.abuseIPDB} icon={AlertTriangle} />
                  <SourceCheck name="URLhaus (Malware DB)" result={result.sources?.urlhaus} icon={Zap} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI/ML Engine</span>
                    <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>Score: {result.mlScore || 0}/100</span>
                  </div>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontFamily: 'Orbitron' }}>AI Explanation</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.explanation}</p>
                  {result.ipInfo && (
                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,212,255,0.05)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: 6 }}>IP GEOLOCATION</p>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.ipInfo.city}, {result.ipInfo.country} • {result.ipInfo.org}</p>
                    </div>
                  )}
                  {result.blockchainLog && (
                    <div style={{ marginTop: 12, padding: 12, background: 'rgba(124,58,237,0.08)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.3)' }}>
                      <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#7c3aed', marginBottom: 4 }}>🔗 BLOCKCHAIN LOG</p>
                      <p style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', wordBreak: 'break-all' }}>Block #{result.blockchainLog.blockIndex} • {result.blockchainLog.txHash?.slice(0, 40)}...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bulk Results */}
      {bulkResults && !loading && (
        <div className="card animate-fadeIn">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, marginBottom: 16 }}>Bulk Scan Results</h3>
          <table className="cyber-table">
            <thead><tr><th>URL</th><th>Risk Score</th><th>Status</th><th>Threats</th></tr></thead>
            <tbody>
              {bulkResults.map((r, i) => (
                <tr key={i}>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{r.url}</td>
                  <td><span style={{ color: r.riskScore > 70 ? 'var(--accent-red)' : r.riskScore > 40 ? 'var(--accent-orange)' : 'var(--accent-green)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{r.riskScore || 0}</span></td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td style={{ fontSize: 12 }}>{(r.threatTypes || []).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
