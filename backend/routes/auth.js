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
      { id: '1', name: 'System Administrator', email: 'admin@gmail.com', password: '$2a$12$rcrXuqiNNxf4HZY2A81oB.5AOmTnbVcNRHWiQWgwLBittz9tBUFtS', role: 'admin', scansCount: 142, threatsBlocked: 38 },
      { id: '2', name: 'Security Analyst', email: 'user@linkcortexa.ai', password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HsAnZK6', role: 'user', scansCount: 67, threatsBlocked: 12 }
    ];
    saveUsers();
  }
} catch (e) {
  console.error('Error loading users:', e);
  users = [
    { id: '1', name: 'System Administrator', email: 'admin@gmail.com', password: '$2a$12$rcrXuqiNNxf4HZY2A81oB.5AOmTnbVcNRHWiQWgwLBittz9tBUFtS', role: 'admin', scansCount: 142, threatsBlocked: 38 },
    { id: '2', name: 'Security Analyst', email: 'user@linkcortexa.ai', password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HsAnZK6', role: 'user', scansCount: 67, threatsBlocked: 12 }
  ];
}
// Admin password: "1234567890"
// User password: "password123"

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
    if (users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const newUser = { id: String(Date.now()), name, email: email.toLowerCase(), password: hashed, role: 'user', scansCount: 0, threatsBlocked: 0 };
    users.push(newUser);
    saveUsers(); // Persist to file
    const token = generateToken(newUser);
    res.status(201).json({ success: true, token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/me', require('../middleware/auth').auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, scansCount: user.scansCount, threatsBlocked: user.threatsBlocked } });
});

module.exports = router;
