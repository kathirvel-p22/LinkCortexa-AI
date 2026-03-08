# LinkCortexa AI - Deployment Guide

## ✅ Completed Features

### 1. Role-Based Authentication System
- **Admin Access**: Hidden admin login (click logo 5 times)
  - Email: `admin@gmail.com`
  - Password: `admin123`
- **User Access**: Standard login
  - Email: `kathirvel.p2006@gmail.com`
  - Password: `1234567890`

### 2. Data Persistence
- User data stored in `backend/data/users.json`
- All registered users persist across server restarts
- Session data stored in browser localStorage

### 3. UI Improvements
- Increased font sizes across all pages for better readability
- Enhanced Blockchain Logs page typography
- Improved overall user experience

### 4. GitHub Repository
- Repository: https://github.com/kathirvel-p22/LinkCortexa-AI.git
- All code pushed to main branch
- Includes .gitignore for clean repository

## 🚀 Running the Application

### Start Both Servers
```bash
npm start
```

This will start:
- Backend API: http://localhost:5000
- Frontend Dashboard: http://localhost:3000

### Individual Server Commands
```bash
# Backend only
npm run backend

# Frontend only
npm run frontend

# Install all dependencies
npm run install-all
```

## 🔐 Login Instructions

### Regular User Login
1. Go to http://localhost:3000
2. Click "LOGIN" tab
3. Enter user credentials
4. Click "ACCESS SYSTEM"

### Admin Login (Hidden)
1. Go to http://localhost:3000
2. Click the blue "LC" logo 5 times quickly
3. "ADMIN MODE ACTIVATED" will appear
4. Enter admin credentials
5. Click "ADMIN ACCESS"

## 📁 Project Structure

```
linkcortexa/
├── backend/              # Node.js Express API
│   ├── data/            # Persistent user data (auto-created)
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   └── middleware/      # Auth middleware
├── frontend/            # React.js Dashboard
│   └── src/
│       ├── pages/       # All application pages
│       ├── components/  # Reusable components
│       └── context/     # Auth & Alert contexts
├── extension/           # Chrome Extension
├── blockchain/          # Smart Contract
└── package.json         # Root package with concurrently
```

## 🔧 Environment Setup

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_change_this
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/linkcortexa
FRONTEND_URL=http://localhost:3000
```

### API Keys (Optional for full functionality)
- VirusTotal API Key
- AbuseIPDB API Key
- IPinfo Token
- Google Safe Browsing Key
- Ethereum Sepolia RPC URL

## 📊 Features

### Core Functionality
- ✅ URL Threat Scanning
- ✅ Real-time Threat Detection
- ✅ Blockchain Security Logs
- ✅ Analytics Dashboard
- ✅ Threat History
- ✅ IP Intelligence
- ✅ Email Scanner
- ✅ Educational Resources

### Security Features
- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ Password Hashing (bcrypt)
- ✅ Secure Session Management
- ✅ Data Persistence

## 🌐 Chrome Extension

### Installation
1. Open Chrome → `chrome://extensions`
2. Enable "Developer Mode"
3. Click "Load unpacked"
4. Select the `extension/` folder
5. Extension icon appears in toolbar

## 🔗 Important Links

- **GitHub**: https://github.com/kathirvel-p22/LinkCortexa-AI.git
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## 📝 Notes

- The application currently runs with mock data when MongoDB is not configured
- All user registrations are saved to `backend/data/users.json`
- Admin credentials are hardcoded for security (not visible in normal login)
- Font sizes have been optimized for better readability

## 🐛 Troubleshooting

### Servers won't start
```bash
# Kill any processes on ports 3000 and 5000
# Then restart
npm start
```

### Admin login not working
1. Make sure you clicked the logo exactly 5 times
2. Wait for "ADMIN MODE ACTIVATED" to appear
3. Use correct credentials: admin@gmail.com / admin123

### Changes not reflecting
- Frontend auto-reloads on file changes
- Backend requires restart for changes

## 🎯 Next Steps

1. Configure MongoDB Atlas for production database
2. Add API keys for full threat intelligence
3. Deploy to production (Railway, Vercel, etc.)
4. Set up CI/CD pipeline
5. Configure Ethereum Sepolia testnet for blockchain logging

---

**Built for SIH 2025 · Problem Statement SIH25229 · NTRO**
