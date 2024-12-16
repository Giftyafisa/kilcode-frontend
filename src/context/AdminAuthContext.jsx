import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));

  const API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8001/api/v1/admin';

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: true
  });

  // ... rest of your auth logic, but for admin ...
  
  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      if (response.data?.token) {
        localStorage.setItem('admin_token', response.data.token);
        setToken(response.data.token);
        setAdmin(response.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(error.response?.data?.detail || 'Login failed');
      return { success: false, error: error.response?.data?.detail };
    }
  };

  // ... other admin auth methods ...

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}; 