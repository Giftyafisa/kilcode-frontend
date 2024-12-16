import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCountryConfig } from '../../hooks/useCountryConfig';
import { useNotifications } from '../../hooks/useNotifications';
import { FaSpinner } from 'react-icons/fa';
import { usePayment } from '../../hooks/usePayment';

const WITHDRAWAL_LIMITS = {
  ghana: 150,    // 150 cedis minimum
  nigeria: 16000 // 16,000 naira minimum
};

export default function CountryPaymentForm({ type = 'deposit', onSuccess }) {
  const { user } = useAuth();
  const { config } = useCountryConfig(user?.country);
  const { notify } = useNotifications();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { initiatePayment, loading: paymentLoading } = usePayment();
  const [phone, setPhone] = useState('');

  const paymentMethods = config.paymentMethods[type] || [];
  const selectedMethod = paymentMethods.find(m => m.id === method);

  const renderPaymentFields = () => {
    if (method && ['mtn_momo', 'vodafone_cash', 'airteltigo'].includes(method)) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              +233
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-16 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="XX XXX XXXX"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Enter number without country code</p>
        </div>
      );
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setLoading(true);

    try {
      const numAmount = parseFloat(amount);
      if (!selectedMethod) {
        throw new Error('Please select a payment method');
      }

      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (type === 'withdrawal') {
        const minAmount = WITHDRAWAL_LIMITS[user?.country?.toLowerCase()];
        if (numAmount < minAmount) {
          throw new Error(
            `Minimum withdrawal amount is ${config.currency.symbol}${minAmount.toLocaleString()}`
          );
        }
      }

      if (numAmount < selectedMethod.minAmount) {
        throw new Error(`Minimum amount is ${config.currency.format(selectedMethod.minAmount)}`);
      }

      if (numAmount > selectedMethod.maxAmount) {
        throw new Error(`Maximum amount is ${config.currency.format(selectedMethod.maxAmount)}`);
      }

      const paymentDetails = {};
      
      if (['mtn_momo', 'vodafone_cash', 'airteltigo'].includes(method)) {
        if (!phone) {
          throw new Error('Phone number is required');
        }
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 9) {
          throw new Error('Please enter a valid 9-digit phone number');
        }
        paymentDetails.phone = `+233${cleanPhone}`;
      }

      await initiatePayment({
        amount: numAmount,
        method,
        details: paymentDetails,
        onSuccess: () => {
          notify('payment', 'success', { amount: numAmount });
          setAmount('');
          setMethod('');
          setPhone('');
          onSuccess?.();
        }
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      notify('payment', 'failed', { amount: parseFloat(amount) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount ({config.currency.symbol})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          <option value="">Select a payment method</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name} {method.fee ? `(Fee: ${method.fee})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedMethod && (
        <div className="text-sm text-gray-500">
          <p>Processing Time: {selectedMethod.processingTime}</p>
          <p>Min: {config.currency.format(selectedMethod.minAmount)}</p>
          <p>Max: {config.currency.format(selectedMethod.maxAmount)}</p>
        </div>
      )}

      {renderPaymentFields()}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || paymentLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {(loading || paymentLoading) ? (
          <FaSpinner className="animate-spin h-5 w-5" />
        ) : (
          `Proceed with ${type}`
        )}
      </button>
    </form>
  );
} 