import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCountryConfig } from '../../hooks/useCountryConfig';

export default function CountryMobileNav() {
  const { user } = useAuth();
  const { config } = useCountryConfig(user?.country);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-20 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed bottom-0 inset-x-0 pb-2 z-30 transform transition-transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white rounded-t-xl shadow-lg">
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={`/images/avatars/default.png`}
                    alt={user?.name}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    Balance: {config.currency.format(user?.balance)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to="/submit-code"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Submit Code
              </Link>
              <Link
                to="/my-codes"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                My Codes
              </Link>
              <Link
                to="/deposit"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Deposit
              </Link>
              <Link
                to="/withdraw"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Withdraw
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 