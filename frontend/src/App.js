import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Threats from './pages/Threats';
import BlockchainLogs from './pages/BlockchainLogs';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--cyan)',fontFamily:'var(--font-mono)'}}>INITIALIZING...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="scanner" element={<Scanner />} />
              <Route path="threats" element={<Threats />} />
              <Route path="blockchain" element={<BlockchainLogs />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}
