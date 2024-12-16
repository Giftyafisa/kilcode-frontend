import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Pagination from '../common/Pagination';
import { wsManager } from '../../utils/websocketManager';
import { FaClock, FaCheck, FaTimes, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { OfflineStorage } from '../../utils/offlineStorage';
import { SyncManager } from '../../utils/syncManager';
import { useNotifications } from '../../hooks/useNotifications';
import { bettingService } from '../../services/bettingService';
import { getCountryConfig } from '../../config/countryConfig';

const API_URL = import.meta.env.VITE_API_URL;

function BettingCodeHistory() {
  const { user } = useAuth();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, won, lost
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineCodes, setOfflineCodes] = useState([]);
  const { notify } = useNotifications();
  const countryConfig = getCountryConfig(user?.country || 'ghana');

  const handlePageChange = (page, newItemsPerPage = itemsPerPage) => {
    setCurrentPage(page);
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    }
    fetchCodes();
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  useEffect(() => {
    fetchCodes();
    
    // Listen for WebSocket updates
    const handleWebSocketEvent = (type, data) => {
      if (type === 'message') {
        switch (data.type) {
          case 'CODE_STATUS_UPDATE':
            setCodes(prevCodes => 
              prevCodes.map(code => 
                code.id === data.codeId 
                  ? { 
                      ...code, 
                      status: data.status, 
                      message: data.message,
                      admin_note: data.note,
                      verified_at: new Date().toISOString()
                    }
                  : code
              )
            );
            toast.success(`Code ${data.code} status updated to ${data.status}`);
            break;
          case 'CODE_VERIFIED':
            fetchCodes(); // Refresh the list
            break;
        }
      }
    };

    const unsubscribe = wsManager.addListener(handleWebSocketEvent);
    return () => unsubscribe();
  }, [filter, currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      
      const pendingCodes = await OfflineStorage.getPendingBettingCodes();
      setOfflineCodes(pendingCodes);

      if (!navigator.onLine) {
        setCodes(pendingCodes);
        setTotalItems(pendingCodes.length);
        return;
      }

      const response = await bettingService.getBettingCodes({
        page: currentPage,
        limit: itemsPerPage,
        sort: sortField,
        direction: sortDirection
      });

      // Combine offline and online codes, removing duplicates
      const allCodes = [...pendingCodes];
      response.items.forEach(onlineCode => {
        if (!allCodes.some(code => code.id === onlineCode.id)) {
          allCodes.push(onlineCode);
        }
      });

      // Sort codes by date
      allCodes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setCodes(allCodes);
      setTotalItems(response.total + pendingCodes.length);
    } catch (error) {
      console.error('Error fetching codes:', error);
      toast.error('Failed to load betting codes');
      
      if (!navigator.onLine) {
        const pendingCodes = await OfflineStorage.getPendingBettingCodes();
        setCodes(pendingCodes);
        setTotalItems(pendingCodes.length);
      }
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status, message, verificationStatus, reward }) => {
    const badges = {
      pending: { 
        icon: FaClock, 
        class: 'bg-yellow-100 text-yellow-800', 
        text: 'Pending Verification' 
      },
      processing: { 
        icon: FaSpinner, 
        class: 'bg-blue-100 text-blue-800', 
        text: 'Being Verified',
        animate: 'animate-spin' 
      },
      won: { 
        icon: FaCheck, 
        class: 'bg-green-500 text-white', 
        text: 'Won' 
      },
      lost: { 
        icon: FaTimes, 
        class: 'bg-red-500 text-white', 
        text: 'Lost' 
      },
      rejected: {
        icon: FaExclamationTriangle,
        class: 'bg-red-100 text-red-800',
        text: 'Rejected'
      }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <div className="flex flex-col">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
          <Icon className={`mr-1 h-3 w-3 ${badge.animate || ''}`} />
          {badge.text}
        </span>
        {message && (
          <span className="text-xs text-gray-500 mt-1">{message}</span>
        )}
        {verificationStatus?.message && (
          <span className="text-xs text-blue-500 mt-1">
            {verificationStatus.message}
          </span>
        )}
        {status === 'won' && reward && (
          <span className="text-xs text-green-600 font-semibold mt-1">
            Reward: {countryConfig.currency.format(reward)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {(isOffline || isSyncing) && (
        <div className={`mb-4 p-3 rounded-md ${
          isOffline ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {isOffline ? (
            <p className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              You are offline. Some features may be limited.
            </p>
          ) : (
            <p className="flex items-center">
              <FaSpinner className="mr-2 animate-spin" />
              Syncing your betting codes...
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-4 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Codes</option>
            <option value="pending">Pending</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

          <input
            type="search"
            placeholder="Search codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : codes.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No betting codes found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bookmaker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Odds
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stake
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Potential Win
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {codes.map((code) => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.bookmaker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono">
                    {code.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.odds}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {countryConfig.currency.format(code.stake)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {countryConfig.currency.format(code.potential_winnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge 
                      status={code.status} 
                      message={code.message} 
                      verificationStatus={code.verificationStatus}
                      reward={code.status === 'won' ? code.odds * 2 : null}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {code.admin_note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && codes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}
    </div>
  );
}

export default BettingCodeHistory; 