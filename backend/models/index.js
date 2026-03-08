// ============================================
// LinkCortexa AI - Database Models
// ============================================
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkcortexa');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    // Run without DB in demo mode
  }
};
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  scansCount: { type: Number, default: 0 }
});

// Threat Log Schema
const threatSchema = new mongoose.Schema({
  url: { type: String, required: true },
  domain: String,
  ipAddress: String,
  riskScore: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ['safe', 'suspicious', 'phishing', 'malware', 'unknown'], default: 'unknown' },
  threatType: [String],
  sources: {
    virustotal: { detected: Boolean, positives: Number, total: Number },
    phishTank: { isPhishing: Boolean },
    googleSafeBrowsing: { isMalicious: Boolean, threatType: String },
    abuseIPDB: { abuseScore: Number, country: String },
    urlhaus: { isListed: Boolean }
  },
  ipInfo: {
    country: String,
    city: String,
    org: String,
    lat: Number,
    lon: Number
  },
  mlScore: Number,
  mlFeatures: Object,
  blockchainTxHash: String,
  blockchainTimestamp: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

// IP Intelligence Schema
const ipSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  abuseScore: Number,
  country: String,
  isp: String,
  usageType: String,
  isWhitelisted: Boolean,
  reports: Number,
  lastSeen: Date,
  updatedAt: { type: Date, default: Date.now }
});

// Alert Schema
const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['phishing', 'malware', 'suspicious', 'breach', 'new_threat'] },
  title: String,
  description: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  url: String,
  ip: String,
  resolved: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Threat: mongoose.model('Threat', threatSchema),
  IPIntel: mongoose.model('IPIntel', ipSchema),
  Alert: mongoose.model('Alert', alertSchema)
};
