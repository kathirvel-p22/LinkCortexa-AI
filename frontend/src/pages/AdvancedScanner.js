import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdvancedScanner() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [socket, setSocket] = useState(null);
  const [autoScan, setAutoScan] = useState(true);
  const [clipboardMonitoring, setClipboardMonitoring] = useState(false);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('scan_progress', (data) => {
      setProgress(data.progress);
    });

    setSocket(newSocket);

    // Load scan history
    loadHistory();

    // Check for URL in query params (for automatic scanning)
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam && autoScan) {
      setUrl(urlParam);
      setTimeout(() => scanURL(urlParam), 500);
    }

    return () => newSocket.disconnect();
  }, []);

  // Monitor clipboard for URLs (optional feature)
  useEffect(() => {
    if (!clipboardMonitoring) return;

    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && isValidURL(text) && text !== url) {
          setUrl(text);
          if (autoScan) {
            scanURL(text);
          }
        }
      } catch (err) {
        // Clipboard access denied
      }
    };

    const interval = setInterval(checkClipboard, 2000);
    return () => clearInterval(interval);
  }, [clipboardMonitoring, url, autoScan]);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API}/analyze/history?limit=10`);
      setHistory(res.data.data || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const isValidURL = (string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch {
      return false;
    }
  };

  const scanURL = async (urlToScan = url) => {
    if (!urlToScan.trim()) return;

    setScanning(true);
    setProgress(0);
    setResult(null);

    try {
      // Emit scan start to socket
      if (socket) {
        socket.emit('scan_url', { url: urlToScan, userId: user?.id });
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Perform scan with advanced analysis + AI
      const res = await axios.post(`${API}/analyze/url`, {
        url: urlToScan,
        source: 'dashboard',
        advanced: true,
        useAI: true
      });

      clearInterval(progressInterval);
      setProgress(100);

      setResult(res.data.data);
      loadHistory();

      // Log activity
      if (socket) {
        socket.emit('user_activity', {
          type: 'url_scanned',
          url: urlToScan,
          riskScore: res.data.data.riskScore
        });
      }

    } catch (err) {
      console.error('Scan error:', err);
      setResult({
        error: true,
        message: err.response?.data?.message || 'Scan failed'
      });
    } finally {
      setScanning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !scanning) {
      scanURL();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          AI-Powered URL Scanner
        </h1>
        <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          REAL-TIME THREAT DETECTION WITH ADVANCED AI ANALYSIS
        </p>
      </div>

      {/* Scanner Card */}
      <div className="card" style={{ padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{
              fontSize: 12,
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: 1
            }}>
              ENTER URL TO SCAN
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoScan}
                  onChange={(e) => setAutoScan(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Auto-scan
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={clipboardMonitoring}
                  onChange={(e) => setClipboardMonitoring(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Monitor clipboard
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="https://example.com or example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={scanning}
              style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
            />
            <button
              onClick={scanURL}
              disabled={scanning || !url.trim()}
              className="btn-primary"
              style={{ minWidth: 140 }}
            >
              {scanning ? 'SCANNING...' : '🔍 SCAN URL'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {scanning && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)'
            }}>
              <span>Analyzing...</span>
              <span>{progress}%</span>
            </div>
            <div className="risk-bar">
              <div
                className="risk-fill"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--cyan), var(--green))',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Quick Test URLs */}
        <div style={{
          padding: 16,
          background: 'rgba(0,200,255,0.05)',
          border: '1px solid rgba(0,200,255,0.15)',
          borderRadius: 10
        }}>
          <div style={{
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: 'var(--cyan)',
            marginBottom: 10,
            fontWeight: 700
          }}>
            QUICK TEST URLS | AI + ADVANCED ANALYSIS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: 'Safe', url: 'https://google.com', color: 'var(--green)' },
              { label: 'Suspicious', url: 'https://paypal-secure-login.xyz', color: 'var(--yellow)' },
              { label: 'Phishing', url: 'https://amazon-verify.tk', color: 'var(--red)' },
              { label: 'Test IP', url: 'http://192.168.1.1/login', color: 'var(--red)' }
            ].map(test => (
              <button
                key={test.url}
                onClick={() => { setUrl(test.url); if (autoScan) scanURL(test.url); }}
                disabled={scanning}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${test.color}40`,
                  borderRadius: 6,
                  color: test.color,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${test.color}20`}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                {test.label}
              </button>
            ))}
          </div>
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: 'rgba(168,85,247,0.1)',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--purple)'
          }}>
            💡 Tip: Enable "Auto-scan" to automatically analyze URLs when you paste them
          </div>
        </div>
      </div>

      {/* Results */}
      {result && !result.error && (
        <ThreatAnalysisResult result={result} />
      )}

      {/* Error */}
      {result && result.error && (
        <div className="card" style={{
          padding: 24,
          background: 'var(--red-dim)',
          border: '1px solid rgba(255,51,102,0.3)'
        }}>
          <div style={{ color: 'var(--red)', fontSize: 15, fontWeight: 700 }}>
            ⚠ {result.message}
          </div>
        </div>
      )}

      {/* Recent Scans */}
      {history.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
            Recent Scans
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((scan, i) => (
              <div
                key={scan.id}
                style={{
                  padding: 16,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    marginBottom: 4
                  }}>
                    {scan.url}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {new Date(scan.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: getRiskColor(scan.riskScore),
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {scan.riskScore}
                  </div>
                  <span className={`badge badge-${scan.status}`}>
                    {scan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThreatAnalysisResult({ result }) {
  const riskColor = getRiskColor(result.riskScore);

  return (
    <div className="card" style={{ padding: 32 }}>
      {/* Risk Score */}
      <div style={{
        textAlign: 'center',
        padding: 32,
        background: `${riskColor}10`,
        border: `2px solid ${riskColor}40`,
        borderRadius: 16,
        marginBottom: 32
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: 900,
          color: riskColor,
          fontFamily: 'var(--font-mono)',
          marginBottom: 8
        }}>
          {result.riskScore}
        </div>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: riskColor,
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 8
        }}>
          {result.status}
        </div>
        <span className={`badge badge-${result.status}`} style={{ fontSize: 13 }}>
          {result.severity?.toUpperCase()} SEVERITY
        </span>
        
        {/* AI Score Display */}
        {result.aiScore && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--purple)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
              AI ANALYSIS
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--purple)' }}>
                  {result.aiScore}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>AI Score</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan)' }}>
                  {result.aiConfidence}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Confidence</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detection Methods */}
      {result.detectionMethods && result.detectionMethods.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-dim)' }}>
            DETECTION METHODS USED
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {result.detectionMethods.map((method, i) => (
              <span
                key={i}
                style={{
                  padding: '6px 12px',
                  background: 'var(--cyan-dim)',
                  border: '1px solid rgba(0,200,255,0.3)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--cyan)'
                }}
              >
                ✓ {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Threats Detected */}
      {result.threats && result.threats.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-dim)' }}>
            THREATS DETECTED ({result.threats.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.threats.map((threat, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  background: 'var(--red-dim)',
                  border: '1px solid rgba(255,51,102,0.3)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: 'var(--red)'
                }}
              >
                ⚠ {threat}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-dim)' }}>
            RECOMMENDATIONS
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.recommendations.map((rec, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13
                }}
              >
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Time */}
      <div style={{
        textAlign: 'center',
        fontSize: 11,
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)'
      }}>
        Analysis completed in {result.processingTime}ms
      </div>
    </div>
  );
}

function getRiskColor(score) {
  if (score >= 80) return 'var(--red)';
  if (score >= 60) return 'var(--yellow)';
  if (score >= 40) return 'var(--cyan)';
  return 'var(--green)';
}
