// emailScan.js
const express = require('express');
const router = express.Router();
const threatEngine = require('../services/threatAnalysis');

router.post('/scan', async (req, res) => {
  try {
    const { emailContent, subject, sender } = req.body;
    if (!emailContent) return res.status(400).json({ error: 'Email content required' });

    // Extract URLs from email
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
    const urls = [...new Set(emailContent.match(urlRegex) || [])].slice(0, 10);

    // Analyze each URL
    const urlResults = await Promise.allSettled(urls.map(url => threatEngine.analyzeURL(url)));
    const analyzedURLs = urlResults.map((r, i) => ({
      url: urls[i],
      ...(r.status === 'fulfilled' ? r.value : { error: r.reason?.message, status: 'unknown', riskScore: 0 })
    }));

    // Overall email risk
    const maxRisk = analyzedURLs.reduce((max, u) => Math.max(max, u.riskScore || 0), 0);
    const hasPhishing = analyzedURLs.some(u => u.status === 'phishing');
    const hasMalware = analyzedURLs.some(u => u.status === 'malware');

    // Sender domain check
    let senderAnalysis = null;
    if (sender) {
      const senderDomain = sender.split('@')[1];
      if (senderDomain) senderAnalysis = await threatEngine.analyzeURL(`https://${senderDomain}`);
    }

    res.json({
      emailRiskScore: maxRisk,
      status: hasPhishing ? 'phishing' : hasMalware ? 'malware' : maxRisk > 40 ? 'suspicious' : 'safe',
      urlsFound: urls.length,
      analyzedURLs,
      senderAnalysis,
      recommendation: hasPhishing ? '⛔ DO NOT click any links. This email appears to be a phishing attempt.' :
        hasMalware ? '⛔ This email contains links to malware. Delete immediately.' :
        maxRisk > 40 ? '⚠️ Exercise caution. Some links appear suspicious.' :
        '✅ No obvious threats detected. Stay cautious with unexpected emails.'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
