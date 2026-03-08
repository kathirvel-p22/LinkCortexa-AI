import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function BlockchainLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyHash, setVerifyHash] = useState('');

  useEffect(() => {
    axios.get(`${API}/blockchain/logs`)
      .then(r => setLogs(r.data.data || []))
      .catch(() => {
        // Mock blockchain logs
        const mock = Array.from({length:20}, (_, i) => ({
          blockNumber: 1000 + i,
          txHash: '0x' + Array.from({length:64}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join(''),
          dataHash: Array.from({length:64}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join(''),
          data: { url: `https://threat-${i}.xyz`, status: ['phishing','safe','suspicious'][i%3], riskScore: Math.floor(Math.random()*100) },
          timestamp: Date.now() - i*60000,
          previousHash: i > 0 ? '0x' + Array.from({length:64}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join('') : '0x0'
        }));
        setLogs(mock);
      })
      .finally(() => setLoading(false));
  }, []);

  const verify = async () => {
    if (!verifyHash) return;
    setVerifying(verifyHash); setVerifyResult(null);
    try {
      const r = await axios.get(`${API}/blockchain/verify/${verifyHash}`);
      setVerifyResult(r.data.data);
    } catch {
      setVerifyResult({ valid: false, message: 'Transaction not found' });
    } finally { setVerifying(''); }
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:4}}>Blockchain Security Logs</h1>
        <p style={{color:'var(--text-dim)',fontFamily:'var(--font-mono)',fontSize:13}}>TAMPER-PROOF CRYPTOGRAPHIC AUDIT TRAIL</p>
      </div>

      {/* How it works */}
      <div style={{
        background:'linear-gradient(135deg,rgba(168,85,247,0.08),rgba(0,85,255,0.08))',
        border:'1px solid rgba(168,85,247,0.2)',borderRadius:12,padding:'20px 24px'
      }}>
        <div style={{fontWeight:700,fontSize:16,marginBottom:12,color:'var(--purple)'}}>⬡ How Blockchain Logging Works</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
          {[
            ['1. Detect','Threat URL is detected by extension or scanner'],
            ['2. Hash','Threat data is SHA-256 hashed for integrity'],
            ['3. Log','Hash + metadata logged to Ethereum Sepolia testnet'],
            ['4. Verify','Anyone can verify logs using transaction hash']
          ].map(([step, desc]) => (
            <div key={step} style={{textAlign:'center'}}>
              <div style={{fontSize:15,fontWeight:800,color:'var(--purple)',marginBottom:6,fontFamily:'var(--font-mono)'}}>{step}</div>
              <div style={{fontSize:13,color:'var(--text-secondary)'}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Verify */}
      <div className="card" style={{padding:24}}>
        <div style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:12}}>VERIFY TRANSACTION</div>
        <div style={{display:'flex',gap:12}}>
          <input type="text" placeholder="Enter transaction hash (0x...)" value={verifyHash} onChange={e => setVerifyHash(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verify()} style={{fontFamily:'var(--font-mono)',flex:1}} />
          <button onClick={verify} disabled={!!verifying} className="btn-primary" style={{flexShrink:0}}>
            {verifying ? 'VERIFYING...' : 'VERIFY'}
          </button>
        </div>
        {verifyResult && (
          <div style={{
            marginTop:16,padding:'14px 18px',borderRadius:10,
            background: verifyResult.valid ? 'var(--green-dim)' : 'var(--red-dim)',
            border: `1px solid ${verifyResult.valid ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)'}`,
            color: verifyResult.valid ? 'var(--green)' : 'var(--red)',
            fontFamily:'var(--font-mono)',fontSize:14
          }}>
            {verifyResult.valid ? '✓ VALID — Log integrity confirmed. Data has not been tampered.' : `⚠ ${verifyResult.message || 'Invalid or tampered log'}`}
            {verifyResult.blockNumber && <div style={{marginTop:6,color:'rgba(0,255,136,0.6)',fontSize:13}}>Block #{verifyResult.blockNumber} | Hash: {verifyResult.dataHash?.substring(0,20)}...</div>}
          </div>
        )}
      </div>

      {/* Chain visualization */}
      {!loading && logs.length > 0 && (
        <div className="card" style={{padding:24}}>
          <div style={{fontSize:12,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:1,marginBottom:20}}>BLOCKCHAIN CHAIN · {logs.length} BLOCKS</div>
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {logs.slice(0,10).map((log, i) => (
              <div key={i}>
                <div style={{
                  display:'grid',gridTemplateColumns:'auto 1fr auto',gap:16,alignItems:'center',
                  padding:'16px',borderRadius:10,background:'rgba(255,255,255,0.02)',
                  border:'1px solid var(--border)',transition:'border-color 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(168,85,247,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
                >
                  {/* Block number */}
                  <div style={{
                    width:50,height:50,borderRadius:10,flexShrink:0,
                    background:'rgba(168,85,247,0.1)',border:'1px solid rgba(168,85,247,0.2)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontFamily:'var(--font-mono)',fontSize:12,color:'var(--purple)',fontWeight:700
                  }}>#{log.blockNumber}</div>

                  {/* Data */}
                  <div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--cyan)',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      TX: {log.txHash}
                    </div>
                    <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:3}}>
                      {log.data?.url || 'Unknown URL'} · Score: {log.data?.riskScore || 0}
                    </div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-dim)'}}>
                      Hash: {log.dataHash?.substring(0,32)}...
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <span className={`badge badge-${log.data?.status||'unknown'}`} style={{marginBottom:6,display:'block',textAlign:'center'}}>{log.data?.status||'?'}</span>
                    <div style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                {i < 9 && (
                  <div style={{display:'flex',justifyContent:'center',padding:'4px 0'}}>
                    <div style={{width:2,height:16,background:'linear-gradient(to bottom,rgba(168,85,247,0.5),rgba(168,85,247,0.1))'}} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {logs.length > 10 && (
            <div style={{textAlign:'center',marginTop:16,color:'var(--text-dim)',fontFamily:'var(--font-mono)',fontSize:13}}>
              + {logs.length - 10} more blocks
            </div>
          )}
        </div>
      )}
    </div>
  );
}
