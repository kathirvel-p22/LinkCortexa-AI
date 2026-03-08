// LinkCortexa AI - Background Service Worker
const API_BASE = 'http://localhost:5000/api';
let scanCache = {};

// Listen to navigation
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = details.url;
  if (!url.startsWith('http')) return;
  if (scanCache[url] && Date.now() - scanCache[url].time < 300000) return; // 5 min cache
  
  try {
    const response = await fetch(`${API_BASE}/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, source: 'extension' })
    });
    const data = await response.json();
    if (data.success) {
      const result = data.data;
      scanCache[url] = { ...result, time: Date.now() };
      
      // Store result
      await chrome.storage.local.set({ [`scan_${details.tabId}`]: result });
      
      // Update badge
      const score = result.riskScore;
      const badgeText = score >= 70 ? '⚠' : score >= 40 ? '!' : '✓';
      const badgeColor = score >= 70 ? '#ff3366' : score >= 40 ? '#ffaa00' : '#00ff88';
      
      chrome.action.setBadgeText({ text: String(score), tabId: details.tabId });
      chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId: details.tabId });
      
      // Notify if dangerous
      if (score >= 70) {
        chrome.notifications.create(`threat_${Date.now()}`, {
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: '⚠ DANGEROUS SITE DETECTED — LinkCortexa AI',
          message: `Risk Score: ${score}/100\nDomain: ${result.domain}\nStatus: ${result.status?.toUpperCase()}\n\nThis site may be attempting to steal your data!`,
          priority: 2,
          buttons: [{ title: 'Block & Go Back' }, { title: 'Dismiss' }]
        });
        
        // Block site by injecting overlay
        chrome.tabs.sendMessage(details.tabId, { type: 'SHOW_THREAT_OVERLAY', data: result });
      } else if (score >= 40) {
        chrome.notifications.create(`warn_${Date.now()}`, {
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: '⚠ Suspicious Site — LinkCortexa AI',
          message: `Risk Score: ${score}/100\nDomain: ${result.domain}\nProceed with caution.`,
          priority: 1
        });
      }
      
      // Broadcast to popup
      chrome.runtime.sendMessage({ type: 'SCAN_RESULT', data: result }).catch(() => {});
    }
  } catch (err) {
    console.log('LinkCortexa scan failed:', err);
  }
}, { url: [{ schemes: ['http', 'https'] }] });

// Handle notification buttons
chrome.notifications.onButtonClicked.addListener((notifId, buttonIdx) => {
  if (buttonIdx === 0) chrome.tabs.goBack();
});

// Message handler
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'MANUAL_SCAN') {
    chrome.storage.local.get(`scan_${msg.tabId}`, (result) => {
      sendResponse(result[`scan_${msg.tabId}`] || null);
    });
    return true;
  }
});
