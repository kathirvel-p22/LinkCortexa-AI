import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function Threats() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchThreats = async () => {
    try {
      const params = { page, limit: 20 };
      if (filter !== 'all') params.status = filter;
      const r = await axios.get(`${API}/analyze/history`, { params });
      setThreats(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch {
      // Mock data
      const mock = Array.from({length:20}, (_, i) => ({
        id: String(i), url: `https://example-${i}.xyz/login`,
        domain: `example-${i}.xyz`, ip: `185.${i}.${i}.${i}`,
        riskScore: Math.floor(Math.random()*100),
        status: ['phishing','suspicious','safe','malware'][i%4],
        threatTypes: i%3===0 ? ['phishing'] : [],
        blockchainLogged: true,
        geoLocation: { country: ['IN','CN','RU','US'][i%4], city: 'Unknown' },
        createdAt: new Date(Date.now() - i*3600000)
      }));
      setThreats(mock);
      setTotal(mock.length);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchThreats(); }, [filter, page]);

  const filtered = search ? threats.filter(t => t.url?.includes(search) || t.domain?.includes(search)) : threats;

  const statusColor = { safe:'var(--green)',suspicious:'var(--yellow)',phishing:'var(--red)',malware:'var(--purple)',unknown:'var(--text-dim)' };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <h1 style={{fontSize:26,fontWeight:800,marginBottom:4}}>Threat Database</h1>
        <p style={{color:'var(--text-dim)',fontFamily:'var(--font-mono)',fontSize:12}}>ALL DETECTED THREATS · {total} RECORDS</p>
      </div>

      {/* Filters */}
      <div className="card" style={{padding:'16px 20px',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <input type="text" placeholder="Search URLs or domains..." value={search} onChange={e => setSearch(e.target.value)} style={{flex:1,minWidth:200}} />
        <div style={{display:'flex',gap:6}}>
          {['all','phishing','suspicious','malware','safe'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{
              padding:'7px 14px',borderRadius:8,border:'1px solid',cursor:'pointer',
              fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,
              background: filter===f ? statusColor[f]||'var(--cyan)' : 'transparent',
              color: filter===f ? '#060910' : statusColor[f]||'var(--text-secondary)',
              borderColor: statusColor[f]||'var(--border)'
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Status','URL / Domain','IP Address','Risk Score','Threat Types','Country','Blockchain','Time'].map(h => (
                  <th key={h} style={{padding:'14px 16px',textAlign:'left',fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)',fontWeight:700,letterSpacing:1,whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{padding:40,textAlign:'center',color:'var(--cyan)',fontFamily:'var(--font-mono)'}}>⬡ LOADING...</td></tr>
              ) : filtered.map((t, i) => (
                <tr key={t.id||i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.15s'}}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px'}}>
                    <span className={`badge badge-${t.status||'unknown'}`}>{t.status||'?'}</span>
                  </td>
                  <td style={{padding:'12px 16px',maxWidth:250}}>
                    <div style={{fontSize:13,fontFamily:'var(--font-mono)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-primary)'}} title={t.url}>{t.url}</div>
                    <div style={{fontSize:11,color:'var(--text-dim)'}}>{t.domain}</div>
                  </td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-secondary)'}}>{t.ip||'-'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{flex:1,minWidth:60}}>
                        <div className="risk-bar">
                          <div className="risk-fill" style={{
                            width:`${t.riskScore}%`,
                            background: t.riskScore>=70 ? 'linear-gradient(90deg,#ff3366,#ff0044)' :
                              t.riskScore>=40 ? 'linear-gradient(90deg,#ffaa00,#ff6600)' :
                              'linear-gradient(90deg,#00ff88,#00cc66)'
                          }}/>
                        </div>
                      </div>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:700,color:statusColor[t.status||'unknown'],minWidth:30}}>{t.riskScore}</span>
                    </div>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {(t.threatTypes||[]).map((type, j) => (
                        <span key={j} style={{fontSize:10,padding:'2px 7px',borderRadius:4,background:'rgba(255,51,102,0.1)',color:'var(--red)',border:'1px solid rgba(255,51,102,0.2)',fontFamily:'var(--font-mono)'}}>{type}</span>
                      ))}
                      {(!t.threatTypes||t.threatTypes.length===0) && <span style={{fontSize:12,color:'var(--text-dim)'}}>—</span>}
                    </div>
                  </td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-secondary)'}}>{t.geoLocation?.country||'—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    {t.blockchainLogged ? (
                      <span style={{fontSize:11,color:'var(--purple)',fontFamily:'var(--font-mono)'}}>⬡ LOGGED</span>
                    ) : (
                      <span style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>—</span>
                    )}
                  </td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-dim)',whiteSpace:'nowrap'}}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{padding:'16px 20px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>Showing {filtered.length} of {total} records</span>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-ghost" style={{padding:'6px 14px',fontSize:12}}>← Prev</button>
            <span style={{padding:'6px 14px',fontFamily:'var(--font-mono)',fontSize:13,color:'var(--cyan)'}}>Page {page}</span>
            <button onClick={() => setPage(p => p+1)} disabled={filtered.length < 20} className="btn-ghost" style={{padding:'6px 14px',fontSize:12}}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
