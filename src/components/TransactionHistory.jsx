import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCountryConfig } from '../hooks/useCountryConfig';
import { wsManager } from '../utils/websocketManager';

function TransactionHistory({ transactions = [], onTransactionUpdate }) {
  const { user } = useAuth();
  const { formatCurrency } = useCountryConfig();

  useEffect(() => {
    // Listen for new transactions from WebSocket
    const unsubscribe = wsManager.addListener((type, data) => {
      if (type === 'message' && data.type === 'CODE_VERIFICATION' && data.data.transaction) {
        // Add the new transaction
        onTransactionUpdate?.(data.data.transaction);
      }
    });

    return () => unsubscribe();
  }, [onTransactionUpdate]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      case 'deposit':
        return 'bg-green-100 text-green-800';
      case 'reward':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'withdrawal':
        return 'Withdrawal';
      case 'deposit':
        return 'Deposit';
      case 'reward':
        return 'Bet Reward';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold p-6 border-b">Transaction History</h2>
        <div className="p-6 text-center text-gray-500">
          No transactions found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold p-6 border-b">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id || transaction.reference}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(transaction.type)}`}>
                    {getTypeLabel(transaction.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionHistory;