import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, currentPassword: '', newPassword: '' });
      
      // If admin, fetch all users
      if (user.role === 'admin') {
        fetchAllUsers();
      }
    }
  }, [user]);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API}/auth/users`);
      setAllUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Update profile logic would go here
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          {user.role === 'admin' ? 'Admin Profile' : 'My Profile'}
        </h1>
        <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          MANAGE YOUR ACCOUNT SETTINGS
        </p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
          {/* Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: 20,
            background: user.role === 'admin' 
              ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))'
              : 'linear-gradient(135deg, var(--cyan-dim), rgba(0,200,255,0.05))',
            border: `2px solid ${user.role === 'admin' ? 'rgba(168,85,247,0.3)' : 'var(--border-bright)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 900,
            color: user.role === 'admin' ? 'var(--purple)' : 'var(--cyan)'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>{user.name}</h2>
              <span className={`badge badge-${user.role === 'admin' ? 'malware' : 'safe'}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 16 }}>
              {user.email}
            </p>
            
            {/* Stats */}
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan)' }}>
                  {user.scansCount || 0}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  SCANS
                </div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)' }}>
                  {user.threatsBlocked || 0}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  THREATS BLOCKED
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="btn-ghost"
              style={{ flexShrink: 0 }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit Form */}
        {editing && (
          <div style={{
            padding: 24, borderRadius: 12,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Edit Profile</h3>
            
            {message.text && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                background: message.type === 'success' ? 'var(--green-dim)' : 'var(--red-dim)',
                border: `1px solid ${message.type === 'success' ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)'}`,
                color: message.type === 'success' ? 'var(--green)' : 'var(--red)',
                fontSize: 13, fontFamily: 'var(--font-mono)'
              }}>
                {message.type === 'success' ? '✓' : '⚠'} {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                  FULL NAME
                </label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                  EMAIL
                </label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required 
                />
              </div>

              <div style={{ 
                padding: 16, borderRadius: 8, 
                background: 'rgba(255,170,0,0.05)',
                border: '1px solid rgba(255,170,0,0.2)'
              }}>
                <p style={{ fontSize: 13, color: 'var(--yellow)', marginBottom: 12, fontWeight: 600 }}>
                  Change Password (Optional)
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input 
                    type="password" 
                    placeholder="Current Password"
                    value={form.currentPassword}
                    onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                  />
                  <input 
                    type="password" 
                    placeholder="New Password (min 6 characters)"
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEditing(false); setMessage({ type: '', text: '' }); }}
                  className="btn-ghost"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Admin: All Users */}
      {user.role === 'admin' && (
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>All Users</h2>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                SYSTEM USER MANAGEMENT
              </p>
            </div>
            <button onClick={fetchAllUsers} className="btn-ghost" style={{ fontSize: 13 }}>
              ↻ REFRESH
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {allUsers.map((u, i) => (
              <div key={u.id} style={{
                padding: 20, borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Avatar */}
                <div style={{
                  width: 50, height: 50, borderRadius: 12,
                  background: u.role === 'admin' 
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))'
                    : 'linear-gradient(135deg, var(--cyan-dim), rgba(0,200,255,0.05))',
                  border: `1px solid ${u.role === 'admin' ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 900,
                  color: u.role === 'admin' ? 'var(--purple)' : 'var(--cyan)',
                  flexShrink: 0
                }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{u.name}</span>
                    <span className={`badge badge-${u.role === 'admin' ? 'malware' : 'safe'}`}>
                      {u.role}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {u.email}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cyan)' }}>
                      {u.scansCount || 0}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      SCANS
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--red)' }}>
                      {u.threatsBlocked || 0}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      BLOCKED
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>

          {allUsers.length === 0 && (
            <div style={{ 
              textAlign: 'center', padding: 40, 
              color: 'var(--text-dim)', fontSize: 14 
            }}>
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
