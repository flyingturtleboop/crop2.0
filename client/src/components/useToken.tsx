import { useState } from "react";

interface UseTokenReturn {
  token: string | null;
  setToken: (userToken: string) => void;
  removeToken: () => void;
}

function useToken(): UseTokenReturn {
  // Retrieve the token from localStorage, or return null if not found
  function getToken(): string | null {
    const userToken = localStorage.getItem("token");
    return userToken;
  }

  // Set up state for the token (string or null)
  const [token, setTokenState] = useState<string | null>(getToken());

  // Save a new token to localStorage and update state
  function saveToken(userToken: string): void {
    localStorage.setItem("token", userToken);
    setTokenState(userToken);
  }

  // Remove token from localStorage and reset state
  function removeToken(): void {
    localStorage.removeItem("token");
    setTokenState(null);
  }

  return {
    token,
    setToken: saveToken,
    removeToken,
  };
}

export default useToken;
