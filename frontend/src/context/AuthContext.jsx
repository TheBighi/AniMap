import { createContext, useState, useEffect, useCallback, useMemo } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  // check if user is logged in on mount (from localStorage)
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    console.log('AuthProvider mount - checking localStorage:', storedUsername);
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  const login = useCallback((user) => {
    setUsername(user);
    setIsLoggedIn(true);
    localStorage.setItem('username', user);
  }, []);

  const logout = useCallback(() => {
    setUsername(null);
    setIsLoggedIn(false);
    localStorage.removeItem('username');
  }, []);

  const value = useMemo(() => ({ isLoggedIn, username, login, logout }), [isLoggedIn, username, login, logout]);
  console.log('AuthContext value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


