
import React, { useEffect } from 'react';

const OAuth2Callback: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');

    if (token) {
      // 1) Persist the token so your hook picks it up at startup
      localStorage.setItem('token', token);
      localStorage.setItem('email', email || '');
      // 2) Do a full reload to /dashboard
      window.location.replace('/dashboard');
    } else {
      window.location.replace('/login');
    }
  }, []);

  return null; // nothing to render
};

export default OAuth2Callback;
