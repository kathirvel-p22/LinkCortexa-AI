const mongoose = require('mongoose');

const ThreatSchema = new mongoose.Schema({
  url: { type: String, required: true },
  domain: String,
  ip: String,
  riskScore: { type: Number, default: 0 },
  status: { type: String, enum: ['safe', 'suspicious', 'phishing', 'malware', 'unknown'], default: 'unknown' },
  threatTypes: [String],
  apiResults: {
    virusTotal: mongoose.Schema.Types.Mixed,
    abuseIPDB: mongoose.Schema.Types.Mixed,
    googleSafeBrowsing: mongoose.Schema.Types.Mixed,
    phishTank: mongoose.Schema.Types.Mixed,
    urlhaus: mongoose.Schema.Types.Mixed,
    ipInfo: mongoose.Schema.Types.Mixed
  },
  mlPrediction: {
    score: Number,
    features: mongoose.Schema.Types.Mixed,
    label: String
  },
  geoLocation: {
    country: String,
    city: String,
    lat: Number,
    lon: Number,
    isp: String,
    org: String
  },
  blockchainTxHash: String,
  blockchainLogged: { type: Boolean, default: false },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, enum: ['extension', 'dashboard', 'api'], default: 'api' },
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

ThreatSchema.index({ url: 1, createdAt: -1 });
ThreatSchema.index({ riskScore: -1 });
ThreatSchema.index({ status: 1 });

module.exports = mongoose.model('Threat', ThreatSchema);
