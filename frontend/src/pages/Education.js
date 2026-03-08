import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, XCircle, Award, ChevronRight, Lightbulb, Shield } from 'lucide-react';
import api from '../services/api';

const TIPS = [
  { id: 1, title: 'Always Check HTTPS', description: 'Look for the padlock icon and "https://" before entering any personal information. HTTP sites can expose your data to hackers.', category: 'Basics', difficulty: 'beginner', icon: '🔒' },
  { id: 2, title: 'Hover Before You Click', description: 'Hover over any link to see the real destination URL in the status bar. If it looks different from what you expect, don\'t click!', category: 'Phishing', difficulty: 'beginner', icon: '🖱️' },
  { id: 3, title: 'Watch for Domain Typos', description: 'Phishers use domains like "paypa1.com", "g00gle.com", or "amazon-secure.com". Always verify the exact domain spelling.', category: 'Phishing', difficulty: 'beginner', icon: '🔍' },
  { id: 4, title: 'IP Addresses in URLs = Red Flag', description: 'URLs using raw IP addresses like "http://192.168.1.100/paypal" are almost always malicious. Legitimate services use domain names.', category: 'Advanced', difficulty: 'intermediate', icon: '🚨' },
  { id: 5, title: 'Too Many Subdomains = Suspicious', description: 'Real banks use "bank.com" - not "login.verify.update.bank-secure.com". Multiple subdomains are a classic phishing technique.', category: 'Phishing', difficulty: 'intermediate', icon: '⚠️' },
  { id: 6, title: 'Urgency Is a Manipulation Tactic', description: '"Your account will be suspended in 24 hours!" is designed to make you panic. Pause, breathe, and verify directly with the company.', category: 'Social Engineering', difficulty: 'beginner', icon: '⏰' },
  { id: 7, title: 'Free TLDs Are Often Malicious', description: 'Domains ending in .tk, .ml, .ga, .cf are free and heavily abused for phishing. A legitimate company uses proper TLDs.', category: 'Advanced', difficulty: 'advanced', icon: '🌐' },
  { id: 8, title: 'Enable Multi-Factor Authentication', description: 'Even if your password is stolen by phishing, MFA prevents attackers from accessing your accounts. Enable it everywhere you can.', category: 'Protection', difficulty: 'beginner', icon: '📱' }
];

const QUESTIONS = [
  { q: 'Which URL is safer to click?', options: ['http://bank.com/login', 'https://bank.com/login', 'https://bank.com.verify.tk/login', 'https://192.168.1.1/bank'], answer: 1, explanation: 'HTTPS with the correct domain (https://bank.com/login) is safest. Option C has a suspicious TLD and Option D uses an IP address.' },
  { q: 'You get an email: "Your PayPal is limited! Click here to unlock: http://paypa1-secure.com". What do you do?', options: ['Click the link immediately', 'Reply asking for more info', 'Go to paypal.com directly', 'Forward to friends'], answer: 2, explanation: '"paypa1" (with number 1 instead of L) is a typosquat. Always navigate directly to the official website instead of clicking email links.' },
  { q: 'What does a URL like https://login.google.com.verify-account.net actually point to?', options: ['Google.com', 'verify-account.net', 'login.google.com', 'google.com.verify'], answer: 1, explanation: 'The actual domain is verify-account.net — everything before it are subdomains. The real domain is always the last two parts before the first /' },
  { q: 'Which of these is a sign of a phishing website?', options: ['Uses HTTPS', 'Has a clear privacy policy', 'URL contains login-verify-update', 'Has a professional design'], answer: 2, explanation: 'Phishing URLs commonly use suspicious keywords like "login", "verify", "update", "secure", "account", "confirm".' },
];

