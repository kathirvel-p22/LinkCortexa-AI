import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((message, type = 'info') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 5000);
  }, []);

  const removeAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
      <div style={{position:'fixed',top:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:10}}>
        {alerts.map(alert => (
          <div key={alert.id} onClick={() => removeAlert(alert.id)} style={{
            padding:'14px 20px',borderRadius:10,cursor:'pointer',
            background: alert.type === 'danger' ? 'rgba(255,51,102,0.15)' : alert.type === 'success' ? 'rgba(0,255,136,0.12)' : 'rgba(0,200,255,0.12)',
            border: `1px solid ${alert.type === 'danger' ? 'rgba(255,51,102,0.4)' : alert.type === 'success' ? 'rgba(0,255,136,0.4)' : 'rgba(0,200,255,0.4)'}`,
            color: alert.type === 'danger' ? '#ff3366' : alert.type === 'success' ? '#00ff88' : '#00c8ff',
            fontFamily:'var(--font-mono)',fontSize:13,maxWidth:360,
            animation:'fadeInUp 0.3s ease',backdropFilter:'blur(12px)'
          }}>
            {alert.type === 'danger' ? '⚠ ' : alert.type === 'success' ? '✓ ' : 'ℹ '}{alert.message}
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
