const express = require('express');
const router = express.Router();
const analyzeRoute = require('./analyze');

router.get('/overview', (req, res) => {
  const store = analyzeRoute.threatStore();
  const now = new Date();
  const last24h = store.filter(t => new Date(t.createdAt) > new Date(now - 86400000));
  const last7d = store.filter(t => new Date(t.createdAt) > new Date(now - 7*86400000));

  // Daily chart data (last 7 days)
  const dailyData = Array.from({length:7}, (_, i) => {
    const date = new Date(now - i * 86400000);
    const day = date.toLocaleDateString('en-US', {weekday:'short'});
    const dayStart = new Date(date.setHours(0,0,0,0));
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const dayThreats = store.filter(t => {
      const d = new Date(t.createdAt);
      return d >= dayStart && d < dayEnd;
    });
    return {
      day,
      total: dayThreats.length,
      phishing: dayThreats.filter(t => t.status === 'phishing').length,
      suspicious: dayThreats.filter(t => t.status === 'suspicious').length,
      safe: dayThreats.filter(t => t.status === 'safe').length
    };
  }).reverse();

  res.json({
    success: true,
    data: {
      totalScans: store.length,
      threatsToday: last24h.filter(t => t.status !== 'safe').length,
      threatsWeek: last7d.filter(t => t.status !== 'safe').length,
      blockchainLogs: store.filter(t => t.blockchainLogged).length,
      avgRiskScore: store.length ? Math.round(store.reduce((a,t) => a + t.riskScore, 0) / store.length) : 0,
      statusBreakdown: {
        phishing: store.filter(t => t.status === 'phishing').length,
        suspicious: store.filter(t => t.status === 'suspicious').length,
        malware: store.filter(t => t.status === 'malware').length,
        safe: store.filter(t => t.status === 'safe').length
      },
      dailyData,
      recentThreats: store.filter(t => t.status !== 'safe').slice(0, 5)
    }
  });
});

module.exports = router;
