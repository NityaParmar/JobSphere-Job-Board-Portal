import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { jobApi } from '../api/job.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token in localStorage
  useEffect(() => {
    const fetchFreshUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchFreshUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const token = res.data?.token || res.token;
    const user = res.data?.user || res.user;
    if (res.success && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const token = res.data?.token || res.token;
    const user = res.data?.user || res.user;
    if (res.success && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateProfile(profileData);
    if (res.success && res.data && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  const isJobSaved = (jobId) => {
    if (!user || !user.savedJobs) return false;
    return user.savedJobs.some((id) => (typeof id === 'object' ? id._id === jobId : id === jobId));
  };

  const toggleSaveJob = async (jobId) => {
    if (!user || user.role !== 'CANDIDATE') return false;
    const currentlySaved = isJobSaved(jobId);
    try {
      if (currentlySaved) {
        await jobApi.unsaveJob(jobId);
        const updatedSaved = (user.savedJobs || []).filter(
          (id) => (typeof id === 'object' ? id._id !== jobId : id !== jobId)
        );
        const updatedUser = { ...user, savedJobs: updatedSaved };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return false;
      } else {
        await jobApi.saveJob(jobId);
        const updatedSaved = [...(user.savedJobs || []), jobId];
        const updatedUser = { ...user, savedJobs: updatedSaved };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isJobSaved,
        toggleSaveJob,
        isAuthenticated: !!token && !!user,
        isEmployer: user?.role === 'EMPLOYER',
        isCandidate: user?.role === 'CANDIDATE',
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
