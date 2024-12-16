import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { usePayment } from '../hooks/usePayment';
import { useAuth } from '../context/AuthContext';
import { FaCreditCard, FaMobileAlt, FaUniversity } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import mtnLogo from '../assets/logos/mtn-logo.png';
import vodafoneLogo from '../assets/logos/vodafone-logo.png';
import airteltigoLogo from '../assets/logos/airteltigo-logo.png';

// Move icons to a separate mapping object
const PAYMENT_ICONS = {
  paystack: {
    icon: FaCreditCard,
    color: 'text-green-600'
  },
  bank_transfer: {
    icon: FaUniversity,
    color: 'text-blue-600'
  },
  mtn_momo: {
    icon: () => <img src={mtnLogo} alt="MTN" className="h-8 w-8 object-contain" />,
    color: 'text-yellow-500'
  },
  vodafone_cash: {
    icon: () => <img src={vodafoneLogo} alt="Vodafone" className="h-8 w-8 object-contain" />,
    color: 'text-red-600'
  },
  airteltigo: {
    icon: () => <img src={airteltigoLogo} alt="AirtelTigo" className="h-8 w-8 object-contain" />,
    color: 'text-blue-600'
  }
};

const countryConfig = {
  nigeria: {
    currency: '₦',
    paymentMethods: [
      {
        id: 'paystack',
        title: 'Pay with Card (Paystack)',
        description: 'Instant withdrawal to your bank account'
      },
      {
        id: 'bank_transfer',
        title: 'Bank Transfer',
        description: 'Direct bank transfer (NGN)'
      }
    ]
  },
  ghana: {
    currency: 'GH₵',
    paymentMethods: [
      {
        id: 'mtn_momo',
        title: 'MTN Mobile Money',
        description: 'Withdraw to your MTN MoMo wallet',
        requiresPhone: true
      },
      {
        id: 'vodafone_cash',
        title: 'Vodafone Cash',
        description: 'Withdraw to your Vodafone Cash wallet',
        requiresPhone: true
      },
      {
        id: 'airteltigo',
        title: 'AirtelTigo Money',
        description: 'Withdraw to your AirtelTigo Money wallet',
        requiresPhone: true
      }
    ]
  }
};

// Add this at the top with other constants
const WITHDRAWAL_LIMITS = {
  ghana: 150,    // 150 cedis minimum
  nigeria: 16000 // 16,000 naira minimum
};

function PaymentModal({ 
  isOpen, 
  closeModal, 
  onSuccess,
  maxAmount = 0,
  currency
}) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { initiatePayment, loading } = usePayment();

  const config = countryConfig[user?.country] || countryConfig.nigeria;
  const minAmount = WITHDRAWAL_LIMITS[user?.country?.toLowerCase()] || 0;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    setError('');
  };

  const handlePaymentMethod = async (methodId) => {
    try {
      setError('');

      // Amount validation
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (amount < minAmount) {
        throw new Error(`Minimum withdrawal amount is ${currency?.symbol}${minAmount.toLocaleString()}`);
      }
      if (amount > maxAmount) {
        throw new Error('Amount exceeds available balance');
      }

      // Phone validation for mobile money methods
      if (['mtn_momo', 'vodafone_cash', 'airteltigo'].includes(methodId)) {
        if (!phone) {
          throw new Error('Phone number is required');
        }
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 9) {
          throw new Error('Please enter a valid 9-digit phone number');
        }
      }

      await initiatePayment({
        amount,
        method: methodId,
        details: {
          phone: `+233${phone.replace(/\D/g, '')}`,
          provider: methodId
        },
        onSuccess: () => {
          onSuccess?.();
          closeModal();
        }
      });
    } catch (error) {
      console.error('Payment Error:', error);
      // Improve error handling
      const errorMessage = error?.response?.data?.message || error.message || 'Payment failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const renderIcon = (methodId) => {
    const IconComponent = PAYMENT_ICONS[methodId]?.icon;
    return IconComponent ? <IconComponent /> : null;
  };

  // Safe formatting function
  const formatAmount = (amount) => {
    try {
      const num = parseFloat(amount);
      return !isNaN(num) ? num.toLocaleString() : '0';
    } catch (error) {
      return '0';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Withdraw Funds
              </Dialog.Title>

              <div className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ({currency?.symbol || 'GH₵'})
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Min: ${currency?.symbol || 'GH₵'}${minAmount}`}
                    min={minAmount}
                    max={maxAmount}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Available: {currency?.symbol || 'GH₵'}{formatAmount(maxAmount)}
                  </p>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                      +233
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="XX XXX XXXX"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Enter number without country code</p>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                {/* Payment Methods */}
                <div className="space-y-3">
                  {config.paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethod(method.id)}
                      disabled={loading}
                      className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 flex items-center space-x-3 disabled:opacity-50"
                    >
                      {renderIcon(method.id)}
                      <div>
                        <p className="font-medium">{method.title}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={closeModal}
                  className="w-full justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default PaymentModal;