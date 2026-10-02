import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('civicsetu_token'));
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on initial app boot
  const restoreUser = useCallback(async () => {
    const savedToken = localStorage.getItem('civicsetu_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
      } else {
        localStorage.removeItem('civicsetu_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Session restoration failed:', err.response?.data?.message || err.message);
      localStorage.removeItem('civicsetu_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreUser();
  }, [restoreUser]);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data.data;

    localStorage.setItem('civicsetu_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  // Register handler (Citizens)
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = response.data.data;

    localStorage.setItem('civicsetu_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('civicsetu_token');
    setToken(null);
    setUser(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    const updatedUser = response.data.data.user;
    setUser(updatedUser);
    return updatedUser;
  };

  // Change password
  const changePassword = async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    restoreUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
