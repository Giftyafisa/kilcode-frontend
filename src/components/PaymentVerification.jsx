import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useTransactions } from '../hooks/useTransactions';
import toast from 'react-hot-toast';

function PaymentVerification() {
  const { user, verifyPayment } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const { notify } = useNotifications();
  const { addTransaction } = useTransactions();
  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!PAYSTACK_PUBLIC_KEY) {
      console.error('Paystack public key is missing');
    } else {
      console.log('Paystack key loaded:', PAYSTACK_PUBLIC_KEY.slice(0, 10) + '...');
    }
  }, [PAYSTACK_PUBLIC_KEY]);

  const getPaymentConfig = () => {
    if (!user?.country) return null;
    
    const country = user.country.toLowerCase();
    if (country === 'ghana') {
      return {
        amount: 20000, // GHS 200 in pesewas
        currency: 'GHS',
        formatted: 'GHS 200.00',
        channels: ['mobile_money', 'card', 'bank'],
        description: 'One-time registration fee for Kilcode platform access'
      };
    } else {
      return {
        amount: 2192700, // NGN 21,927 in kobo
        currency: 'NGN',
        formatted: '₦21,927.00',
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
        description: 'One-time registration fee for Kilcode platform access'
      };
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      console.log('Payment callback response:', response);
      if (!response.reference) {
        toast.error('No payment reference received');
        return;
      }

      if (response.status !== 'success') {
        toast.error('Payment was not successful');
        return;
      }

      setLoading(true);
      const result = await verifyPayment(response.reference);
      
      if (result.success) {
        toast.success('Registration payment successful!');
        setTimeout(() => {
          if (result.redirect) {
            navigate(result.redirect);
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      } else {
        toast.error(result.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment. Please contact support with reference: ' + response.reference);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    try {
      if (!PAYSTACK_PUBLIC_KEY) {
        toast.error('Payment configuration error');
        console.error('Missing Paystack public key');
        return;
      }

      if (!paystackLoaded || !window.PaystackPop) {
        toast.error('Payment system is initializing. Please try again.');
        return;
      }

      setLoading(true);
      const config = getPaymentConfig();
      if (!config) {
        toast.error('Unable to determine payment configuration');
        setLoading(false);
        return;
      }
      
      console.log('Payment config:', config);

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: config.amount,
        currency: config.currency,
        channels: config.channels,
        ref: `KLC-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        metadata: {
          user_id: user.id,
          country: user.country,
          custom_fields: [
            {
              display_name: "Registration Fee",
              variable_name: "registration_fee",
              value: config.formatted
            }
          ]
        },
        callback: function(response) {
          console.log('Paystack callback response:', response);
          if (response.status === 'success') {
            handlePaymentSuccess(response);
          } else {
            notify('payment', 'failed', {
              amount: config.formatted
            });
            toast.error('Payment was not successful');
            setLoading(false);
          }
        },
        onClose: function() {
          setLoading(false);
          notify('payment', 'failed', {
            amount: config.formatted
          });
          toast.error('Payment cancelled. Please try again.');
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      notify('payment', 'failed', {
        amount: getPaymentConfig()?.formatted || 'Unknown amount'
      });
      toast.error('Failed to initialize payment');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p>Please wait while we initialize your payment...</p>
      </div>
    );
  }

  const config = getPaymentConfig();
  if (!config) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>Unable to determine payment configuration. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Complete Registration</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
        <p className="text-sm text-blue-800">
          To access Kilcode's betting code submission platform, a one-time registration fee is required.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Registration Fee:</h3>
        <p className="text-3xl font-bold text-blue-600 mb-2">
          {config.formatted}
        </p>
        <p className="text-sm text-gray-600">
          {config.description}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Available Payment Methods:</h3>
        <ul className="list-disc list-inside space-y-1">
          {user.country?.toLowerCase() === 'ghana' ? (
            <>
              <li>Mobile Money (MTN, Vodafone, AirtelTigo)</li>
              <li>Bank Cards (Visa, Mastercard)</li>
              <li>Bank Transfer</li>
            </>
          ) : (
            <>
              <li>Bank Cards (Visa, Mastercard, Verve)</li>
              <li>Bank Transfer (instant)</li>
              <li>USSD Banking</li>
            </>
          )}
        </ul>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || !paystackLoaded}
        className={`w-full py-3 px-4 rounded-md text-white font-semibold ${
          loading || !paystackLoaded
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}

export default PaymentVerification;