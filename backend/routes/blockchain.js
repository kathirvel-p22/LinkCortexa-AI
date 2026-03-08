const express = require('express');
const router = express.Router();
const { getBlockchainLogs, verifyLog } = require('../services/blockchain');

router.get('/logs', (req, res) => {
  const logs = getBlockchainLogs(50);
  res.json({ success: true, data: logs });
});

router.get('/verify/:txHash', (req, res) => {
  const result = verifyLog(req.params.txHash);
  res.json({ success: true, data: result });
});

router.get('/stats', (req, res) => {
  const logs = getBlockchainLogs(1000);
  res.json({ success: true, data: { totalLogs: logs.length, latestBlock: logs[0]?.blockNumber || 0 } });
});

module.exports = router;
