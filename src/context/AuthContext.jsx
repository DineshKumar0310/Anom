import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Set up axios interceptor for 403 (banned user) handling
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 403) {
          const message = error.response?.data?.error?.message || '';
          if (message.includes('banned')) {
            // User was banned - force logout
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            // Will redirect on next render
          }
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      // If 403 (banned) or any auth error, clear token
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await fetchUser();
    return response.data;
  };

  const signup = async (email, password, avatar) => {
    // This method performs auto-login, which we might want to change dynamically 
    // but for now we keep it for backward compatibility if needed, 
    // though our new flow uses 'register' below.
    const response = await api.post('/auth/signup', { email, password, avatar });
    const { token } = response.data.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await fetchUser();
    return response.data;
  };

  const register = async (email, password, avatar) => {
    return api.post('/auth/signup', { email, password, avatar });
  };

  const verifyEmail = async (email, otp) => {
    return api.post('/auth/verify-email', { email, otp });
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const isAdmin = user?.role === 'ADMIN';
  const isPremium = user?.isPremium || user?.userType === 'PREMIUM';

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, register, verifyEmail, logout, refreshUser, isAdmin, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
