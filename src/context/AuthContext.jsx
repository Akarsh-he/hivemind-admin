import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState(null);

  // Helper to decode JWT payload safely if stored token exists
  const decodeTokenRole = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonPayload);
      return parsed?.role ? parsed.role.toLowerCase() : null;
    } catch (e) {
      return null;
    }
  };

  const checkAuth = async () => {
    try {
      const res = await api.get('/admin/me');
      if (res.data?.admin) {
        const adminData = res.data.admin;
        if (adminData.role) {
          adminData.role = adminData.role.toLowerCase();
        }
        setAdmin(adminData);
      } else {
        setAdmin(null);
      }
    } catch (err) {
      setAdmin(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoginError(null);
    setAuthLoading(true);
    try {
      const res = await api.post('/admin/login', credentials);
      if (res.data?.admin) {
        if (res.data.token) {
          localStorage.setItem('admin_token', res.data.token);
        }
        const adminData = res.data.admin;
        if (adminData.role) {
          adminData.role = adminData.role.toLowerCase();
        } else if (res.data.token) {
          const decodedRole = decodeTokenRole(res.data.token);
          if (decodedRole) adminData.role = decodedRole;
        }
        setAdmin(adminData);
        return { success: true, admin: adminData };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setLoginError(msg);
      return { success: false, message: msg };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  const role = admin?.role?.toLowerCase() || null;

  const value = {
    admin,
    role,
    authLoading,
    loginError,
    login,
    logout,
    checkAuth
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
