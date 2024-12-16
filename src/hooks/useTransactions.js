import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { wsManager } from '../utils/websocketManager';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const FETCH_COOLDOWN = 2000; // Reduce to 2 seconds

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // Clear ALL cached data on mount
  useEffect(() => {
    console.log('Clearing cached wallet data...');
    localStorage.removeItem('wallet_balance');
    localStorage.removeItem('transactions');
    localStorage.removeItem('wallet_balance_update');
    setBalance(0); // Reset balance to 0 on mount
    setTransactions([]); // Reset transactions
  }, []);

  // Validate balance value
  const validateBalance = (value) => {
    console.log('Validating balance:', value);
    
    // Check if value is a number
    if (typeof value !== 'number') {
      console.error('Invalid balance type:', typeof value);
      return 0;
    }

    // Check if value is finite and not NaN
    if (!Number.isFinite(value)) {
      console.error('Invalid balance value:', value);
      return 0;
    }

    // Check if value is non-negative
    if (value < 0) {
      console.error('Negative balance:', value);
      return 0;
    }

    console.log('Balance validated:', value);
    return value;
  };

  // Memoize fetchTransactions to prevent infinite loops
  const fetchTransactions = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime < FETCH_COOLDOWN) {
      return; // Prevent too frequent fetches
    }

    if (!user?.country) {
      setError('User country not available');
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Add aggressive cache-busting
      const timestamp = new Date().getTime();
      const nonce = Math.random().toString(36).substring(7);
      const response = await axios.get(`${API_URL}/transactions?_t=${timestamp}&_n=${nonce}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-User-Country': user.country.toLowerCase(),
          'Cache-Control': 'no-cache, no-store, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'If-None-Match': '', // Prevent If-None-Match header
          'If-Modified-Since': '' // Prevent If-Modified-Since header
        }
      });
      
      setLastFetchTime(now);
      
      // Always set transactions and balance together to ensure consistency
      if (response.data) {
        const newBalance = validateBalance(response.data.balance);
        console.log('Server returned balance:', response.data.balance);
        console.log('Validated balance:', newBalance);
        
        setTransactions(response.data.transactions || []);
        setBalance(newBalance);
        
        // Force UI update
        const updateTime = Date.now().toString();
        localStorage.setItem('wallet_balance_update', updateTime);
        localStorage.removeItem('wallet_balance_update');
        
        // Dispatch custom event for balance update
        window.dispatchEvent(new CustomEvent('wallet-balance-updated', {
          detail: { balance: newBalance, timestamp: updateTime }
        }));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
      
      if (error.response?.status === 403) {
        setError('Session expired. Please log in again.');
        wsManager.notifyListeners('error', {
          type: 'AUTH_ERROR',
          message: 'Session expired'
        });
      } else if (error.response?.status === 401) {
        setError('Authentication required');
      } else {
        if (!error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
          toast.error('Failed to fetch transactions');
          setError('Failed to fetch transactions');
        }
      }
    }
  }, [user?.country, API_URL]);

  // Listen for WebSocket updates with immediate refresh
  useEffect(() => {
    if (!user) return;

    const handleWebSocketMessage = async (type, data) => {
      if (type === 'message' && data.type === 'CODE_VERIFICATION') {
        console.log('Received code verification update:', data);
        
        // Force immediate balance update
        if (data.data.new_balance !== undefined) {
          const newBalance = validateBalance(data.data.new_balance);
          setBalance(newBalance);
          console.log('Updated balance from WebSocket:', newBalance);
          
          // Force UI update
          localStorage.setItem('wallet_balance_update', Date.now().toString());
          localStorage.removeItem('wallet_balance_update');
        }
        
        // Update transactions and force refresh
        if (data.data.transaction) {
          setTransactions(prev => [data.data.transaction, ...prev]);
        }
        
        // Always force a fresh fetch after WebSocket update
        await fetchTransactions(true);
      }
    };

    const unsubscribe = wsManager.addListener(handleWebSocketMessage);
    return () => unsubscribe();
  }, [user, fetchTransactions]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchData = async () => {
      if (!isMounted || !user) return;
      await fetchTransactions(true); // Always force refresh
    };

    if (user) {
      fetchData(); // Initial fetch
      
      // Set up interval for periodic refresh
      if (!intervalId) {
        intervalId = setInterval(fetchData, 30000); // 30 second interval
      }
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, fetchTransactions]);

  return {
    transactions,
    loading,
    balance,
    error,
    refreshTransactions: useCallback((force = true) => fetchTransactions(force), [fetchTransactions]),
    updateBalance: useCallback((newBalance) => {
      const validBalance = validateBalance(newBalance);
      setBalance(validBalance);
      // Force UI update
      localStorage.setItem('wallet_balance_update', Date.now().toString());
      localStorage.removeItem('wallet_balance_update');
    }, [])
  };
}; 