const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Data persistence file
const DATA_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load users from file or use defaults
let users = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } else {
    // Default users
    users = [
      { 
        id: '1', 
        name: 'System Administrator', 
        email: 'admin@gmail.com', 
        password: '$2a$12$b4FJWJ.Nl1KvJyWep/V7uuerVyc/Bb7t8GqZM5F56FuMqkhTzf2hq', 
        role: 'admin', 
        scansCount: 142, 
        threatsBlocked: 38,
        createdAt: new Date().toISOString()
      },
      { 
        id: '2', 
        name: 'Kathirvel P', 
        email: 'kathirvel.p2006@gmail.com', 
        password: '$2a$12$bPwK64cEJ/AMW0rjhnpjB.OFUMn0BauHChl8sFhoUUX6L0U4K1k3W', 
        role: 'user', 
        scansCount: 67, 
        threatsBlocked: 12,
        createdAt: new Date().toISOString()
      }
    ];
    saveUsers();
  }
} catch (e) {
  console.error('Error loading users:', e);
  users = [
    { 
      id: '1', 
      name: 'System Administrator', 
      email: 'admin@gmail.com', 
      password: '$2a$12$b4FJWJ.Nl1KvJyWep/V7uuerVyc/Bb7t8GqZM5F56FuMqkhTzf2hq', 
      role: 'admin', 
      scansCount: 142, 
      threatsBlocked: 38,
      createdAt: new Date().toISOString()
    },
    { 
      id: '2', 
      name: 'Kathirvel P', 
      email: 'kathirvel.p2006@gmail.com', 
      password: '$2a$12$bPwK64cEJ/AMW0rjhnpjB.OFUMn0BauHChl8sFhoUUX6L0U4K1k3W', 
      role: 'user', 
      scansCount: 67, 
      threatsBlocked: 12,
      createdAt: new Date().toISOString()
    }
  ];
}
// Admin password: "admin123"
// User password: "1234567890"

// Save users to file
function saveUsers() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, name: user.name, role: user.role },
  process.env.JWT_SECRET || 'linkcortexa_dev_secret',
  { expiresIn: '7d' }
);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, scansCount: user.scansCount, threatsBlocked: user.threatsBlocked } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    if (users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const hashed = await bcrypt.hash(password, 12);
    const newUser = { 
      id: String(Date.now()), 
      name, 
      email: email.toLowerCase(), 
      password: hashed, 
      role: 'user', 
      scansCount: 0, 
      threatsBlocked: 0,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(); // Persist to file
    
    const token = generateToken(newUser);
    res.status(201).json({ 
      success: true, 
      token, 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role,
        scansCount: newUser.scansCount,
        threatsBlocked: newUser.threatsBlocked
      } 
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/me', require('../middleware/auth').auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, scansCount: user.scansCount, threatsBlocked: user.threatsBlocked } });
});

// Get all users (admin only)
router.get('/users', require('../middleware/auth').auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const userList = users.map(u => ({ 
    id: u.id, 
    name: u.name, 
    email: u.email, 
    role: u.role, 
    scansCount: u.scansCount, 
    threatsBlocked: u.threatsBlocked,
    createdAt: u.createdAt 
  }));
  res.json({ success: true, users: userList });
});

// Update user stats
router.patch('/stats', require('../middleware/auth').auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  if (req.body.scansCount !== undefined) user.scansCount = req.body.scansCount;
  if (req.body.threatsBlocked !== undefined) user.threatsBlocked = req.body.threatsBlocked;
  
  saveUsers();
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, scansCount: user.scansCount, threatsBlocked: user.threatsBlocked } });
});

module.exports = router;
