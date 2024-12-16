import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCountryConfig } from './useCountryConfig';
import { useTransactions } from './useTransactions';
import toast from 'react-hot-toast';
import axios from 'axios';

export const usePaymentProcessor = () => {
  const { user } = useAuth();
  const { config } = useCountryConfig(user?.country);
  const { transactions } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Nigeria Payment Methods
  const processPaystack = useCallback(async (amount, email) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/paystack/initialize`,
        { amount, email },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      return response.data;
    } catch (err) {
      throw new Error(`Paystack payment failed: ${err.response?.data?.message || err.message}`);
    }
  }, [API_URL]);

  const processUSSD = useCallback(async (amount, bankCode, phone) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/ussd/initialize`,
        { amount, bankCode, phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      return {
        ussdCode: response.data.ussdCode,
        reference: response.data.reference,
        instructions: response.data.instructions
      };
    } catch (err) {
      throw new Error(`USSD payment failed: ${err.response?.data?.message || err.message}`);
    }
  }, [API_URL]);

  const processOpay = useCallback(async (amount, phone) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/opay/initialize`,
        { amount, phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      return response.data;
    } catch (err) {
      throw new Error(`OPay payment failed: ${err.response?.data?.message || err.message}`);
    }
  }, [API_URL]);

  // Ghana Payment Methods
  const processMobileMoney = useCallback(async (amount, phone, provider) => {
    try {
      const token = localStorage.getItem('token');
      
      // Validate phone number format
      if (!phone.startsWith('+233')) {
        phone = `+233${phone.replace(/^0+/, '')}`;
      }

      const response = await axios.post(
        `${API_URL}/payments/mobile-money/initiate`,
        {
          amount,
          phone,
          provider,
          country: 'ghana'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      throw new Error(`Mobile money payment failed: ${err.response?.data?.message || err.message}`);
    }
  }, [API_URL]);

  const processZeepay = useCallback(async (amount, phone) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/zeepay/initialize`,
        { amount, phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      return response.data;
    } catch (err) {
      throw new Error(`Zeepay payment failed: ${err.response?.data?.message || err.message}`);
    }
  }, [API_URL]);

  const processPayment = useCallback(async (amount, method, details, type = 'deposit') => {
    setError(null);
    setLoading(true);

    try {
      // Validate transaction limits
      const validationResult = validateTransaction(amount, type, method, user.country, transactions);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Process based on country and method
      if (user.country.toLowerCase() === 'nigeria') {
        switch (method) {
          case 'paystack':
            return await processPaystack(amount, details.email);
          case 'ussd':
            return await processUSSD(amount, details.bankCode, details.phone);
          case 'opay':
            return await processOpay(amount, details.phone);
          case 'bank_transfer':
            return await processBankTransfer(amount, details.bankCode, details.accountNumber);
          default:
            throw new Error('Unsupported payment method');
        }
      } else if (user.country.toLowerCase() === 'ghana') {
        switch (method) {
          case 'mtn_momo':
          case 'vodafone_cash':
          case 'airteltigo':
            return await processMobileMoney(amount, details.phone, method);
          case 'zeepay':
            return await processZeepay(amount, details.phone);
          default:
            throw new Error('Unsupported payment method');
        }
      }
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    user, 
    processPaystack, 
    processUSSD, 
    processOpay, 
    processMobileMoney, 
    processZeepay,
    transactions
  ]);

  return {
    processPayment,
    loading,
    error,
    supportedMethods: config.paymentMethods
  };
}; 