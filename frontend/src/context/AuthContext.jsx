import { createContext, useState, useEffect, useCallback, useMemo } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  const clearAuthState = useCallback(() => {
    setUsername(null);
    setIsLoggedIn(false);
    localStorage.removeItem("username");
  }, []);

  const logout = useCallback(async () => {
    const response = await fetch("https://d22irt5kiloi89.cloudfront.net/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Logout failed with status ${response.status}`);
    }

    clearAuthState();
  }, [clearAuthState]);

  // check if user is logged in on mount (from localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("https://d22irt5kiloi89.cloudfront.net/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          setUsername(data.username);
          setIsLoggedIn(true);

          localStorage.setItem("username", data.username);
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearAuthState();
      }
    };

    checkAuth();
  }, [clearAuthState]);

  const login = useCallback((user) => {
    setUsername(user);
    setIsLoggedIn(true);
    localStorage.setItem("username", user);
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn, username, login, logout }),
    [isLoggedIn, username, login, logout],
  );
  console.log("AuthContext value:", value);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};