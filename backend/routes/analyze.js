const express = require('express');
const router = express.Router();
const { analyzeURL } = require('../services/threatAnalysis');
const { logToBlockchain } = require('../services/blockchain');

// In-memory threat store for demo
let threatStore = [];
let scanCount = 0;

// Mock historical data
const generateMockHistory = () => {
  const statuses = ['safe','suspicious','phishing','malware'];
  const domains = ['paypal-secure-login.xyz','amazon-verify.tk','google.com','github.com','banking-update.ml','microsoft365-login.work'];
  return Array.from({length: 50}, (_, i) => ({
    id: String(i+1),
    url: `https://${domains[i % domains.length]}/path`,
    domain: domains[i % domains.length],
    ip: `192.168.${Math.floor(i/10)}.${i%255}`,
    riskScore: Math.floor(Math.random() * 100),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    threatTypes: ['phishing','malware'].slice(0, Math.floor(Math.random()*2)),
    blockchainLogged: true,
    source: 'extension',
    createdAt: new Date(Date.now() - i * 3600000)
  }));
};

if (threatStore.length === 0) threatStore = generateMockHistory();

router.post('/url', async (req, res) => {
  try {
    const { url, source = 'api' } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    // Basic URL validation
    let validURL;
    try {
      validURL = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid URL format' });
    }

    scanCount++;
    const result = await analyzeURL(validURL.href);

    // Log to blockchain
    const blockchainResult = await logToBlockchain(result);

    const threat = {
      id: String(Date.now()),
      ...result,
      blockchainTxHash: blockchainResult.txHash,
      blockchainLogged: blockchainResult.success,
      source,
      createdAt: new Date()
    };

    threatStore.unshift(threat);
    if (threatStore.length > 500) threatStore = threatStore.slice(0, 500);

    // Emit real-time alert if threat
    if (req.app.get('io') && result.riskScore >= 40) {
      req.app.get('io').emit('threat_detected', {
        url: result.url,
        domain: result.domain,
        riskScore: result.riskScore,
        status: result.status,
        timestamp: new Date()
      });
    }

    res.json({ success: true, data: threat });
  } catch (e) {
    console.error('Analysis error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/history', (req, res) => {
  const { page = 1, limit = 20, status, minScore } = req.query;
  let filtered = threatStore;
  if (status) filtered = filtered.filter(t => t.status === status);
  if (minScore) filtered = filtered.filter(t => t.riskScore >= parseInt(minScore));
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = filtered.slice(start, start + parseInt(limit));
  res.json({ success: true, data: paginated, total: filtered.length, page: parseInt(page), pages: Math.ceil(filtered.length / parseInt(limit)) });
});

router.get('/stats', (req, res) => {
  const total = threatStore.length + scanCount;
  const phishing = threatStore.filter(t => t.status === 'phishing').length;
  const suspicious = threatStore.filter(t => t.status === 'suspicious').length;
  const malware = threatStore.filter(t => t.status === 'malware').length;
  const safe = threatStore.filter(t => t.status === 'safe').length;
  const avgScore = threatStore.length ? Math.round(threatStore.reduce((a,t) => a + t.riskScore, 0) / threatStore.length) : 0;
  res.json({ success: true, data: { totalScans: total, phishing, suspicious, malware, safe, avgRiskScore: avgScore, threatsBlocked: phishing + malware } });
});

module.exports = router;
module.exports.threatStore = () => threatStore;
