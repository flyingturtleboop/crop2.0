import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Landing from './components/LandingPage/Landing';
import Login from './components/Login';
import Header from './components/Header';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import useToken from './components/useToken';

const AppContent: React.FC<{
  token: string | null;
  removeToken: () => void;
  setToken: (token: string) => void;
}> = ({ token, removeToken, setToken }) => {
  const location = useLocation();
  const showHeader = !location.pathname.startsWith('/dashboard');

  return (
    <>
      {showHeader && <Header removeToken={removeToken} />}
      <div className={showHeader ? 'pt-16' : ''}>
        {token ? (
          <Routes>
            <Route path="/dashboard/*" element={<Dashboard removeToken={removeToken} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register setToken={setToken} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </>
  );
};

const App: React.FC = () => {
  const { token, removeToken, setToken } = useToken();
  return (
    <BrowserRouter>
      <AppContent token={token} removeToken={removeToken} setToken={setToken} />
    </BrowserRouter>
  );
};

export default App;
