import React from 'react';
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Landing from './components/Landing';
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
  // Hide the header on any route that starts with "/dashboard"
  const showHeader = !location.pathname.startsWith('/dashboard');

  return (
    <>
      {showHeader && <Header removeToken={removeToken} />}
      <div className={`${showHeader ? 'pt-16' : ''}`}>
        {token ? (
          <Routes>
            {/* The entire dashboard page (with sidebar + main content) */}
            <Route path="/dashboard/*" element={<Dashboard removeToken={removeToken} />} />
            {/* Fallback: redirect unmatched authenticated routes to /dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register setToken={setToken} />} />
            {/* Fallback: redirect unmatched public routes to landing */}
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
    <div className="vh-100 gradient-custom">
      <div className="container">
        <BrowserRouter>
          <AppContent token={token} removeToken={removeToken} setToken={setToken} />
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;