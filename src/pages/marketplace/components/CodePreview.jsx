import React from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaChartLine, FaCalendar, FaClock } from 'react-icons/fa';
import { useCountryConfig } from '../../../hooks/useCountryConfig';
import { toast } from 'react-hot-toast';

const CodePreview = ({ code, onClose, onPurchase }) => {
  const { formatCurrency } = useCountryConfig();

  const handlePurchase = () => {
    // Store the code details for payment
    localStorage.setItem('pendingMarketplacePurchase', JSON.stringify({
      code_id: code.id,
      price: code.price,
      type: 'marketplace_code',
      timestamp: Date.now(),
      from_preview: true
    }));

    console.log('Initiating purchase from preview for code:', code.id);
    onPurchase(code);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-900 rounded-xl max-w-2xl w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Code Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Code Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-400 mb-2">
                <FaChartLine className="mr-2" />
                Win Probability
              </div>
              <div className="text-2xl font-bold text-white">
                {code.win_probability}%
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-400 mb-2">
                <FaCalendar className="mr-2" />
                Event Date
              </div>
              <div className="text-2xl font-bold text-white">
                {new Date(code.event_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Preview Content</h3>
              <span className="text-sm text-gray-400">
                <FaClock className="inline mr-1" />
                {new Date(code.event_date).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Sample preview content */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400">
                  {code.preview_content || 'Preview content is not available for this code.'}
                </p>
              </div>

              {/* Locked content indicator */}
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                <div className="flex items-center text-blue-400">
                  <FaLock className="mr-2" />
                  <p>Purchase this code to view the complete analysis and predictions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePurchase}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Purchase for {formatCurrency(code.price)}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4 text-center">
            This preview is provided as a sample. Full content and analysis available after purchase.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CodePreview; 