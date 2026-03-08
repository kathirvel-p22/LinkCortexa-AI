const express = require('express');
const router = express.Router();
const analyzeRoute = require('./analyze');

router.get('/recent', (req, res) => {
  const store = analyzeRoute.threatStore();
  const threats = store.filter(t => ['phishing','malware','suspicious'].includes(t.status)).slice(0, 20);
  res.json({ success: true, data: threats });
});

router.get('/top', (req, res) => {
  const store = analyzeRoute.threatStore();
  const top = [...store].sort((a,b) => b.riskScore - a.riskScore).slice(0, 10);
  res.json({ success: true, data: top });
});

router.get('/by-country', (req, res) => {
  const store = analyzeRoute.threatStore();
  const countryMap = {};
  store.forEach(t => {
    const c = t.geoLocation?.country || 'Unknown';
    countryMap[c] = (countryMap[c] || 0) + 1;
  });
  res.json({ success: true, data: Object.entries(countryMap).map(([country, count]) => ({ country, count })).sort((a,b) => b.count - a.count) });
});

module.exports = router;
