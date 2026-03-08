const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const realtimeService = require('./services/realtimeService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api/', limiter);

// Share io with routes
app.use((req, res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/threats', require('./routes/threats'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/user', require('./routes/user'));

// Health Check
app.get('/health', (req, res) => res.json({ status: 'LinkCortexa AI is running', version: '1.0.0', timestamp: new Date() }));

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/linkcortexa') {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Atlas connected');
    } else {
      console.log('⚠️  MongoDB not configured - running with in-memory mock data');
    }
  } catch (err) {
    console.log('⚠️  MongoDB connection failed - running with mock data:', err.message);
  }
};

// Socket.IO for real-time alerts
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Initialize real-time service
realtimeService.initialize(io);

// Export io for use in routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`🛡️  LinkCortexa AI Server running on port ${PORT}`));
});

module.exports = { app, io };
