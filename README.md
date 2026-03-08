# 🛡️ LinkCortexa AI — Intelligent Cyber Threat Detection Platform

> **All-in-One Cybersecurity Platform** | AI + Blockchain + Real-time Threat Intelligence

---

## 🎯 What This Solves

| Problem | Solution |
|---------|---------|
| Phishing websites stealing passwords | Real-time URL scanning before page loads |
| Fake links in emails & messages | Multi-API threat fusion engine |
| Cybercrime & financial fraud | Risk scoring + automatic blocking |
| Malicious IP infrastructure | AbuseIPDB + IPinfo geo-intelligence |
| Late threat detection | Browser-level real-time interception |
| Disconnected security tools | **One unified dashboard** |
| Low cybersecurity awareness | Education layer in every alert |
| No centralized monitoring | Admin dashboard with analytics |
| Log tampering | Blockchain-anchored tamper-proof logs |

---

## 🏗️ Architecture

```
Chrome Extension → LinkCortexa API Server → Threat Analysis Engine
                                          → VirusTotal (70+ AV engines)
                                          → AbuseIPDB (IP reputation)
                                          → Google Safe Browsing
                                          → URLhaus (malware DB)
                                          → IPinfo (geolocation)
                                          → AI/ML Engine (custom model)
                                          → MongoDB Atlas (free)
                                          → Ethereum Sepolia (free blockchain)
                                          → Admin Dashboard (React)
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- Python 3.8+ (for ML training)
- Google Chrome (for extension)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your free API keys (see below)
npm start
# Backend running at http://localhost:5000
```

### 2. Frontend Dashboard
```bash
cd frontend
npm install
npm start
# Dashboard at http://localhost:3000
```

### 3. Chrome Extension
1. Open Chrome → `chrome://extensions`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Extension icon appears in toolbar ✅

---

## 🔑 Free API Keys Setup

All APIs are completely FREE:

| API | Free Limit | Sign Up |
|-----|-----------|---------|
| VirusTotal | 4 req/min | https://virustotal.com |
| AbuseIPDB | 1000/day | https://abuseipdb.com |
| Google Safe Browsing | 10,000/day | https://console.cloud.google.com |
| URLhaus | Unlimited | No key needed! |
| IPinfo | 50,000/month | https://ipinfo.io |
| MongoDB Atlas | 512MB free | https://mongodb.com/atlas |
| Infura (Ethereum RPC) | Free tier | https://infura.io |

---

## ⬡ Blockchain Setup (Sepolia Testnet — FREE)

1. Install MetaMask browser extension
2. Switch to **Sepolia Test Network**
3. Get free test ETH: https://sepoliafaucet.com
4. Open https://remix.ethereum.org
5. Paste `blockchain/ThreatLogger.sol`
6. Compile & Deploy to Sepolia
7. Copy contract address to `.env`

---

## 🤖 ML Model Training

```bash
cd backend/ml
pip install scikit-learn pandas numpy
python train_model.py
# Trains Random Forest + Gradient Boosting + Logistic Regression
# Selects best model, saves to phishing_model.pkl
```

---

## 📁 Project Structure

```
linkcortexa/
├── backend/              # Node.js Express API
│   ├── server.js         # Main server + Socket.IO
│   ├── routes/           # API endpoints
│   ├── services/         # Threat analysis + Blockchain
│   ├── models/           # MongoDB schemas
│   ├── middleware/       # JWT auth
│   └── ml/              # Python ML training
├── frontend/             # React.js Dashboard
│   └── src/
│       ├── pages/        # Dashboard, Scanner, Threats, Analytics, Blockchain
│       ├── components/   # Layout, shared components
│       └── context/      # Auth, Alerts
├── extension/            # Chrome Extension (Manifest v3)
│   ├── manifest.json
│   ├── background.js     # Service worker, URL monitoring
│   ├── content.js        # Threat overlay injection
│   ├── popup.html/js     # Extension popup UI
│   └── icons/
└── blockchain/           # Smart Contract
    ├── ThreatLogger.sol  # Ethereum smart contract
    └── README.md         # Deployment guide
```

---

## 🔥 Key Features

- **6-API Fusion**: VirusTotal + AbuseIPDB + Google Safe Browsing + URLhaus + IPinfo + Custom ML
- **AI/ML Engine**: Extracts 20 URL features, rule-based + trainable model
- **Real-time Alerts**: Socket.IO live threat notifications
- **Blockchain Logs**: SHA-256 + Ethereum Sepolia (tamper-proof)
- **Threat Overlay**: Full-page block on dangerous sites
- **Education Layer**: Explains WHY each URL is dangerous
- **Geo Intelligence**: IP mapping with country/ISP data
- **Admin Dashboard**: Charts, tables, analytics, trend analysis

---

## 👥 Demo Credentials

| Role | Email | Password | Access Method |
|------|-------|---------|---------------|
| Admin | admin@gmail.com | admin123 | Click logo 5 times on login page |
| User | kathirvel.p2006@gmail.com | 1234567890 | Normal login |

**Hidden Admin Access:** Click the "LC" logo 5 times quickly on the login page to reveal the admin login mode.

---

## 🧪 Test URLs

| URL | Expected Result |
|-----|----------------|
| https://google.com | SAFE |
| https://paypal-secure-login.xyz | PHISHING |
| http://amazon-verify.tk/login | PHISHING |
| https://github.com | SAFE |

---

## 🚀 Deployment (Free)

| Component | Platform | Cost |
|-----------|---------|------|
| Backend | Railway.app / Render.com | Free |
| Frontend | Vercel | Free |
| Database | MongoDB Atlas | Free (512MB) |
| Blockchain | Ethereum Sepolia | Free (testnet) |
| CI/CD | GitHub Actions | Free |

---

## 🔮 Future Roadmap

- [ ] Mobile app (React Native)
- [ ] Email link scanning integration
- [ ] Enterprise SOC integration
- [ ] Advanced neural network model
- [ ] Cross-browser support (Firefox, Edge)
- [ ] Distributed blockchain (multi-chain)

---

**Built for SIH 2025 · Problem Statement SIH25229 · NTRO**
