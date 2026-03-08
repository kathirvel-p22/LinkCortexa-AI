// Real-time service for WebSocket connections and live updates
const fs = require('fs');
const path = require('path');

class RealtimeService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.activityLog = [];
    this.threatQueue = [];
    this.statsCache = {
      totalScans: 0,
      totalThreats: 0,
      activeUsers: 0,
      lastUpdate: Date.now()
    };
  }

  initialize(io) {
    this.io = io;
    this.setupSocketHandlers();
    this.startPeriodicUpdates();
    console.log('✅ Real-time service initialized');
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      // Store user info
      socket.on('user_connected', (userData) => {
        this.connectedUsers.set(socket.id, {
          ...userData,
          connectedAt: Date.now(),
          lastActivity: Date.now()
        });
        this.updateActiveUsers();
        this.logActivity('user_connected', userData);
      });

      // Handle scan requests
      socket.on('scan_url', async (data) => {
        this.logActivity('scan_initiated', { url: data.url, user: data.userId });
        // Emit scan progress
        socket.emit('scan_progress', { status: 'analyzing', progress: 30 });
        
        // Simulate real-time scan updates
        setTimeout(() => {
          socket.emit('scan_progress', { status: 'checking_databases', progress: 60 });
        }, 500);
        
        setTimeout(() => {
          socket.emit('scan_progress', { status: 'finalizing', progress: 90 });
        }, 1000);
      });

      // Handle threat detection
      socket.on('threat_detected', (threatData) => {
        this.handleThreatDetection(threatData);
      });

      // Handle user activity
      socket.on('user_activity', (activity) => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          user.lastActivity = Date.now();
          this.logActivity(activity.type, { ...activity, userId: user.id });
        }
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          this.logActivity('user_disconnected', user);
        }
        this.connectedUsers.delete(socket.id);
        this.updateActiveUsers();
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  handleThreatDetection(threatData) {
    const threat = {
      ...threatData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    this.threatQueue.push(threat);
    this.statsCache.totalThreats++;

    // Broadcast to all connected clients
    this.io.emit('threat_alert', {
      threat,
      totalThreats: this.statsCache.totalThreats,
      severity: this.calculateSeverity(threat.riskScore)
    });

    // Log the threat
    this.logActivity('threat_detected', threat);
  }

  calculateSeverity(riskScore) {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  updateActiveUsers() {
    this.statsCache.activeUsers = this.connectedUsers.size;
    this.io.emit('stats_update', {
      activeUsers: this.statsCache.activeUsers,
      timestamp: Date.now()
    });
  }

  logActivity(type, data) {
    const activity = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString()
    };

    this.activityLog.push(activity);

    // Keep only last 1000 activities
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(-1000);
    }

    // Broadcast activity to admins
    this.io.emit('activity_log', activity);
  }

  startPeriodicUpdates() {
    // Send stats update every 5 seconds
    setInterval(() => {
      this.statsCache.lastUpdate = Date.now();
      this.io.emit('stats_update', {
        ...this.statsCache,
        connectedUsers: this.connectedUsers.size,
        recentThreats: this.threatQueue.slice(-10)
      });
    }, 5000);

    // Send activity summary every 10 seconds
    setInterval(() => {
      const recentActivities = this.activityLog.slice(-20);
      this.io.emit('activity_summary', {
        activities: recentActivities,
        count: this.activityLog.length
      });
    }, 10000);
  }

  // Public methods for external use
  broadcastThreat(threat) {
    this.handleThreatDetection(threat);
  }

  incrementScanCount() {
    this.statsCache.totalScans++;
    this.io.emit('stats_update', {
      totalScans: this.statsCache.totalScans,
      timestamp: Date.now()
    });
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  getActivityLog(limit = 100) {
    return this.activityLog.slice(-limit);
  }

  getStats() {
    return {
      ...this.statsCache,
      connectedUsers: this.connectedUsers.size,
      activityCount: this.activityLog.length
    };
  }
}

module.exports = new RealtimeService();
