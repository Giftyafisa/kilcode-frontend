import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import PaymentModal from '../components/PaymentModal';
import TransactionHistory from '../components/TransactionHistory';
import WalletCard from '../components/WalletCard';
import Statistics from '../components/Statistics';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useBettingCodes } from '../hooks/useBettingCodes';
import { useWebSocket } from '../hooks/useWebSocket';
import { Tab } from '@headlessui/react';
import { OfflineStorage } from '../utils/offlineStorage';
import BettingCodeHistory from '../components/betting/BettingCodeHistory';
import { useBetting } from '../context/BettingContext';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <pre className="text-sm text-gray-500 bg-gray-50 p-4 rounded mb-4 overflow-auto">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const userCountry = user?.country?.toLowerCase() || 
                     localStorage.getItem('user_country') || 
                     'nigeria';
  const { codes, loading: codesLoading } = useBettingCodes();
  const { 
    transactions, 
    balance, 
    loading: transactionsLoading, 
    addTransaction,
    refreshTransactions,
    updateBalance 
  } = useTransactions();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const { 
    isConnected, 
    connectionError, 
    isWebSocketAvailable, 
    connectionStatus,
    reconnect,
    isOnline,
    isSyncing,
    synchronize 
  } = useWebSocket();
  const [offlineData, setOfflineData] = useState([]);
  const { state: bettingState } = useBetting();

  const getConnectionStatusMessage = (status) => {
    switch (status) {
      case 'initializing':
        return 'Initializing connection...';
      case 'connecting':
        return 'Connecting to server...';
      case 'connected':
        return 'Connected to real-time updates';
      case 'disconnected':
        return 'Disconnected from server';
      case 'polling':
        return 'Using backup connection mode';
      case 'error':
        return 'Connection error occurred';
      case 'server-down':
        return 'Server is currently unavailable';
      case 'unauthorized':
        return 'Please log in to connect';
      default:
        return 'Unknown connection status';
    }
  };

  // Calculate statistics
  const stats = {
    winRate: codes.length ? 
      ((codes.filter(c => c.status === 'won').length / codes.filter(c => c.status !== 'pending').length) * 100).toFixed(1) : 
      0,
    totalWon: codes
      .filter(c => c.status === 'won')
      .reduce((sum, c) => sum + (c.potential_winnings || 0), 0),
    totalLost: codes.filter(c => c.status === 'lost').length,
    pending: codes.filter(c => c.status === 'pending').length
  };

  // Load offline data
  useEffect(() => {
    const loadOfflineData = async () => {
      const cache = await OfflineStorage.getCache();
      setOfflineData(cache);
    };
    loadOfflineData();
  }, []);

  const handleBalanceUpdate = (newBalance) => {
    updateBalance(newBalance);
  };

  const handleTransactionUpdate = (newTransaction) => {
    addTransaction(newTransaction);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 animate-slideIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {getConnectionStatusMessage(connectionStatus)}
                {connectionError && ` - ${connectionError}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics and Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideUp">
        <div className="lg:col-span-2">
          <Statistics stats={stats} />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300">
          <WalletCard />
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-slideUp delay-200">
        <Tab.Group>
          <Tab.List className="flex space-x-1 bg-gradient-to-r from-blue-600 to-blue-800 p-2">
            {[
              { name: 'Dashboard', count: null },
              { name: 'Transactions', count: null },
              { name: 'Betting Codes', count: bettingState.pendingCodes.length }
            ].map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200
                  ${selected
                    ? 'bg-white text-blue-700 shadow-md transform scale-105'
                    : 'text-white hover:bg-white/[0.12] hover:text-white'
                  } flex items-center justify-center space-x-2`
                }
              >
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-500 text-white animate-pulse">
                    {tab.count}
                  </span>
                )}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-4">
            <Tab.Panel>
              <div className="space-y-8 p-4">
                {/* Recent Submissions */}
                <BettingCodeHistory codes={codes.slice(0, 5)} loading={codesLoading} />
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="p-4">
                <TransactionHistory 
                  transactions={transactions} 
                  onTransactionUpdate={handleTransactionUpdate} 
                />
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="p-4">
                <BettingCodeHistory codes={codes} loading={codesLoading} />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handleBalanceUpdate}
      />
    </div>
  );
}

function Dashboard() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DashboardContent />
    </ErrorBoundary>
  );
}

export default Dashboard;