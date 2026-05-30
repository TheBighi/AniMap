import { createContext, useState, useEffect, useCallback, useMemo } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  // check if user is logged in on mount (from localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:3006/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          setUsername(data.username);
          setIsLoggedIn(true);

          localStorage.setItem("username", data.username);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Auth check error:", error);
        logout();
      }
    };

    checkAuth();
  }, []);

  const login = useCallback((user) => {
    setUsername(user);
    setIsLoggedIn(true);
    localStorage.setItem("username", user);
  }, []);

  const logout = useCallback(() => {
    setUsername(null);
    setIsLoggedIn(false);
    localStorage.removeItem("username");
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn, username, login, logout }),
    [isLoggedIn, username, login, logout],
  );
  console.log("AuthContext value:", value);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};