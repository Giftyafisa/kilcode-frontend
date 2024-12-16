import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCreditCard, FaLock, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import { useCountryConfig } from '../../../hooks/useCountryConfig';
import { toast } from 'react-hot-toast';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const PaymentModal = ({ code, onClose, onSuccess }) => {
  const { formatCurrency } = useCountryConfig();
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [email, setEmail] = useState('');

  // Get currency based on code's country
  const getCurrencyConfig = () => {
    // Get country from the code or fallback to user's selected country
    const country = code.country?.toLowerCase() || localStorage.getItem('userCountry')?.toLowerCase() || 'ghana';
    
    if (country === 'ghana') {
      return {
        code: 'GHS',
        channels: ['mobile_money', 'card', 'bank'],
        country: 'ghana'
      };
    } else if (country === 'nigeria') {
      return {
        code: 'NGN',
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
        country: 'nigeria'
      };
    }
    // Default to Ghana if country is not recognized
    return {
      code: 'GHS',
      channels: ['mobile_money', 'card', 'bank'],
      country: 'ghana'
    };
  };

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack script loaded successfully');
      setPaystackLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      toast.error('Failed to load payment system');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handlePayment = async () => {
    try {
      if (!paystackLoaded) {
        toast.error('Payment system is still loading. Please try again.');
        return;
      }

      if (!email || !validateEmail(email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (!PAYSTACK_PUBLIC_KEY) {
        console.error('Paystack public key not found');
        toast.error('Payment configuration error. Please contact support.');
        return;
      }

      setLoading(true);
      console.log('Processing payment with Paystack');

      // Generate a unique reference
      const reference = `MKT-${code.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Get currency and payment channels based on code's country
      const currencyConfig = getCurrencyConfig();
      const amount = Math.round(code.price * 100); // Convert to pesewas/kobo

      console.log('Payment config:', {
        currency: currencyConfig.code,
        amount,
        email,
        reference,
        country: currencyConfig.country
      });

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amount,
        currency: currencyConfig.code,
        ref: reference,
        callback: function(response) {
          console.log('Payment complete! Reference:', response.reference);
          onSuccess({ 
            payment_method: 'paystack',
            amount: code.price,
            reference: response.reference,
            email: email,
            currency: currencyConfig.code,
            country: currencyConfig.country // Include country in success callback
          });
          onClose();
        },
        onClose: function() {
          setLoading(false);
          toast('Payment window closed');
        },
        channels: currencyConfig.channels,
        label: 'Pay for Betting Code',
        metadata: {
          code_id: code.id,
          type: 'marketplace_code',
          country: currencyConfig.country,
          custom_fields: [
            {
              display_name: "Code ID",
              variable_name: "code_id",
              value: code.id
            },
            {
              display_name: "Country",
              variable_name: "country",
              value: currencyConfig.country
            }
          ]
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-900 rounded-xl max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Complete Purchase</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg mb-4">
              <div>
                <p className="text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(code.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400">Code ID</p>
                <p className="text-white font-medium">{code.id}</p>
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Your payment receipt will be sent to this email
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="w-full flex items-center p-4 rounded-lg bg-blue-600 text-white">
              <FaCreditCard className="w-6 h-6 mr-3" />
              <div className="text-left flex-1">
                <p className="font-medium">Pay with Card/Bank</p>
                <p className="text-sm text-gray-200">
                  {code.country?.toLowerCase() === 'ghana' 
                    ? 'Pay with Mobile Money or Card' 
                    : 'Pay with Card or Bank Transfer'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center text-gray-400 text-sm mt-6 mb-6">
            <FaLock className="mr-2" />
            <p>Your payment information is secure and encrypted</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePayment}
              disabled={loading || !paystackLoaded || !validateEmail(email)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                loading || !paystackLoaded || !validateEmail(email)
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Processing...' : !paystackLoaded ? 'Loading...' : `Pay ${formatCurrency(code.price)}`}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col items-center mt-4 space-y-2">
            <div className="flex items-center">
              <FaMoneyBillWave className="text-emerald-500 mr-2" />
              <p className="text-sm text-gray-400">
                Money-back guarantee if the code doesn't work
              </p>
            </div>
            <div className="flex items-center">
              <FaHistory className="text-blue-500 mr-2" />
              <p className="text-sm text-gray-400">
                24/7 support for payment issues
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal; 