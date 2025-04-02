import React from 'react';
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Landing from './components/Landing';
import Login from './components/Login';
import Header from './components/Header';
import Profile from './components/Profile';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import useToken from './components/useToken.tsx';

const AppContent: React.FC<{
  token: string|null;
  removeToken: () => void;
  setToken: (token: string) => void;
}> = ({ token, removeToken, setToken }) => {
  const location = useLocation();

  const hideHeaderOnPaths = ['/dashboard'];

  return (
    <>
      {!hideHeaderOnPaths.includes(location.pathname) && (
        <Header token={removeToken} />
      )}

      {/*  All route logic stays here */}
      {token ? (
        <Routes>
          <Route
            path="/profile"
            element={<Profile token={token} setToken={setToken} />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
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
    </>
  );
};

const App: React.FC = () => {
  const { token, removeToken, setToken } = useToken();

  return (
    <div className="vh-100 gradient-custom  ">
      <div className="container">
        <BrowserRouter>
          {/* Use the wrapped component that hides Header on specific routes */}
          <AppContent
            token={token}
            setToken={setToken}
            removeToken={removeToken}
          />
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;
