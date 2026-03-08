const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'linkcortexa_dev_secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
  });
};

module.exports = { auth, adminAuth };
