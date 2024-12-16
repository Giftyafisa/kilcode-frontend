import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { validateBettingCode } from '../utils/bettingCodeValidator';
import { wsManager } from '../utils/websocketManager';

export const useBettingCodes = () => {
  const { user } = useAuth();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    bookmaker: 'all',
    dateRange: 'all'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const MAX_RETRIES = 3;

  useEffect(() => {
    const handleWebSocketEvent = (type, messageData) => {
      if (type === 'message') {
        try {
          switch (messageData.type) {
            case 'CODE_VERIFIED':
              setCodes(prevCodes =>
                prevCodes.map(code =>
                  code.code === messageData.code
                    ? { 
                        ...code, 
                        status: messageData.status,
                        verifiedAt: new Date().toISOString(),
                        message: messageData.message
                      }
                    : code
                )
              );
              toast.success(`Code ${messageData.code} verified: ${messageData.message}`);
              break;
            case 'CODE_REJECTED':
              setCodes(prevCodes =>
                prevCodes.map(code =>
                  code.code === messageData.code
                    ? { 
                        ...code, 
                        status: 'rejected',
                        rejectedAt: new Date().toISOString(),
                        rejectionReason: messageData.reason
                      }
                    : code
                )
              );
              toast.error(`Code ${messageData.code} rejected: ${messageData.reason}`);
              break;
            case 'PAYMENT_RECEIVED':
              setCodes(prevCodes =>
                prevCodes.map(code =>
                  code.code === messageData.code
                    ? { 
                        ...code, 
                        status: 'paid',
                        paidAmount: messageData.amount,
                        paidAt: new Date().toISOString(),
                        transactionId: messageData.transactionId
                      }
                    : code
                )
              );
              toast.success(`Payment of ${messageData.amount} received for code ${messageData.code}!`);
              break;
            case 'PAYMENT_FAILED':
              setCodes(prevCodes =>
                prevCodes.map(code =>
                  code.code === messageData.code
                    ? { 
                        ...code, 
                        status: 'payment_failed',
                        failureReason: messageData.reason
                      }
                    : code
                )
              );
              toast.error(`Payment failed for code ${messageData.code}: ${messageData.reason}`);
              break;
            case 'CODE_PROCESSING':
              setCodes(prevCodes =>
                prevCodes.map(code =>
                  code.code === messageData.code
                    ? { ...code, status: 'processing' }
                    : code
                )
              );
              toast.loading(`Processing code ${messageData.code}...`);
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      }
    };

    const cleanup = wsManager.addListener(handleWebSocketEvent);
    return cleanup;
  }, []);

  // Filter codes based on current filters
  const filteredCodes = useCallback(() => {
    return codes.filter(code => {
      if (filters.status !== 'all' && code.status !== filters.status) {
        return false;
      }
      if (filters.bookmaker !== 'all' && code.bookmaker !== filters.bookmaker) {
        return false;
      }
      if (filters.dateRange !== 'all') {
        const codeDate = new Date(code.submitted_at);
        const today = new Date();
        switch (filters.dateRange) {
          case 'today':
            return codeDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today.setDate(today.getDate() - 7));
            return codeDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
            return codeDate >= monthAgo;
          default:
            return true;
        }
      }
      return true;
    });
  }, [codes, filters]);

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Get code statistics
  const getStats = useCallback(() => {
    return codes.reduce((stats, code) => {
      stats.total++;
      stats[code.status] = (stats[code.status] || 0) + 1;
      stats.totalStake += parseFloat(code.stake_amount) || 0;
      if (code.status === 'paid') {
        stats.totalPaid += parseFloat(code.paidAmount) || 0;
      }
      return stats;
    }, {
      total: 0,
      pending: 0,
      verified: 0,
      rejected: 0,
      paid: 0,
      totalStake: 0,
      totalPaid: 0
    });
  }, [codes]);

  // Fetch codes with pagination
  const fetchCodes = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const response = await axios.get(`${API_URL}/betting-codes/user/codes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit }
      });

      setCodes(prevCodes => {
        const newCodes = response.data;
        // Remove duplicates and sort by date
        const uniqueCodes = [...new Map([...prevCodes, ...newCodes]
          .map(code => [code.id, code]))
          .values()]
          .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
        return uniqueCodes;
      });
      
      setError(null);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchError = async (error, retryCount) => {
    if (retryCount < MAX_RETRIES && error.response?.status === 429) {
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchCodes(retryCount + 1);
    }

    setError(error.response?.data?.message || 'Failed to fetch codes');
    toast.error('Failed to fetch betting codes');
  };

  const submitCode = async (codeData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const userCountry = user?.country?.toLowerCase() || 'nigeria';

      // Validate betting code format
      const validation = validateBettingCode(
        codeData.code,
        codeData.bookmaker,
        userCountry
      );

      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Get country config for proper currency and limits
      const countryConfig = getCountryConfig(userCountry);
      const bookmakerConfig = countryConfig.bookmakers.find(
        b => b.id === codeData.bookmaker
      );

      if (!bookmakerConfig) {
        throw new Error(`Invalid bookmaker for ${userCountry}`);
      }

      // Validate stake and odds
      const stake = parseFloat(codeData.stake);
      const odds = parseFloat(codeData.odds);

      if (stake < bookmakerConfig.minStake || stake > bookmakerConfig.maxStake) {
        throw new Error(
          `Stake must be between ${countryConfig.currency.format(bookmakerConfig.minStake)} and ${countryConfig.currency.format(bookmakerConfig.maxStake)}`
        );
      }

      if (odds < bookmakerConfig.minOdds || odds > bookmakerConfig.maxOdds) {
        throw new Error(
          `Odds must be between ${bookmakerConfig.minOdds} and ${bookmakerConfig.maxOdds}`
        );
      }

      // Format the data for the API
      const formattedData = {
        bookmaker: codeData.bookmaker,
        code: validation.formattedCode,
        stake_amount: stake,
        total_odds: odds,
        potential_winnings: stake * odds,
        user_id: user?.id,
        country: userCountry,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        // Country-specific routing
        admin_country: userCountry,
        routing_key: `betting_codes.${userCountry}`,
        currency: countryConfig.currency.code
      };

      const response = await axios.post(
        `${API_URL}/api/v1/betting-codes/submit`,
        formattedData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Country': userCountry,
            'X-Currency': countryConfig.currency.code
          }
        }
      );

      // Update local state with new code
      setCodes(prevCodes => [response.data, ...prevCodes]);
      toast.success(`Code submitted successfully in ${countryConfig.currency.format(stake)}`);

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCodes();
    }
  }, [user]);

  return {
    codes: filteredCodes(),
    loading,
    error,
    submitCode,
    refreshCodes: fetchCodes,
    isConnected: wsManager.isConnected,
    connectionError: wsManager.connectionError,
    connectionStatus: wsManager.connectionStatus,
    filters,
    updateFilters,
    stats: getStats(),
    hasMore: codes.length
  };
}; 