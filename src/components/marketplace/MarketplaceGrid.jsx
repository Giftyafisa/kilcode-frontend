import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaClock, FaMoneyBillWave, FaTag, FaStar, FaCheckCircle } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { useCountryConfig } from '../../hooks/useCountryConfig';

const MarketplaceGrid = ({ 
  codes, 
  countryConfig, 
  onPurchase, 
  onPreview,
  loading = false
}) => {
  const { formatCurrency } = useCountryConfig();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-xl p-4 animate-pulse"
          >
            <div className="h-48 bg-gray-700 rounded-lg mb-4" />
            <div className="space-y-3">
              <div className="h-6 bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!codes.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No betting codes available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {codes.map((code) => (
        <motion.div
          key={code.id}
          className="group relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Gradient Border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
          
          {/* Card Content */}
          <div className="relative bg-gray-900 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-600/20 text-blue-400 text-sm font-medium px-3 py-1 rounded-full">
                    {code.bookmaker}
                  </span>
                  {code.verified && (
                    <span className="flex items-center text-emerald-400 text-sm">
                      <FaCheckCircle className="mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="text-white">{code.rating ? code.rating.toFixed(1) : 'N/A'}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{code.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{code.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="flex items-center space-x-2">
                <FaChartLine className="text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Expected Odds</p>
                  <p className="font-medium text-white">{code.expected_odds}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Valid Until</p>
                  <p className="font-medium text-white">{formatDate(code.valid_until)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaMoneyBillWave className="text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500">Min. Stake</p>
                  <p className="font-medium text-white">{formatCurrency(code.min_stake)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaTag className="text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-medium text-white">{code.category || 'General'}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {code.tags && code.tags.length > 0 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {code.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(code.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {code.success_rate}%
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onPurchase(code)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => onPreview(code)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MarketplaceGrid; 