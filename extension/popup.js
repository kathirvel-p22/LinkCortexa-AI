document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('content');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Get cached result
    const stored = await chrome.storage.local.get(`scan_${tab.id}`);
    const result = stored[`scan_${tab.id}`];
    
    if (result) {
      renderResult(result);
    } else {
      // Trigger scan
      try {
        const response = await fetch('http://localhost:5000/api/analyze/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: tab.url, source: 'extension' })
        });
        const data = await response.json();
        if (data.success) renderResult(data.data);
        else renderError('Backend not running');
      } catch {
        renderError('LinkCortexa backend not running.\nStart with: npm start in backend/');
      }
    }
  } catch (e) {
    renderError('Extension error: ' + e.message);
  }
});

function getColor(score) {
  return score >= 70 ? '#ff3366' : score >= 40 ? '#ffaa00' : '#00ff88';
}
function getStatus(status) {
  const m = {safe:'safe',suspicious:'suspicious',phishing:'phishing',malware:'phishing',unknown:'unknown'};
  return m[status] || 'unknown';
}

function renderResult(r) {
  const score = r.riskScore || 0;
  const color = getColor(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  document.getElementById('content').innerHTML = `
    <div class="status-section">
      <div class="risk-circle">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="${color}" stroke-width="8"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" transform="rotate(-90 50 50)"/>
        </svg>
        <div class="score-text" style="color:${color}">${score}</div>
        <div class="score-sub">/100</div>
      </div>
      <div style="margin-top:8px">
        <span class="status-badge ${getStatus(r.status)}">${(r.status||'unknown').toUpperCase()}</span>
      </div>
      ${r.threatTypes?.length ? `<div style="margin-top:10px;display:flex;gap:5px;justify-content:center;flex-wrap:wrap">${r.threatTypes.map(t=>`<span style="background:rgba(255,51,102,0.1);border:1px solid rgba(255,51,102,0.25);color:#ff3366;padding:2px 8px;border-radius:10px;font-size:10px;font-family:monospace">${t.replace('_',' ')}</span>`).join('')}</div>` : ''}
    </div>
    <div class="info-section">
      <div class="info-row"><span class="info-key">DOMAIN</span><span class="info-val">${r.domain||'—'}</span></div>
      <div class="info-row"><span class="info-key">IP ADDRESS</span><span class="info-val">${r.ip||'Unresolved'}</span></div>
      <div class="info-row"><span class="info-key">COUNTRY</span><span class="info-val">${r.geoLocation?.country||'Unknown'}</span></div>
      <div class="info-row"><span class="info-key">ML SCORE</span><span class="info-val" style="color:${color}">${r.mlPrediction?.score||score}/100</span></div>
      <div class="info-row"><span class="info-key">SCAN TIME</span><span class="info-val">${r.analysisTime||0}ms</span></div>
    </div>
    <div class="api-section">
      <div class="section-title">THREAT INTELLIGENCE APIS</div>
      ${renderAPIs(r.apiResults)}
    </div>
    <div class="actions">
      <button class="btn btn-primary" onclick="window.open('http://localhost:3000/scanner','_blank')">⬡ Full Analysis</button>
      <button class="btn btn-secondary" onclick="rescan()">↻ Rescan</button>
    </div>
    <div class="blockchain">
      ${r.blockchainLogged ? `⬡ Logged to blockchain · ${(r.blockchainTxHash||'').substring(0,16)}...` : '⬡ Blockchain logging pending...'}
    </div>
  `;
}

function renderAPIs(apis) {
  if (!apis) return '<div style="color:rgba(226,234,248,0.4);font-size:11px;font-family:monospace">No API results available</div>';
  const items = [
    ['VirusTotal', apis.virusTotal, apis.virusTotal?.malicious > 0],
    ['AbuseIPDB', apis.abuseIPDB, apis.abuseIPDB?.abuseScore > 50],
    ['Google Safe Browsing', apis.googleSafeBrowsing, apis.googleSafeBrowsing?.isThreat],
    ['URLhaus', apis.urlhaus, apis.urlhaus?.isMalicious],
    ['IPinfo', apis.ipInfo, false]
  ];
  return items.map(([name, data, isThreat]) => `
    <div class="api-row">
      <span class="api-name">${name}</span>
      <div class="api-dot" style="background:${!data?.available ? '#555' : isThreat ? '#ff3366' : '#00ff88'}"></div>
    </div>
  `).join('');
}

function renderError(msg) {
  document.getElementById('content').innerHTML = `
    <div style="padding:40px 20px;text-align:center">
      <div style="font-size:40px;margin-bottom:16px">⚠</div>
      <div style="font-size:12px;font-family:monospace;color:rgba(226,234,248,0.5);line-height:1.8;white-space:pre-line">${msg}</div>
      <button onclick="rescan()" class="btn btn-primary" style="margin-top:20px;width:100%;border:none">↻ Retry</button>
    </div>
  `;
}

async function rescan() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.storage.local.remove(`scan_${tab.id}`);
  location.reload();
}
