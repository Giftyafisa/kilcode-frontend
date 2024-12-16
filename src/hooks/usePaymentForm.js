import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCountryConfig } from './useCountryConfig';

export const usePaymentForm = (type = 'deposit') => {
  const { user } = useAuth();
  const { config } = useCountryConfig(user?.country);
  const [formData, setFormData] = useState({
    amount: '',
    method: '',
    phone: '',
    email: '',
    bankCode: '',
    accountNumber: ''
  });
  const [errors, setErrors] = useState({});

  // Get available payment methods based on country and type
  const paymentMethods = config.paymentMethods[type] || [];

  const validateForm = () => {
    const newErrors = {};
    const selectedMethod = paymentMethods.find(m => m.id === formData.method);

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (selectedMethod) {
      if (isNaN(amount) || amount < selectedMethod.minAmount) {
        newErrors.amount = `Minimum amount is ${config.currency.format(selectedMethod.minAmount)}`;
      } else if (amount > selectedMethod.maxAmount) {
        newErrors.amount = `Maximum amount is ${config.currency.format(selectedMethod.maxAmount)}`;
      }
    }

    // Country-specific validations
    if (user.country.toLowerCase() === 'ghana') {
      if (['mtn_momo', 'vodafone_cash'].includes(formData.method)) {
        if (!formData.phone) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\+233[0-9]{9}$/.test(formData.phone)) {
          newErrors.phone = 'Invalid Ghana phone number format';
        }
      }
    } else if (user.country.toLowerCase() === 'nigeria') {
      if (formData.method === 'paystack') {
        if (!formData.email) {
          newErrors.email = 'Email is required';
        }
      } else if (formData.method === 'bank_transfer') {
        if (!formData.bankCode) {
          newErrors.bankCode = 'Bank is required';
        }
        if (!formData.accountNumber) {
          newErrors.accountNumber = 'Account number is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    paymentMethods,
    currency: config.currency
  };
}; 