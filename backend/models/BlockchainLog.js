const mongoose = require('mongoose');

const BlockchainLogSchema = new mongoose.Schema({
  threatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Threat' },
  url: String,
  riskScore: Number,
  status: String,
  dataHash: String,
  txHash: String,
  blockNumber: Number,
  network: { type: String, default: 'Sepolia Testnet' },
  timestamp: { type: Date, default: Date.now },
  confirmed: { type: Boolean, default: false }
});

module.exports = mongoose.model('BlockchainLog', BlockchainLogSchema);
