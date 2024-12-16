import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCountryConfig } from '../../hooks/useCountryConfig';
import { FaUsers, FaMoneyBillWave, FaTicketAlt, FaChartLine } from 'react-icons/fa';

export default function CountryDashboard() {
  const { user } = useAuth();
  const { config } = useCountryConfig(user?.country);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    totalPayouts: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [user.country]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/v1/admin/stats?country=${user.country}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {user.country} Dashboard
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaUsers className="h-6 w-6" />}
          title="Total Users"
          value={stats.totalUsers}
          loading={loading}
        />
        <StatCard
          icon={<FaTicketAlt className="h-6 w-6" />}
          title="Total Bets"
          value={stats.totalBets}
          loading={loading}
        />
        <StatCard
          icon={<FaMoneyBillWave className="h-6 w-6" />}
          title="Total Payouts"
          value={config.currency.format(stats.totalPayouts)}
          loading={loading}
        />
        <StatCard
          icon={<FaChartLine className="h-6 w-6" />}
          title="Success Rate"
          value={`${((stats.totalBets > 0 ? stats.successfulBets / stats.totalBets : 0) * 100).toFixed(1)}%`}
          loading={loading}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  currency={config.currency}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, loading }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-100 text-primary-600">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xl font-semibold text-gray-900">
            {loading ? '...' : value}
          </p>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction, currency }) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">
            {transaction.userName}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
          ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 
          transaction.type === 'withdrawal' ? 'bg-blue-100 text-blue-800' : 
          'bg-gray-100 text-gray-800'}`}>
          {transaction.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {currency.format(transaction.amount)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
          ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'}`}>
          {transaction.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(transaction.date).toLocaleDateString()}
      </td>
    </tr>
  );
} 