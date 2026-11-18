import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount via HTTP-only cookie
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setDoctorProfile(res.doctorProfile || null);
      } else {
        setUser(null);
        setDoctorProfile(null);
      }
    } catch (err) {
      // 401 unauthenticated is expected when not logged in
      setUser(null);
      setDoctorProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.success && res.user) {
      setUser(res.user);
      // Fetch full doctor profile if doctor
      if (res.user.role === 'doctor') {
        const meRes = await api.getMe();
        setDoctorProfile(meRes.doctorProfile || null);
      } else {
        setDoctorProfile(null);
      }
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.user) {
      setUser(res.user);
      setDoctorProfile(null);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API call error:', err);
    } finally {
      setUser(null);
      setDoctorProfile(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setDoctorProfile(res.doctorProfile || null);
      }
    } catch (err) {
      console.warn('Failed to refresh user data:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        doctorProfile,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isDoctor: user?.role === 'doctor',
        isPatient: user?.role === 'patient'
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
