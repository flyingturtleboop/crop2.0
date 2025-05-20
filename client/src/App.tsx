import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NotificationProvider } from './NotificationContext';
import { MdChatBubbleOutline } from 'react-icons/md';

import Landing        from './components/LandingPage/Landing';
import Login          from './components/Login';
import Register       from './components/Register';
import Dashboard      from './components/Dashboard';
import Header         from './components/Header';
import OAuth2Callback from './components/OAuth2Callback';
import FAQModal       from './components/Dashboard/FAQModal';
import useToken       from './components/useToken';

const AppContent: React.FC = () => {
  const { token, removeToken, setToken } = useToken();
  const location = useLocation();
  const showHeader =
    !location.pathname.startsWith('/dashboard') &&
    !location.pathname.startsWith('/oauth2-callback');

  return (
    <>
      {showHeader && <Header removeToken={removeToken} />}
      <div className={showHeader ? 'pt-16' : ''}>
        <Routes>
          <Route path="/oauth2-callback" element={<OAuth2Callback />} />
          {!token ? (
            <>
              <Route path="/"         element={<Landing />} />
              <Route path="/login"    element={<Login setToken={setToken} />} />
              <Route path="/register" element={<Register setToken={setToken} />} />
              <Route path="*"         element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/dashboard/*" element={<Dashboard removeToken={removeToken} />} />
              <Route path="*"              element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </>
  );
};

const App: React.FC = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <NotificationProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>

        {/* Chat Button */}
        <button
          className="faq-button"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open Chat"
        >
          <MdChatBubbleOutline size={24} />
        </button>

        {/* FAQ Chat Modal */}
        <FAQModal
          isOpen={isChatOpen}
          closeModal={() => setIsChatOpen(false)}
          onQuestionSubmit={(q) => console.log('Asked:', q)}
        />
      </NotificationProvider>
    </GoogleOAuthProvider>
  );
};

export default App;