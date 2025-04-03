import { useState } from 'react';

interface TokenInterface {
  setToken: (userToken: string) => void;
  token: string | null;
  removeToken: () => void;
}

function useToken(): TokenInterface {
  function getToken(): string | null {
    const userToken = localStorage.getItem('token'); 
    return userToken || null;
  }

  const [token, setToken] = useState<string | null>(getToken());

  function saveToken(userToken: string): void {
    localStorage.setItem('token', userToken);
    setToken(userToken);
  }

  function removeToken(): void {
    localStorage.removeItem("token");
    setToken(null);
  }

  return {
    setToken: saveToken,
    token,
    removeToken
  };
}

export default useToken;