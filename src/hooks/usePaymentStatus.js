import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const usePaymentStatus = () => {
  const [status, setStatus] = useState('pending');
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const checkPaymentStatus = useCallback(async (reference) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/payments/status/${reference}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.status;
    } catch (error) {
      console.error('Status check failed:', error);
      throw error;
    }
  }, [API_URL]);

  const startPolling = useCallback(async (reference, options = {}) => {
    const {
      interval = 5000, // 5 seconds
      timeout = 300000, // 5 minutes
      onSuccess,
      onFailure,
      onTimeout
    } = options;

    setPolling(true);
    setStatus('pending');
    const startTime = Date.now();

    const poll = async () => {
      try {
        if (!polling) return;

        // Check if we've exceeded the timeout
        if (Date.now() - startTime > timeout) {
          setPolling(false);
          setError('Payment verification timed out');
          onTimeout?.();
          return;
        }

        const currentStatus = await checkPaymentStatus(reference);
        setStatus(currentStatus);

        switch (currentStatus) {
          case 'completed':
            setPolling(false);
            onSuccess?.();
            toast.success('Payment completed successfully!');
            break;
          case 'failed':
            setPolling(false);
            setError('Payment failed');
            onFailure?.();
            toast.error('Payment failed. Please try again.');
            break;
          case 'cancelled':
            setPolling(false);
            setError('Payment cancelled');
            onFailure?.();
            toast.error('Payment was cancelled');
            break;
          case 'pending':
            // Continue polling
            setTimeout(poll, interval);
            break;
          default:
            setPolling(false);
            setError(`Unknown payment status: ${currentStatus}`);
            onFailure?.();
            toast.error('Payment status unknown');
        }
      } catch (error) {
        console.error('Polling error:', error);
        setError(error.message);
        setTimeout(poll, interval);
      }
    };

    poll();
  }, [checkPaymentStatus]);

  const stopPolling = useCallback(() => {
    setPolling(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setPolling(false);
    };
  }, []);

  return {
    status,
    polling,
    error,
    startPolling,
    stopPolling
  };
}; 