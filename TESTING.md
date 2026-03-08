# LinkCortexa AI - Testing Guide

## ✅ Updated Credentials (March 8, 2026)

### Admin Account
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Access**: Click logo 5 times on login page

### User Account
- **Email**: `kathirvel.p2006@gmail.com`
- **Password**: `1234567890`
- **Access**: Normal login

## 🧪 Testing Checklist

### 1. User Registration (Signup)
- [ ] Go to http://localhost:3000
- [ ] Click "REGISTER" tab
- [ ] Enter:
  - Name: Your Name
  - Email: test@example.com
  - Password: test123456
- [ ] Click "CREATE ACCOUNT"
- [ ] Should redirect to dashboard
- [ ] User data saved to `backend/data/users.json`

### 2. User Login
- [ ] Go to http://localhost:3000
- [ ] Click "LOGIN" tab
- [ ] Enter: kathirvel.p2006@gmail.com / 1234567890
- [ ] Click "ACCESS SYSTEM"
- [ ] Should redirect to dashboard
- [ ] User info displayed in header

### 3. Admin Login (Hidden)
- [ ] Go to http://localhost:3000
- [ ] Click the blue "LC" logo 5 times quickly
- [ ] "ADMIN MODE ACTIVATED" appears
- [ ] Enter: admin@gmail.com / admin123
- [ ] Click "ADMIN ACCESS"
- [ ] Should redirect to dashboard with admin privileges

### 4. Session Persistence
- [ ] Login with any account
- [ ] Refresh the page (F5)
- [ ] Should remain logged in
- [ ] User data persists in localStorage

### 5. Logout
- [ ] Click user menu in header
- [ ] Click "Logout"
- [ ] Should redirect to login page
- [ ] Session cleared from localStorage

### 6. Navigation
After logging in, test all pages:
- [ ] Dashboard - Overview stats
- [ ] URL Scanner - Scan URLs for threats
- [ ] Threats - View threat database
- [ ] Analytics - View charts and analytics
- [ ] Blockchain Logs - View blockchain records
- [ ] All pages load without errors

### 7. Data Persistence
- [ ] Register a new user
- [ ] Stop the server (Ctrl+C)
- [ ] Restart: `npm start`
- [ ] Login with the new user
- [ ] Should work - data persisted in users.json

### 8. Error Handling
- [ ] Try login with wrong password - Shows error
- [ ] Try login with non-existent email - Shows error
- [ ] Try register with existing email - Shows error
- [ ] Try register with short password (<6 chars) - Shows error

## 📁 Data Storage Locations

### Backend
- **User Data**: `backend/data/users.json`
- **Format**: JSON array of user objects
- **Fields**: id, name, email, password (hashed), role, scansCount, threatsBlocked, createdAt

### Frontend (Browser)
- **Token**: `localStorage.lc_token` (JWT)
- **User Data**: `localStorage.lc_user` (User object)

## 🔍 Verification Commands

### Check if users.json exists
```bash
cd backend
ls data/users.json
```

### View users.json content
```bash
cd backend
cat data/users.json
```

### Check running processes
```bash
# Backend should be on port 5000
# Frontend should be on port 3000
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

## 🐛 Common Issues & Solutions

### Issue: "Email already exists"
**Solution**: The email is already registered. Use a different email or login instead.

### Issue: "Invalid credentials"
**Solution**: Check email and password are correct. Passwords are case-sensitive.

### Issue: Admin mode not activating
**Solution**: Click the logo exactly 5 times within 2 seconds.

### Issue: Not staying logged in after refresh
**Solution**: Check browser console for errors. Clear localStorage and try again.

### Issue: Can't register new users
**Solution**: 
1. Check backend is running on port 5000
2. Check `backend/data/` folder exists
3. Check file permissions

## 📊 Expected User Data Structure

```json
[
  {
    "id": "1",
    "name": "System Administrator",
    "email": "admin@gmail.com",
    "password": "$2a$12$b4FJWJ.Nl1KvJyWep/V7uuerVyc/Bb7t8GqZM5F56FuMqkhTzf2hq",
    "role": "admin",
    "scansCount": 142,
    "threatsBlocked": 38,
    "createdAt": "2026-03-08T07:00:00.000Z"
  },
  {
    "id": "2",
    "name": "Kathirvel P",
    "email": "kathirvel.p2006@gmail.com",
    "password": "$2a$12$bPwK64cEJ/AMW0rjhnpjB.OFUMn0BauHChl8sFhoUUX6L0U4K1k3W",
    "role": "user",
    "scansCount": 67,
    "threatsBlocked": 12,
    "createdAt": "2026-03-08T07:00:00.000Z"
  }
]
```

## 🎯 Success Criteria

✅ All tests pass
✅ Users can register and login
✅ Admin can access via hidden mode
✅ Sessions persist across page refreshes
✅ Data persists across server restarts
✅ All pages navigate correctly
✅ Logout works properly
✅ Error messages display correctly

## 📝 Test Results Log

Date: ___________
Tester: ___________

| Test | Status | Notes |
|------|--------|-------|
| User Registration | ⬜ Pass / ⬜ Fail | |
| User Login | ⬜ Pass / ⬜ Fail | |
| Admin Login | ⬜ Pass / ⬜ Fail | |
| Session Persistence | ⬜ Pass / ⬜ Fail | |
| Logout | ⬜ Pass / ⬜ Fail | |
| Navigation | ⬜ Pass / ⬜ Fail | |
| Data Persistence | ⬜ Pass / ⬜ Fail | |
| Error Handling | ⬜ Pass / ⬜ Fail | |

---

**Last Updated**: March 8, 2026
**Version**: 2.0
