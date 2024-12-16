import React, { useEffect } from 'react';
import { useBetting } from '../../context/BettingContext';
import { useCountryConfig } from '../../hooks/useCountryConfig';
import { useAuth } from '../../context/AuthContext';
import { FaClock, FaCheck, FaTimes } from 'react-icons/fa';

function BettingHistory() {
  const { user } = useAuth();
  const { state, fetchBettingHistory, setFilters } = useBetting();
  const { formatCurrency } = useCountryConfig(user?.country);
  const { bettingCodes, loading, pagination, filters } = state;

  useEffect(() => {
    fetchBettingHistory();
  }, [filters]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      case 'won':
        return (
          <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded">
            <FaCheck className="mr-1" /> Won
          </span>
        );
      case 'lost':
        return (
          <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded">
            <FaTimes className="mr-1" /> Lost
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Betting History</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          className="rounded-md border-gray-300"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>

        <select
          className="rounded-md border-gray-300"
          value={filters.bookmaker}
          onChange={(e) => setFilters({ bookmaker: e.target.value })}
        >
          <option value="all">All Bookmakers</option>
          {/* Add your bookmaker options here */}
        </select>

        <select
          className="rounded-md border-gray-300"
          value={filters.dateRange}
          onChange={(e) => setFilters({ dateRange: e.target.value })}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Betting Codes Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Bookmaker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stake
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Odds
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Potential Win
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bettingCodes.map((code) => (
              <tr key={code.id}>
                <td className="px-6 py-4 whitespace-nowrap">{code.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{code.bookmaker}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(code.stake)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{code.odds}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(code.potentialWinnings)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(code.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(code.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {bettingCodes.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            Showing {pagination.currentPage} of {pagination.totalPages} pages
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchBettingHistory(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchBettingHistory(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BettingHistory; 