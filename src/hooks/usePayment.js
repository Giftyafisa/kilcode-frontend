import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCountryConfig } from './useCountryConfig';
import PaystackPop from '@paystack/inline-js';
import toast from 'react-hot-toast';
import axios from 'axios';
import { usePaymentStatus } from './usePaymentStatus';
import { validatePaymentDetails } from '../utils/paymentValidation';

export const usePayment = () => {
  const { user } = useAuth();
  const { config, formatCurrency } = useCountryConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { startPolling, stopPolling } = usePaymentStatus();

  const API_URL = import.meta.env.VITE_API_URL;
  const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  // Nigeria Payment Methods
  const initializePaystack = useCallback(async ({ amount, email, onSuccess }) => {
    try {
      const paystack = new PaystackPop();
      await paystack.newTransaction({
        key: PAYSTACK_KEY,
        email: email || user.email,
        amount: amount * 100,
        currency: 'NGN',
        ref: `tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        callback: async (response) => {
          if (response.status === 'success') {
            await verifyPayment({
              reference: response.reference,
              amount,
              provider: 'paystack'
            });
            onSuccess?.(response);
          }
        },
        onClose: () => {
          toast.error('Payment cancelled');
        }
      });
    } catch (error) {
      console.error('Paystack error:', error);
      throw new Error('Payment initialization failed');
    }
  }, [user, PAYSTACK_KEY]);

  // Ghana Payment Methods
  const initiateMobileMoney = useCallback(async ({ amount, phone, provider, onSuccess }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Validate phone number
      if (!phone) {
        throw new Error('Phone number is required');
      }

      // Validate and parse amount
      let numericAmount;
      try {
        numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          throw new Error('Amount must be greater than 0');
        }
      } catch (error) {
        throw new Error('Invalid amount');
      }

      // Format phone number
      const formattedPhone = phone.startsWith('+233') 
        ? phone 
        : `+233${phone.replace(/^0+/, '')}`;

      const paymentData = {
        amount: numericAmount,
        phone: formattedPhone,
        provider: provider,
        currency: 'GHS',
        type: 'withdrawal'
      };

      console.log('Initiating mobile money payment:', paymentData);

      const response = await axios.post(
        `${API_URL}/payments/initiate`,
        paymentData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data?.status === 'pending') {
        toast.success('Payment initiated. Please check your phone for the prompt.');
        if (response.data?.reference) {
          startPolling(response.data.reference);
        }
        onSuccess?.(response.data);
      }

      return response.data;

    } catch (error) {
      console.error('Mobile Money Error:', error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Mobile money payment failed';
      
      toast.error(String(errorMessage));
      throw new Error(String(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [API_URL, startPolling]);

  // Common Functions
  const verifyPayment = async ({ reference, amount, provider }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/payments/verify`, 
        { reference, amount, provider },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Payment successful!');
    } catch (error) {
      toast.error('Payment verification failed');
      throw error;
    }
  };

  // Add USSD Payment Method for Nigeria
  const initiateUSSD = useCallback(async ({ amount, bankCode, onSuccess }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/payments/ussd/initiate`,
        { amount, bankCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('USSD payment initiated');
      onSuccess?.(response.data);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'USSD initiation failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add OPay Payment Method for Nigeria
  const initiateOpay = useCallback(async ({ amount, phone, onSuccess }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/payments/opay/initiate`,
        { amount, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Please check your OPay app to complete payment');
      onSuccess?.(response.data);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'OPay payment failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Airtel Money and Zeepay for Ghana
  const initiateZeepay = useCallback(async ({ amount, phone, onSuccess }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/payments/zeepay/initiate`,
        { amount, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Please check your Zeepay app to complete payment');
      onSuccess?.(response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Zeepay payment failed';
      
      console.error('Zeepay Error:', error);
      toast.error(String(errorMessage));
      throw new Error(String(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  // Update the initiatePayment method to include new payment methods
  const initiatePayment = useCallback(async ({ amount, method, details, onSuccess }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Validate phone for mobile money methods
      if (['mtn_momo', 'vodafone_cash', 'airteltigo'].includes(method)) {
        if (!details?.phone) {
          throw new Error('Phone number is required');
        }
        // Format phone number
        details.phone = details.phone.startsWith('+233') 
          ? details.phone 
          : `+233${details.phone.replace(/^0+/, '')}`;
      }

      const response = await axios.post(
        `${API_URL}/payments/initiate`,
        {
          amount: parseFloat(amount),
          payment_method: method,
          phone: details?.phone,
          description: `Withdrawal of ${amount}`,
          type: 'withdrawal'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.status === 'pending') {
        toast.success('Withdrawal request submitted for admin verification');
        if (response.data?.reference) {
          startPolling(response.data.reference);
        }
        onSuccess?.(response.data);
      }

      return response.data;

    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Payment failed';
      
      console.error('Payment Error:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API_URL, startPolling]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    initiatePayment,
    loading,
    error,
    supportedMethods: config.paymentMethods[user?.country?.toLowerCase()]
  };
}; 