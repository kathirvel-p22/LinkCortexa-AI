# 🔐 LinkCortexa AI - Login Credentials

## Quick Reference

### 👨‍💼 Admin Account
```
Email:    admin@gmail.com
Password: admin123
Access:   Click logo 5 times
```

### 👤 User Account
```
Email:    kathirvel.p2006@gmail.com
Password: 1234567890
Access:   Normal login
```

## 🚀 Quick Start

1. **Start the application**
   ```bash
   npm start
   ```

2. **Open browser**
   ```
   http://localhost:3000
   ```

3. **Login as User**
   - Click "LOGIN" tab
   - Enter: kathirvel.p2006@gmail.com / 1234567890
   - Click "ACCESS SYSTEM"

4. **Login as Admin**
   - Click the "LC" logo 5 times quickly
   - Wait for "ADMIN MODE ACTIVATED"
   - Enter: admin@gmail.com / admin123
   - Click "ADMIN ACCESS"

## 📝 Create New Account

1. Click "REGISTER" tab
2. Enter your details:
   - Full Name
   - Email
   - Password (min 6 characters)
3. Click "CREATE ACCOUNT"
4. Your account is saved to `backend/data/users.json`

## 🔄 Data Persistence

- ✅ All user accounts saved to local file
- ✅ Sessions persist across page refreshes
- ✅ Data persists across server restarts
- ✅ Secure password hashing (bcrypt)

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📂 Data Location

```
backend/data/users.json
```

## 🔒 Security Features

- JWT token authentication
- Bcrypt password hashing (12 rounds)
- Role-based access control (admin/user)
- Secure session management
- Hidden admin access

---

**Last Updated**: March 8, 2026
