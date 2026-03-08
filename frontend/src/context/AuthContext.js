import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('lc_token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API}/auth/me`)
        .then(r => {
          setUser(r.data.user);
          // Store user data in localStorage for persistence
          localStorage.setItem('lc_user', JSON.stringify(r.data.user));
        })
        .catch(() => { 
          localStorage.removeItem('lc_token'); 
          localStorage.removeItem('lc_user');
          setToken(null); 
        })
        .finally(() => setLoading(false));
    } else {
      // Try to restore user from localStorage
      const storedUser = localStorage.getItem('lc_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('lc_user');
        }
      }
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const r = await axios.post(`${API}/auth/login`, { email, password });
    const { token: t, user: u } = r.data;
    localStorage.setItem('lc_token', t);
    localStorage.setItem('lc_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t); setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const r = await axios.post(`${API}/auth/register`, { name, email, password });
    const { token: t, user: u } = r.data;
    localStorage.setItem('lc_token', t);
    localStorage.setItem('lc_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t); setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('lc_token');
    localStorage.removeItem('lc_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null); setToken(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
