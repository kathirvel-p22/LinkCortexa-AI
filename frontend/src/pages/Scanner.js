import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const RiskMeter = ({ score }) => {
  const color = score >= 70 ? '#ff3366' : score >= 40 ? '#ffaa00' : '#00ff88';
  const label = score >= 70 ? 'DANGEROUS' : score >= 40 ? 'SUSPICIOUS' : 'SAFE';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
        <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{transition:'stroke-dashoffset 1s cubic-bezier(.17,.67,.24,1)'}}
        />
        <text x="70" y="65" textAnchor="middle" fill={color} fontSize="30" fontWeight="800" fontFamily="Syne">{score}</text>
        <text x="70" y="85" textAnchor="middle" fill="rgba(226,234,248,0.5)" fontSize="11" fontFamily="Space Mono">/100</text>
      </svg>
      <div style={{
        padding:'5px 16px',borderRadius:20,fontSize:12,fontWeight:700,fontFamily:'var(--font-mono)',letterSpacing:1,
        background: score >= 70 ? 'var(--red-dim)' : score >= 40 ? 'var(--yellow-dim)' : 'var(--green-dim)',
        color,border:`1px solid ${color}40`
      }}>{label}</div>
    </div>
  );
};

const APIResultCard = ({ name, result, icon }) => {
  if (!result) return null;
  const isAvail = result.available !== false;
  return (
    <div style={{
      padding:'14px 16px',borderRadius:10,border:'1px solid var(--border)',
      background:'rgba(255,255,255,0.02)',display:'flex',alignItems:'center',gap:14
    }}>
      <div style={{fontSize:22,flexShrink:0}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{name}</div>
        {!isAvail ? (
          <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>
            {result.message || 'Configure API key in .env'}
          </div>
        ) : (
          <div style={{fontSize:12,color:'var(--text-secondary)',fontFamily:'var(--font-mono)'}}>
            {name === 'VirusTotal' && `${result.malicious || 0} malicious / ${result.total || 0} engines`}
            {name === 'AbuseIPDB' && `Abuse score: ${result.abuseScore}% | Reports: ${result.totalReports}`}
            {name === 'Google Safe Browsing' && (result.isThreat ? `⚠ ${result.threatTypes?.join(', ')}` : '✓ No threats found')}
            {name === 'URLhaus' && (result.isMalicious ? `⚠ Blacklisted: ${result.threat}` : '✓ Not in database')}
            {name === 'IPinfo' && result.country && `${result.city}, ${result.country} | ${result.org}`}
          </div>
        )}
      </div>
      <div style={{
        width:10,height:10,borderRadius:'50%',flexShrink:0,
        background: !isAvail ? 'rgba(255,255,255,0.2)' :
          (result.isThreat || result.isMalicious || result.abuseScore > 50) ? '#ff3366' : '#00ff88'
      }}/>
    </div>
  );
};

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const scan = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await axios.post(`${API}/analyze/url`, { url: url.trim(), source: 'dashboard' });
      setResult(r.data.data);
      setHistory(h => [{ url: url.trim(), status: r.data.data.status, score: r.data.data.riskScore, time: new Date() }, ...h.slice(0,9)]);
    } catch (e) {
      setError(e.response?.data?.message || 'Scan failed. Make sure the backend is running.');
    } finally { setLoading(false); }
  };

  const getStatusStyle = (status) => {
    const map = { safe: 'badge-safe', suspicious: 'badge-suspicious', phishing: 'badge-phishing', malware: 'badge-malware' };
    return map[status] || 'badge-unknown';
  };

  const examples = ['https://google.com', 'https://paypal-secure-login.xyz', 'http://amazon-verify.tk/login'];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <h1 style={{fontSize:26,fontWeight:800,marginBottom:4}}>URL Scanner</h1>
        <p style={{color:'var(--text-dim)',fontFamily:'var(--font-mono)',fontSize:12}}>MULTI-API THREAT ANALYSIS ENGINE</p>
      </div>

      {/* Scanner input */}
      <div className="card" style={{padding:28}}>
        <div style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:10}}>ENTER URL TO ANALYZE</div>
        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <input
            type="text" placeholder="https://example.com or paste any suspicious link..."
            value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && scan()}
            style={{fontFamily:'var(--font-mono)',flex:1}}
          />
          <button onClick={scan} disabled={loading} className="btn-primary" style={{flexShrink:0,minWidth:140,padding:'12px 24px'}}>
            {loading ? '⬡ SCANNING...' : '⬡ SCAN NOW'}
          </button>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <span style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>TRY:</span>
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setUrl(ex)} style={{
              background:'rgba(0,200,255,0.08)',border:'1px solid rgba(0,200,255,0.2)',
              color:'var(--cyan)',padding:'3px 10px',borderRadius:6,cursor:'pointer',
              fontSize:11,fontFamily:'var(--font-mono)'
            }}>{ex.replace('https://','').split('/')[0]}</button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{background:'var(--red-dim)',border:'1px solid rgba(255,51,102,0.3)',color:'var(--red)',padding:'14px 18px',borderRadius:10,fontFamily:'var(--font-mono)',fontSize:13}}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div className="card" style={{padding:40,textAlign:'center'}}>
          <div style={{fontSize:14,color:'var(--cyan)',fontFamily:'var(--font-mono)',marginBottom:16}}>
            ⬡ SCANNING URL ACROSS 6 THREAT INTELLIGENCE DATABASES...
          </div>
          {['Checking VirusTotal (70+ antivirus engines)','Querying AbuseIPDB','Running Google Safe Browsing check','Checking URLhaus malware database','Analyzing with AI/ML engine','Logging to blockchain'].map((step, i) => (
            <div key={i} style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)',marginBottom:6,opacity:0.7}}>{step}</div>
          ))}
        </div>
      )}

      {result && (
        <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:24,animation:'fadeInUp 0.4s ease'}}>
          {/* Left: Risk meter */}
          <div className="card" style={{padding:28,display:'flex',flexDirection:'column',alignItems:'center',gap:20,minWidth:220}}>
            <div style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1}}>RISK SCORE</div>
            <RiskMeter score={result.riskScore} />
            <div style={{textAlign:'center',width:'100%'}}>
              <div style={{fontSize:12,color:'var(--text-dim)',marginBottom:4,fontFamily:'var(--font-mono)'}}>STATUS</div>
              <span className={`badge ${getStatusStyle(result.status)}`} style={{fontSize:13,padding:'6px 16px'}}>
                {result.status?.toUpperCase()}
              </span>
            </div>
            {result.threatTypes?.length > 0 && (
              <div style={{width:'100%'}}>
                <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',marginBottom:8}}>THREAT TYPES</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {result.threatTypes.map((t, i) => (
                    <span key={i} className="badge badge-phishing" style={{fontSize:10}}>{t.replace('_',' ')}</span>
                  ))}
                </div>
              </div>
            )}
            {result.blockchainTxHash && (
              <div style={{width:'100%',padding:'10px',background:'rgba(168,85,247,0.08)',borderRadius:8,border:'1px solid rgba(168,85,247,0.2)'}}>
                <div style={{fontSize:10,color:'var(--purple)',fontFamily:'var(--font-mono)',marginBottom:4}}>⬡ BLOCKCHAIN TX</div>
                <div style={{fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',wordBreak:'break-all'}}>{result.blockchainTxHash.substring(0,20)}...</div>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {/* URL info */}
            <div className="card" style={{padding:20}}>
              <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:12}}>URL DETAILS</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[
                  ['URL', result.url],
                  ['Domain', result.domain],
                  ['IP Address', result.ip || 'Unresolved'],
                  ['Analysis Time', `${result.analysisTime}ms`],
                  ['Country', result.geoLocation?.country || 'Unknown'],
                  ['ISP', result.geoLocation?.isp || 'Unknown']
                ].map(([k, v], i) => (
                  <div key={i}>
                    <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',marginBottom:3}}>{k}</div>
                    <div style={{fontSize:13,color:'var(--text-primary)',wordBreak:'break-all',fontFamily:'var(--font-mono)'}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Results */}
            <div className="card" style={{padding:20}}>
              <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:14}}>THREAT INTELLIGENCE SOURCES</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <APIResultCard name="VirusTotal" result={result.apiResults?.virusTotal} icon="🛡" />
                <APIResultCard name="AbuseIPDB" result={result.apiResults?.abuseIPDB} icon="🌐" />
                <APIResultCard name="Google Safe Browsing" result={result.apiResults?.googleSafeBrowsing} icon="🔍" />
                <APIResultCard name="URLhaus" result={result.apiResults?.urlhaus} icon="⚡" />
                <APIResultCard name="IPinfo" result={result.apiResults?.ipInfo} icon="📍" />
              </div>
            </div>

            {/* ML Prediction */}
            {result.mlPrediction && (
              <div className="card" style={{padding:20}}>
                <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:14}}>AI/ML ANALYSIS</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:24,fontWeight:800,color:'var(--cyan)'}}>{result.mlPrediction.score}</div>
                    <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>ML SCORE</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:700,color:'var(--yellow)',textTransform:'uppercase'}}>{result.mlPrediction.label}</div>
                    <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>PREDICTION</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:24,fontWeight:800,color:'var(--green)'}}>{Math.round((result.mlPrediction.confidence||0.75)*100)}%</div>
                    <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>CONFIDENCE</div>
                  </div>
                </div>
                {result.mlPrediction.features && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {[
                      ['URL Length', result.mlPrediction.features.url_length],
                      ['Has IP', result.mlPrediction.features.has_ip ? 'YES ⚠' : 'No'],
                      ['Suspicious Keywords', result.mlPrediction.features.has_suspicious_keywords ? 'YES ⚠' : 'No'],
                      ['HTTPS', result.mlPrediction.features.has_https ? 'Yes ✓' : 'NO ⚠'],
                      ['Subdomains', result.mlPrediction.features.subdomain_count],
                      ['Suspicious TLD', result.mlPrediction.features.tld_suspicious ? 'YES ⚠' : 'No'],
                    ].map(([k, v], i) => (
                      <div key={i} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'8px 10px'}}>
                        <div style={{fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',marginBottom:2}}>{k}</div>
                        <div style={{fontSize:12,fontFamily:'var(--font-mono)',color: String(v).includes('⚠') ? 'var(--red)' : String(v).includes('✓') ? 'var(--green)' : 'var(--text-primary)'}}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scan history */}
      {history.length > 0 && (
        <div className="card" style={{padding:20}}>
          <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:14}}>RECENT SCANS (THIS SESSION)</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {history.map((h, i) => (
              <div key={i} onClick={() => setUrl(h.url)} style={{
                display:'flex',alignItems:'center',gap:14,padding:'10px 14px',
                borderRadius:8,background:'rgba(255,255,255,0.02)',cursor:'pointer',
                border:'1px solid var(--border)',transition:'all 0.2s'
              }}>
                <span className={`badge ${getStatusStyle(h.status)}`}>{h.status}</span>
                <span style={{flex:1,fontSize:13,fontFamily:'var(--font-mono)',color:'var(--text-secondary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.url}</span>
                <span style={{fontSize:13,fontWeight:700,color: h.score >= 70 ? 'var(--red)' : h.score >= 40 ? 'var(--yellow)' : 'var(--green)'}}>{h.score}</span>
                <span style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',flexShrink:0}}>{h.time.toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
