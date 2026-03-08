// LinkCortexa AI - Content Script

let overlayShown = false;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SHOW_THREAT_OVERLAY' && !overlayShown) {
    overlayShown = true;
    showThreatOverlay(msg.data);
  }
});

function showThreatOverlay(data) {
  const overlay = document.createElement('div');
  overlay.id = 'linkcortexa-overlay';
  overlay.innerHTML = `
    <style>
      #linkcortexa-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(6,9,16,0.97); z-index: 2147483647;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Syne', -apple-system, sans-serif;
        backdrop-filter: blur(10px);
      }
      #lc-box {
        background: #0d1320; border: 1px solid rgba(255,51,102,0.3);
        border-radius: 16px; padding: 40px; max-width: 500px; width: 90%;
        text-align: center; box-shadow: 0 0 60px rgba(255,51,102,0.15);
      }
      #lc-icon { font-size: 64px; margin-bottom: 20px; display: block; }
      #lc-title { font-size: 24px; font-weight: 800; color: #ff3366; margin-bottom: 8px; }
      #lc-sub { font-size: 14px; color: rgba(226,234,248,0.6); margin-bottom: 24px; }
      #lc-score { font-size: 48px; font-weight: 900; color: #ff3366; margin: 16px 0; font-family: monospace; }
      #lc-domain { font-family: monospace; font-size: 14px; color: rgba(226,234,248,0.5); margin-bottom: 24px; word-break: break-all; }
      #lc-types { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 28px; }
      .lc-tag { background: rgba(255,51,102,0.1); border: 1px solid rgba(255,51,102,0.3); color: #ff3366; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-family: monospace; text-transform: uppercase; }
      #lc-btns { display: flex; gap: 12px; justify-content: center; }
      .lc-btn { padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 14px; border: none; transition: all 0.2s; }
      #lc-back { background: #ff3366; color: white; }
      #lc-back:hover { background: #ff0044; transform: translateY(-1px); }
      #lc-proceed { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(226,234,248,0.5); }
      #lc-proceed:hover { border-color: rgba(255,255,255,0.3); }
      #lc-chain { margin-top: 20px; font-size: 11px; color: rgba(168,85,247,0.7); font-family: monospace; }
    </style>
    <div id="lc-box">
      <span id="lc-icon">🛡️</span>
      <div id="lc-title">DANGEROUS WEBSITE BLOCKED</div>
      <div id="lc-sub">LinkCortexa AI has detected a serious threat on this page</div>
      <div id="lc-score">${data.riskScore}<span style="font-size:20px">/100</span></div>
      <div id="lc-domain">${data.domain || data.url}</div>
      <div id="lc-types">
        ${(data.threatTypes||[]).map(t => `<span class="lc-tag">${t.replace('_',' ')}</span>`).join('') || '<span class="lc-tag">high risk</span>'}
      </div>
      <div id="lc-btns">
        <button class="lc-btn" id="lc-back">← Go Back to Safety</button>
        <button class="lc-btn" id="lc-proceed">Proceed Anyway (Risk)</button>
      </div>
      ${data.blockchainTxHash ? `<div id="lc-chain">⬡ Blockchain logged: ${data.blockchainTxHash.substring(0,20)}...</div>` : ''}
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('lc-back').onclick = () => history.back();
  document.getElementById('lc-proceed').onclick = () => { overlay.remove(); overlayShown = false; };
}
