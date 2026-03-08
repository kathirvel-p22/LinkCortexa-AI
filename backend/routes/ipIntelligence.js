const express = require('express');
const router = express.Router();
const threatEngine = require('../services/threatAnalysis');

router.get('/lookup/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const [abuseData, ipInfo] = await Promise.allSettled([
      threatEngine.checkAbuseIPDB(ip),
      threatEngine.getIPInfo(ip)
    ]);
    res.json({
      ip,
      abuse: abuseData.status === 'fulfilled' ? abuseData.value : null,
      info: ipInfo.status === 'fulfilled' ? ipInfo.value : null,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/bulk-check', async (req, res) => {
  const { ips } = req.body;
  if (!ips?.length) return res.status(400).json({ error: 'IPs array required' });
  const results = await Promise.allSettled(ips.slice(0, 5).map(ip => threatEngine.checkAbuseIPDB(ip)));
  res.json({ results: ips.map((ip, i) => ({ ip, data: results[i].status === 'fulfilled' ? results[i].value : null })) });
});

module.exports = router;
