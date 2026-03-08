import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

export default function RealtimeStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalScans: 0,
    totalThreats: 0,
    recentThreats: []
  });
  const [activities, setActivities] = useState([]);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('✅ Real-time connection established');
      setConnected(true);
      
      // Send user info
      if (user) {
        newSocket.emit('user_connected', {
          id: user.id,
          name: user.name,
          role: user.role
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Real-time connection lost');
      setConnected(false);
    });

    // Listen for stats updates
    newSocket.on('stats_update', (data) => {
      setStats(prev => ({ ...prev, ...data }));
    });

    // Listen for threat alerts
    newSocket.on('threat_alert', (data) => {
      setStats(prev => ({
        ...prev,
        totalThreats: data.totalThreats,
        recentThreats: [data.threat, ...(prev.recentThreats || [])].slice(0, 5)
      }));
    });

    // Listen for activity logs
    newSocket.on('activity_log', (activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 10));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Connection Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: connected ? 'var(--green-dim)' : 'var(--red-dim)',
        border: `1px solid ${connected ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)'}`,
        borderRadius: 8,
        fontSize: 12,
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: connected ? 'var(--green)' : 'var(--red)',
          animation: connected ? 'pulse-ring 2s infinite' : 'none'
        }} />
        <span style={{ color: connected ? 'var(--green)' : 'var(--red)' }}>
          {connected ? 'LIVE' : 'DISCONNECTED'}
        </span>
      </div>

      {/* Real-time Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          icon="👥"
          color="var(--cyan)"
        />
        <StatCard
          label="Total Scans"
          value={stats.totalScans}
          icon="🔍"
          color="var(--green)"
        />
        <StatCard
          label="Threats Detected"
          value={stats.totalThreats}
          icon="⚠️"
          color="var(--red)"
        />
      </div>

      {/* Recent Threats */}
      {stats.recentThreats && stats.recentThreats.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            RECENT THREATS (LIVE)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recentThreats.map((threat, i) => (
              <div
                key={threat.id || i}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255,51,102,0.05)',
                  border: '1px solid rgba(255,51,102,0.2)',
                  borderRadius: 6,
                  fontSize: 12,
                  animation: i === 0 ? 'fadeInUp 0.3s ease' : 'none'
                }}
              >
                <div style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>
                  {threat.url || threat.domain}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                  Risk: {threat.riskScore} | {new Date(threat.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed (Admin only) */}
      {user?.role === 'admin' && activities.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
            marginBottom: 12,
            letterSpacing: 1
          }}>
            LIVE ACTIVITY FEED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activities.map((activity, i) => (
              <div
                key={activity.id || i}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  animation: i === 0 ? 'fadeInUp 0.3s ease' : 'none'
                }}
              >
                {activity.type}: {JSON.stringify(activity.data).substring(0, 50)}...
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card" style={{
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <div style={{
        fontSize: 28,
        width: 50,
        height: 50,
        borderRadius: 12,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 24,
          fontWeight: 800,
          color,
          fontFamily: 'var(--font-mono)'
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: 0.5
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}
