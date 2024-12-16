import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCountryConfig } from '../../hooks/useCountryConfig';

export default function CountryLayout({ children }) {
  const { user } = useAuth();
  const { config } = useCountryConfig(user?.country);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Country-specific header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src={`/images/logos/${user?.country}.png`}
                  alt="Country logo"
                />
                <span className="ml-2 text-lg font-semibold">
                  Kilcode {user?.country.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon */}
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Country-specific main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Country-specific footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Support section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Support
              </h3>
              <div className="mt-4">
                <p className="text-base text-gray-500">
                  {config.support.phone}
                </p>
                <p className="text-base text-gray-500">
                  {config.support.email}
                </p>
                <p className="text-base text-gray-500">
                  {config.support.hours}
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Payment Methods
              </h3>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {config.paymentMethods.deposit.map((method) => (
                  <img
                    key={method.id}
                    src={`/images/payment/${method.id}.png`}
                    alt={method.name}
                    className="h-8"
                  />
                ))}
              </div>
            </div>

            {/* Bookmakers */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Supported Bookmakers
              </h3>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {config.bookmakers.map((bookmaker) => (
                  <img
                    key={bookmaker.id}
                    src={bookmaker.logo}
                    alt={bookmaker.name}
                    className="h-8"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 