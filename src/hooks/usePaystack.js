import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaystackService } from '../services/paystackService';

export const usePaystack = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

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
      throw new Error('Failed to load payment system');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const getPaymentConfig = (type = 'registration') => {
    const isGhana = user?.country?.toLowerCase() === 'ghana';
    
    const configs = {
      registration: {
        amount: isGhana ? 5000 : 2000, // GHS 50 or NGN 2000
        currency: isGhana ? 'GHS' : 'NGN',
        channels: isGhana ? 
          ['mobile_money', 'card', 'bank'] : 
          ['card', 'bank', 'ussd', 'bank_transfer']
      },
      marketplace: {
        currency: isGhana ? 'GHS' : 'NGN',
        channels: isGhana ? 
          ['mobile_money', 'card', 'bank'] : 
          ['card', 'bank', 'ussd', 'bank_transfer']
      }
    };

    return configs[type] || configs.registration;
  };

  const initializePayment = async (data) => {
    if (!PAYSTACK_PUBLIC_KEY) {
      throw new Error('Payment configuration error: Missing Paystack public key');
    }

    if (!paystackLoaded || !window.PaystackPop) {
      throw new Error('Payment system is initializing. Please try again.');
    }

    setLoading(true);
    try {
      const pendingPurchase = localStorage.getItem('pendingMarketplacePurchase');
      const isMarketplace = pendingPurchase || data.metadata?.payment_type === 'marketplace_code';
      const config = getPaymentConfig(isMarketplace ? 'marketplace' : 'registration');

      // Convert amount to minor units (pesewas/kobo)
      const amountInMinor = Math.round(data.amount * 100);

      const paymentConfig = {
        key: PAYSTACK_PUBLIC_KEY,
        email: data.email,
        amount: amountInMinor,
        currency: data.currency,
        ref: data.reference,
        callback_url: data.callback_url || `${window.location.origin}/payment/verify`,
        metadata: {
          user_id: user.id,
          country: user.country,
          payment_type: isMarketplace ? 'marketplace_code' : 'registration',
          ...data.metadata
        },
        channels: data.channels || config.channels,
        onClose: () => {
          setLoading(false);
          throw new Error('Payment cancelled');
        }
      };

      console.log('Initializing Paystack with config:', {
        ...paymentConfig,
        key: 'REDACTED'
      });

      const handler = window.PaystackPop.setup(paymentConfig);
      handler.openIframe();

      return {
        success: true,
        reference: paymentConfig.ref
      };
    } catch (error) {
      console.error('Paystack initialization error:', error);
      return {
        success: false,
        error: error.message || 'Payment initialization failed'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    initializePayment
  };
}; 