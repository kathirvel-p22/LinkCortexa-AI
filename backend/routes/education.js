const express = require('express');
const router = express.Router();

const tips = [
  { id: 1, title: 'Check HTTPS', description: 'Always verify the site uses HTTPS (padlock icon). HTTP sites can intercept your data.', category: 'basics', difficulty: 'beginner' },
  { id: 2, title: 'Hover Before Clicking', description: 'Hover over links to see the actual URL in the status bar before clicking.', category: 'phishing', difficulty: 'beginner' },
  { id: 3, title: 'Verify Domain Spelling', description: 'Phishing sites use typos like "paypa1.com" or "google-login.com" to trick users.', category: 'phishing', difficulty: 'beginner' },
  { id: 4, title: 'IP-Based URLs Are Suspicious', description: 'URLs like http://192.168.1.1/login are almost always malicious. Real services use domain names.', category: 'advanced', difficulty: 'intermediate' },
  { id: 5, title: 'Too Many Subdomains', description: 'URLs like login.bank.verify.update.com are phishing. Real banks use simple domains.', category: 'phishing', difficulty: 'intermediate' },
  { id: 6, title: 'Urgency is a Red Flag', description: '"Your account will be suspended!" is a pressure tactic. Verify directly with the company.', category: 'social', difficulty: 'beginner' },
  { id: 7, title: 'Free TLDs Are Risky', description: 'Domains ending in .tk, .ml, .ga are free and heavily used for phishing.', category: 'advanced', difficulty: 'advanced' },
  { id: 8, title: 'Use Multi-Factor Authentication', description: 'Even if credentials are stolen, MFA prevents unauthorized access.', category: 'protection', difficulty: 'beginner' }
];

router.get('/tips', (req, res) => res.json({ tips, total: tips.length }));
router.get('/quiz', (req, res) => {
  const questions = [
    { q: 'Which URL is safer?', options: ['http://bank.com/login', 'https://bank.com/login'], answer: 1, explanation: 'HTTPS encrypts your connection' },
    { q: 'A link like http://192.168.0.1/paypal is:', options: ['Safe', 'Suspicious', 'Definitely malicious'], answer: 2, explanation: 'Raw IPs in URLs are a major phishing indicator' },
    { q: 'You receive "Your account is suspended - click here immediately". You should:', options: ['Click the link', 'Ignore and delete', 'Visit official site directly'], answer: 2, explanation: 'Always visit official websites directly, never via email links' }
  ];
  res.json({ questions });
});

module.exports = router;
