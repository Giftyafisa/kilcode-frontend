import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCountryConfig } from '../../config/countryConfig';

function BettingConfirmationModal({ isOpen, onClose, onConfirm, data, potentialWinnings }) {
  if (!isOpen) return null;

  const { user } = useAuth();
  const countryConfig = getCountryConfig(user?.country || 'ghana');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Confirm Your Bet</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bookmaker</p>
                <p className="font-medium">{data.bookmaker}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Code</p>
                <p className="font-medium">{data.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stake</p>
                <p className="font-medium">{countryConfig.currency.format(data.stake)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Odds</p>
                <p className="font-medium">{data.odds}</p>
              </div>
            </div>
            
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-600">Potential Winnings</p>
              <p className="text-xl font-bold text-green-600">
                {countryConfig.currency.format(potentialWinnings)}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Please confirm that all details are correct. This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirm Submission
          </button>
        </div>
      </div>
    </div>
  );
}

export default BettingConfirmationModal; 