import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useToken from './useToken';

const OAuth2Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useToken();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
      // set React state + persist
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);

      // hard redirect into dashboard
      window.location.replace('/dashboard');
    } else {
      // on failure just go back to login
      window.location.replace('/login');
    }
  }, [location.search, setToken]);

  return null;
};

export default OAuth2Callback;
