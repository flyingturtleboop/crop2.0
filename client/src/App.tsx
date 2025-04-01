import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './components/Landing';
import Login from './components/Login';
import Header from './components/Header';
import Profile from './components/Profile';
import Register from './components/Register';
import useToken from './components/useToken.tsx';

const App: React.FC = () => {
  const { token, removeToken, setToken } = useToken();

  return (
    <div className="vh-100 gradient-custom">
      <div className="container">
        <BrowserRouter>
          {/* Pass removeToken to the token prop as that's what the Header expects */}
          <Header token={removeToken} />
          {token ? (
            <Routes>
              <Route path="/profile" element={<Profile token={token} setToken={setToken} />} />
              {/* You can add other protected routes here */}
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login setToken={setToken} />} />
              <Route path="/register" element={<Register setToken={setToken} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;