export default function Education() {
  const [activeTab, setActiveTab] = useState('tips');
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [filterDiff, setFilterDiff] = useState('all');

  const answer = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === QUESTIONS[quizIndex].answer) setScore(s => s + 1);
  };

  const next = () => {
    if (quizIndex < QUESTIONS.length - 1) { setQuizIndex(q => q + 1); setSelected(null); }
    else setFinished(true);
  };

  const filteredTips = filterDiff === 'all' ? TIPS : TIPS.filter(t => t.difficulty === filterDiff);
  const diffColor = { beginner: 'var(--accent-green)', intermediate: 'var(--accent-orange)', advanced: 'var(--accent-red)' };

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Security Education</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono' }}>Learn to identify and avoid cyber threats • Interactive quiz included</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['tips', '💡 Security Tips'], ['quiz', '🎯 Knowledge Quiz']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600,
            background: activeTab === id ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'transparent',
            border: `1px solid ${activeTab === id ? 'transparent' : 'var(--border)'}`,
            color: activeTab === id ? 'white' : 'var(--text-secondary)'
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'tips' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
              <button key={d} onClick={() => setFilterDiff(d)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
                background: filterDiff === d ? diffColor[d] || 'var(--accent-cyan)' : 'transparent',
                border: `1px solid ${filterDiff === d ? 'transparent' : 'var(--border)'}`,
                color: filterDiff === d ? 'black' : 'var(--text-secondary)'
              }}>{d}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filteredTips.map(tip => (
              <div key={tip.id} className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{tip.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{tip.title}</h3>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: 4 }}>{tip.category}</span>
                      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: diffColor[tip.difficulty], padding: '2px 6px', background: `${diffColor[tip.difficulty]}15`, borderRadius: 4 }}>{tip.difficulty}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{tip.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'quiz' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {!finished ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Question {quizIndex + 1}/{QUESTIONS.length}</span>
                <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>Score: {score}/{quizIndex}</span>
              </div>
              <div className="risk-meter" style={{ marginBottom: 24 }}>
                <div className="risk-fill" style={{ width: `${((quizIndex + 1) / QUESTIONS.length) * 100}%`, background: 'var(--accent-cyan)' }} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24, lineHeight: 1.5 }}>{QUESTIONS[quizIndex].q}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {QUESTIONS[quizIndex].options.map((opt, i) => {
                  let bg = 'var(--bg-secondary)', border = 'var(--border)', color = 'var(--text-secondary)';
                  if (selected !== null) {
                    if (i === QUESTIONS[quizIndex].answer) { bg = 'rgba(0,255,136,0.1)'; border = 'var(--accent-green)'; color = 'var(--accent-green)'; }
                    else if (i === selected && selected !== QUESTIONS[quizIndex].answer) { bg = 'rgba(255,68,68,0.1)'; border = 'var(--accent-red)'; color = 'var(--accent-red)'; }
                  }
                  return (
                    <button key={i} onClick={() => answer(i)} style={{
                      padding: '14px 18px', borderRadius: 8, textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer',
                      background: bg, border: `1px solid ${border}`, color, fontSize: 14, fontFamily: 'Inter', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      {selected !== null && i === QUESTIONS[quizIndex].answer && <CheckCircle size={16} />}
                      {selected !== null && i === selected && i !== QUESTIONS[quizIndex].answer && <XCircle size={16} />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <div style={{ padding: '14px', background: 'rgba(0,212,255,0.05)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.2)', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>💡 {QUESTIONS[quizIndex].explanation}</p>
                </div>
              )}
              {selected !== null && (
                <button className="btn-primary" onClick={next} style={{ width: '100%', justifyContent: 'center' }}>
                  {quizIndex < QUESTIONS.length - 1 ? 'Next Question →' : 'See Results'} 
                </button>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Award size={64} color="var(--accent-yellow)" style={{ marginBottom: 20 }} />
              <div style={{ fontFamily: 'Orbitron', fontSize: 48, fontWeight: 900, color: score >= 3 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{score}/{QUESTIONS.length}</div>
              <p style={{ fontSize: 18, color: 'var(--text-primary)', marginTop: 12, marginBottom: 8 }}>
                {score === QUESTIONS.length ? '🏆 Perfect Score! You\'re a cybersecurity expert!' : score >= 3 ? '🎉 Great job! You have solid security awareness.' : '📚 Keep learning! Practice makes perfect.'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{Math.round((score / QUESTIONS.length) * 100)}% correct answers</p>
              <button className="btn-primary" onClick={() => { setQuizIndex(0); setSelected(null); setScore(0); setFinished(false); }}>
                <Shield size={16} /> Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
