// LinkCortexa AI - Real-Time Browser Protection
// Background Service Worker for Manifest V3

const API_URL = 'http://localhost:5000/api';
let threatCache = new Map();
let scanQueue = [];
let isProcessing = false;

// Configuration
const CONFIG = {
  cacheExpiry: 3600000, // 1 hour
  scanDelay: 500, // 500ms debounce
  maxCacheSize: 1000,
  riskThreshold: 60
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('🛡️ LinkCortexa AI Security Extension Installed');
  
  // Set default settings
  chrome.storage.local.set({
    enabled: true,
    autoBlock: true,
    notifications: true,
    stats: {
      scansToday: 0,
      threatsBlocked: 0,
      lastScan: null
    }
  });

  // Show welcome notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'LinkCortexa AI Activated',
    message: 'Real-time protection is now active. You are protected!'
  });
});

// Real-Time URL Monitoring
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame
  
  const url = details.url;
  
  // Skip internal pages
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }

  console.log('🔍 Scanning URL:', url);
  
  // Check if enabled
  const settings = await chrome.storage.local.get(['enabled', 'autoBlock']);
  if (!settings.enabled) return;

  // Scan URL
  const result = await scanURL(url);
  
  if (result && result.riskScore >= CONFIG.riskThreshold) {
    console.log('⚠️ Threat detected:', result);
    
    // Block if auto-block is enabled
    if (settings.autoBlock && result.riskScore >= 80) {
      blockPage(details.tabId, result);
    } else {
      // Show warning
      showThreatWarning(details.tabId, result);
    }
    
    // Update stats
    updateStats('threatsBlocked');
  }
  
  // Update scan stats
  updateStats('scansToday');
});

// Scan URL function
async function scanURL(url) {
  try {
    // Check cache first
    const cached = threatCache.get(url);
    if (cached && (Date.now() - cached.timestamp) < CONFIG.cacheExpiry) {
      console.log('📦 Cache hit:', url);
      return cached.result;
    }

    // Scan with backend
    const response = await fetch(`${API_URL}/analyze/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        source: 'extension',
        advanced: true
      })
    });

    if (!response.ok) {
      throw new Error('Scan failed');
    }

    const data = await response.json();
    const result = data.data;

    // Cache result
    threatCache.set(url, {
      result,
      timestamp: Date.now()
    });

    // Cleanup cache if too large
    if (threatCache.size > CONFIG.maxCacheSize) {
      const firstKey = threatCache.keys().next().value;
      threatCache.delete(firstKey);
    }

    return result;
  } catch (error) {
    console.error('Scan error:', error);
    return null;
  }
}

// Block dangerous page
function blockPage(tabId, result) {
  const blockHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>⚠️ Dangerous Website Blocked</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid #ff3366;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        .icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        h1 {
          font-size: 32px;
          margin-bottom: 10px;
          color: #ff3366;
        }
        .risk-score {
          font-size: 48px;
          font-weight: 900;
          color: #ff3366;
          margin: 20px 0;
        }
        .url {
          background: rgba(255, 51, 102, 0.1);
          border: 1px solid rgba(255, 51, 102, 0.3);
          border-radius: 10px;
          padding: 15px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 14px;
        }
        .threats {
          text-align: left;
          margin: 20px 0;
        }
        .threat-item {
          background: rgba(255, 51, 102, 0.1);
          border-left: 3px solid #ff3366;
          padding: 10px 15px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .buttons {
          display: flex;
          gap: 15px;
          margin-top: 30px;
          justify-content: center;
        }
        button {
          padding: 15px 30px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-back {
          background: #00c8ff;
          color: #000;
        }
        .btn-back:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 200, 255, 0.4);
        }
        .btn-proceed {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: #fff;
        }
        .btn-proceed:hover {
          border-color: #fff;
        }
        .powered {
          margin-top: 30px;
          font-size: 12px;
          opacity: 0.6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🛡️</div>
        <h1>Dangerous Website Blocked</h1>
        <p>LinkCortexa AI has detected a high-risk threat</p>
        
        <div class="risk-score">${result.riskScore}/100</div>
        <div style="color: #ff3366; font-weight: 600; text-transform: uppercase;">
          ${result.status} - ${result.severity} SEVERITY
        </div>
        
        <div class="url">${result.url}</div>
        
        ${result.threats && result.threats.length > 0 ? `
          <div class="threats">
            <strong>Threats Detected:</strong>
            ${result.threats.map(t => `<div class="threat-item">⚠️ ${t}</div>`).join('')}
          </div>
        ` : ''}
        
        <div class="buttons">
          <button class="btn-back" onclick="history.back()">
            ← Go Back to Safety
          </button>
          <button class="btn-proceed" onclick="proceedAnyway()">
            Proceed Anyway (Not Recommended)
          </button>
        </div>
        
        <div class="powered">
          Protected by LinkCortexa AI
        </div>
      </div>
      
      <script>
        function proceedAnyway() {
          if (confirm('⚠️ WARNING: This website is dangerous!\\n\\nRisk Score: ${result.riskScore}/100\\n\\nAre you absolutely sure you want to proceed?')) {
            window.location.href = '${result.url}';
          }
        }
      </script>
    </body>
    </html>
  `;

  // Inject block page
  chrome.scripting.executeScript({
    target: { tabId },
    func: (html) => {
      document.open();
      document.write(html);
      document.close();
    },
    args: [blockHTML]
  });

  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '🛡️ Threat Blocked',
    message: `Blocked dangerous website with risk score ${result.riskScore}/100`
  });
}

// Show warning overlay
function showThreatWarning(tabId, result) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (data) => {
      // Create warning banner
      const banner = document.createElement('div');
      banner.id = 'linkcortexa-warning';
      banner.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #ff3366, #ff6b6b);
          color: white;
          padding: 15px 20px;
          z-index: 999999;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: slideDown 0.3s ease;
        ">
          <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 24px;">⚠️</span>
            <div>
              <div style="font-weight: 700; font-size: 16px;">
                Warning: Suspicious Website Detected
              </div>
              <div style="font-size: 13px; opacity: 0.9;">
                Risk Score: ${data.riskScore}/100 | ${data.status.toUpperCase()}
              </div>
            </div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
          ">
            Dismiss
          </button>
        </div>
        <style>
          @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
          }
        </style>
      `;
      document.body.prepend(banner);
    },
    args: [result]
  });
}

// Update statistics
async function updateStats(key) {
  const stats = await chrome.storage.local.get(['stats']);
  const currentStats = stats.stats || {
    scansToday: 0,
    threatsBlocked: 0,
    lastScan: null
  };

  currentStats[key]++;
  currentStats.lastScan = new Date().toISOString();

  await chrome.storage.local.set({ stats: currentStats });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    chrome.storage.local.get(['stats'], (data) => {
      sendResponse(data.stats);
    });
    return true;
  }
  
  if (request.action === 'scanURL') {
    scanURL(request.url).then(result => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === 'toggleProtection') {
    chrome.storage.local.set({ enabled: request.enabled }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Periodic cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [url, data] of threatCache.entries()) {
    if (now - data.timestamp > CONFIG.cacheExpiry) {
      threatCache.delete(url);
    }
  }
}, 600000); // Every 10 minutes

// Periodic threat database sync
setInterval(async () => {
  try {
    const response = await fetch(`${API_URL}/threats/recent`);
    if (response.ok) {
      const data = await response.json();
      console.log('🔄 Threat database synced:', data);
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}, 1800000); // Every 30 minutes

console.log('🛡️ LinkCortexa AI Background Service Active');
