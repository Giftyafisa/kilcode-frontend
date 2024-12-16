import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: true
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = tokenWithBearer;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearUserData();
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      checkAuth(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async (authToken) => {
    try {
      if (!authToken) {
        console.error('No auth token provided');
        clearUserData();
        return;
      }

      const tokenWithBearer = authToken.startsWith('Bearer ') 
        ? authToken 
        : `Bearer ${authToken}`;

      console.log('Checking auth with token:', tokenWithBearer ? 'exists' : 'missing');
      const response = await axiosInstance.get('/auth/me', {
        headers: { Authorization: tokenWithBearer }
      });

      // Validate response data
      if (!response.data?.id || !response.data?.email || !response.data?.country) {
        console.error('Invalid user data from /auth/me:', response.data);
        clearUserData();
        return;
      }

      console.log('Auth check response:', {
        status: response.status,
        data: response.data
      });
      
      // Validate country
      const country = response.data.country?.toLowerCase();
      if (!country || !['nigeria', 'ghana'].includes(country)) {
        console.error('Invalid country in user data:', country);
        clearUserData();
        return;
      }
      
      const userData = {
        ...response.data,
        country: country
      };
      
      console.log('Normalized user data:', userData);
      
      setUser(userData);
      setToken(authToken);
      
      localStorage.setItem('userCountry', country);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Auth check error:', error);
      clearUserData();
    } finally {
      setLoading(false);
    }
  };

  const clearUserData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userCountry');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const login = async (credentials) => {
    try {
      if (!credentials.email || !credentials.password) {
        toast.error('Email and password are required');
        return { success: false, error: 'Email and password are required' };
      }

      console.log('Attempting login with:', credentials.email);
      
      const response = await axiosInstance.post('/auth/login', credentials);
      
      if (!response.data?.access_token || !response.data?.user) {
        console.error('Invalid login response:', response.data);
        toast.error('Invalid server response');
        return { success: false, error: 'Invalid credentials' };
      }

      console.log('Login response:', {
        status: response.status,
        user: response.data.user,
        token: response.data.access_token ? 'exists' : 'missing'
      });

      // Validate and normalize country
      const country = response.data.user.country?.toLowerCase();
      if (!country || !['nigeria', 'ghana'].includes(country)) {
        console.error('Invalid or missing country in user data:', country);
        toast.error('Invalid user country data');
        return { success: false, error: 'Invalid user country' };
      }

      const normalizedUser = {
        ...response.data.user,
        country: country
      };

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('userCountry', country);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      setToken(response.data.access_token);
      setUser(normalizedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.message === 'Network Error') {
        const errorMsg = 'Cannot connect to server. Please check if the server is running.';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const errorMsg = error.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Starting registration process with:', {
        ...userData,
        password: '[REDACTED]'
      });

      const requiredFields = ['email', 'password', 'name', 'country', 'phone'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        const error = `Missing required fields: ${missingFields.join(', ')}`;
        console.error('Registration validation failed:', error);
        toast.error(error);
        return { success: false, error };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        console.error('Invalid email format:', userData.email);
        toast.error('Invalid email format');
        return { success: false, error: 'Invalid email format' };
      }

      if (userData.password.length < 6) {
        console.error('Password too short');
        toast.error('Password must be at least 6 characters');
        return { success: false, error: 'Password too short' };
      }

      const validCountries = ['nigeria', 'ghana'];
      const normalizedCountry = userData.country.toLowerCase();
      if (!validCountries.includes(normalizedCountry)) {
        console.error('Invalid country:', userData.country);
        toast.error('Invalid country selection');
        return { success: false, error: 'Invalid country' };
      }

      const response = await axiosInstance.post('/auth/register', {
        ...userData,
        country: normalizedCountry
      });

      console.log('Registration response:', response.data);

      if (response.data?.access_token && response.data?.user) {
        const normalizedUser = {
          ...response.data.user,
          country: response.data.user.country?.toLowerCase() || normalizedCountry
        };

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('userCountry', normalizedUser.country);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        setToken(response.data.access_token);
        setUser(normalizedUser);
        
        // Ensure user is set in state before redirecting
        await new Promise(resolve => setTimeout(resolve, 100));

        // Handle payment redirection
        if (response.data.redirect_to === '/payment') {
          window.location.href = '/payment';
          return { success: true, redirectTo: '/payment' };
        }

        return { success: true, user: normalizedUser };
      }

      throw new Error('Invalid server response');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    clearUserData();
    toast.success('Logged out successfully');
  };

  const validateToken = (token) => {
    if (!token) return false;
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch (error) {
      return false;
    }
  };

  const validateUserData = (userData) => {
    if (!userData) return false;
    const requiredFields = ['id', 'email', 'country'];
    return requiredFields.every(field => userData[field]);
  };

  const verifyPayment = async (reference) => {
    try {
      console.log('Verifying payment reference:', reference);
      const response = await axiosInstance.post('/auth/verify-payment', {
        reference: reference
      });

      if (response.data?.success) {
        // Update user state with verified status
        const updatedUser = {
          ...user,
          is_verified: true,
          payment_status: 'completed',
          payment_reference: reference
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Create new token with updated payment status
        const newToken = response.data.access_token;
        if (newToken) {
          setToken(newToken);
          localStorage.setItem('token', newToken);
        }

        return {
          success: true,
          redirect: response.data.redirect || '/dashboard'
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Payment verification failed'
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to verify payment'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    verifyPayment
  };

  return (
    <AuthContext.Provider value={value}>
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