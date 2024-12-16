import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaCheckCircle, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';
import { marketplaceService } from '../../../services/marketplaceService';
import { useCountryConfig } from '../../../hooks/useCountryConfig';
import { toast } from 'react-hot-toast';

const MarketplaceIntegration = ({ code, onClose }) => {
  const { config, formatCurrency } = useCountryConfig();
  const [loading, setLoading] = useState(false);
  const [marketplaceData, setMarketplaceData] = useState({
    price: '',
    description: '',
    tags: [],
    winProbability: code.win_probability || 0,
    expectedOdds: code.expected_odds || 0,
    minStake: '',
    isPublished: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMarketplaceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !marketplaceData.tags.includes(newTag)) {
        setMarketplaceData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        e.target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setMarketplaceData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!marketplaceData.price || !marketplaceData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate price
      if (parseFloat(marketplaceData.price) <= 0) {
        toast.error('Price must be greater than 0');
        return;
      }

      const response = await marketplaceService.publishCode(code.id, {
        ...marketplaceData,
        price: parseFloat(marketplaceData.price),
        minStake: parseFloat(marketplaceData.minStake) || 0,
        isPublished: true
      });

      if (response.success) {
        toast.success('Code published to marketplace successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error publishing to marketplace:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || String(error) || 'Failed to publish code to marketplace';
      toast.error(String(errorMessage));
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-2xl font-bold text-white">Publish to Marketplace</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Code Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-400 mb-2">
                <FaChartLine className="mr-2" />
                Win Probability
              </div>
              <div className="text-2xl font-bold text-white">
                {marketplaceData.winProbability}%
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-400 mb-2">
                <FaMoneyBillWave className="mr-2" />
                Expected Odds
              </div>
              <div className="text-2xl font-bold text-white">
                {marketplaceData.expectedOdds}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-400 mb-2">
                <FaCheckCircle className="mr-2" />
                Status
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                Verified
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {config.currency.symbol}
                </span>
                <input
                  type="number"
                  name="price"
                  value={marketplaceData.price}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white px-10 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Minimum Stake</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {config.currency.symbol}
                </span>
                <input
                  type="number"
                  name="minStake"
                  value={marketplaceData.minStake}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white px-10 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter minimum stake"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={marketplaceData.description}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Enter description"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Tags</label>
              <input
                type="text"
                onKeyDown={handleTagInput}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Type and press Enter to add tags"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {marketplaceData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
              <div className="flex items-center text-yellow-400">
                <FaExclamationTriangle className="mr-2" />
                <p>Once published, the code will be available for purchase in the marketplace.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePublish}
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Publishing...' : 'Publish to Marketplace'}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MarketplaceIntegration; 