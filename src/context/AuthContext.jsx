import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('ba_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ba_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Refresh profile on mount if token exists
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res && res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('ba_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Failed to sync profile:', error.message);
        }
      }
      setLoading(false);
    };

    fetchCurrentProfile();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('ba_token', newToken);
    if (userData) {
      localStorage.setItem('ba_user', JSON.stringify(userData));
      setUser(userData);
    }
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('ba_token');
    localStorage.removeItem('ba_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getProfile();
      if (res && res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('ba_user', JSON.stringify(res.data));
        return res.data;
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
