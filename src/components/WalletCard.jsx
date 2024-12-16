import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCountryConfig } from '../hooks/useCountryConfig';
import { FaWallet, FaMoneyBillWave } from 'react-icons/fa';
import PaymentModal from './PaymentModal';
import { useTransactions } from '../hooks/useTransactions';

function WalletCard() {
  const { user } = useAuth();
  const { config, formatCurrency } = useCountryConfig();
  const { balance, refreshTransactions, loading, error } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);

  // Update display balance whenever actual balance changes
  useEffect(() => {
    console.log('Balance changed:', balance);
    setDisplayBalance(balance);
  }, [balance]);

  // Memoize the refresh function to prevent infinite updates
  const refreshData = useCallback(async () => {
    const now = Date.now();
    // Only refresh if more than 1 second has passed since last refresh
    if (now - lastRefreshTime > 1000) {
      console.log('Refreshing wallet data...');
      await refreshTransactions(true); // Force refresh
      setLastRefreshTime(now);
    }
  }, [refreshTransactions, lastRefreshTime]);

  // Refresh balance on mount and when component updates
  useEffect(() => {
    console.log('Setting up wallet refresh...');
    refreshData();
  }, [refreshData]);

  // Set up periodic refresh
  useEffect(() => {
    console.log('Setting up periodic refresh...');
    const interval = setInterval(() => {
      console.log('Periodic wallet refresh...');
      refreshData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refreshData]);

  // Listen for custom balance update events
  useEffect(() => {
    const handleBalanceUpdate = (event) => {
      console.log('Received balance update event:', event.detail);
      refreshData();
    };

    window.addEventListener('wallet-balance-updated', handleBalanceUpdate);
    return () => window.removeEventListener('wallet-balance-updated', handleBalanceUpdate);
  }, [refreshData]);

  // Force refresh when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing wallet...');
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshData]);

  // Listen for localStorage changes that indicate balance updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'wallet_balance_update') {
        console.log('Detected balance update in storage, refreshing...');
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshData]);

  const handleWithdraw = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    refreshData(); // Refresh after modal closes
  };

  const handleWithdrawSuccess = () => {
    setIsModalOpen(false);
    refreshData(); // Force refresh after withdrawal
  };

  // Get withdrawal rules from config
  const withdrawalRules = config.transactionRules.withdrawal;
  const withdrawalMethod = config.paymentMethods.withdrawal[0];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaWallet className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Wallet Balance</h2>
              <p className="text-sm text-gray-500">
                Available for withdrawal
              </p>
            </div>
          </div>
          <div>
            {loading ? (
              <p className="text-3xl font-bold text-gray-400">Loading...</p>
            ) : error ? (
              <div className="text-red-500 text-sm">{error}</div>
            ) : (
              <p 
                className="text-3xl font-bold text-blue-600 cursor-pointer" 
                onClick={() => refreshData()}
                title="Click to refresh"
              >
                {formatCurrency(displayBalance)}
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleWithdraw}
            disabled={loading || error || displayBalance <= 0}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              loading || error || displayBalance <= 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <FaMoneyBillWave />
            <span>Withdraw Funds</span>
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Min: {formatCurrency(withdrawalRules.minTransaction)} • 
            Max: {formatCurrency(withdrawalRules.maxTransaction)} • 
            Fee: {withdrawalMethod.fee}
          </p>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        closeModal={handleCloseModal}
        onSuccess={handleWithdrawSuccess}
        maxAmount={displayBalance}
        currency={config.currency}
        type="withdrawal"
      />
    </>
  );
}

export default WalletCard; 