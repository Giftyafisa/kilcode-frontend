import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useCountryConfig } from '../../../hooks/useCountryConfig';

function BookmakerPage({ bookmaker }) {
  const { user } = useAuth();
  const { config, formatCurrency } = useCountryConfig(user?.country);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  const bookmakerConfig = config?.bookmakers?.find(b => b.id === bookmaker) || {};

  useEffect(() => {
    // Here you would fetch codes specific to this bookmaker
    // For now, using sample data
    const sampleCodes = [
      {
        id: 1,
        title: `${bookmakerConfig.name} Premium Accumulator`,
        description: 'High-confidence selections with detailed analysis',
        price: 5000,
        rating: 4.8,
        reviews: 124,
        success_rate: '87%',
        bookmaker: bookmaker,
        predictor: {
          name: 'Expert Predictor',
          verified: true,
          success_rate: '92%'
        }
      },
      // Add more sample codes
    ];

    setCodes(sampleCodes);
    setLoading(false);
  }, [bookmaker, bookmakerConfig.name]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-900 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bookmaker Header */}
        <motion.div
          className="text-center mb-12"
          variants={containerVariants}
        >
          <div className="flex justify-center mb-6">
            <img
              src={bookmakerConfig.logo}
              alt={bookmakerConfig.name}
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {bookmakerConfig.name} Betting Codes
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Access verified betting codes specifically for {bookmakerConfig.name}. All codes follow the format {bookmakerConfig.codeFormat}.
          </p>
        </motion.div>

        {/* Bookmaker Info Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
        >
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-2">Code Format</h3>
            <p className="text-gray-400">{bookmakerConfig.codeFormat}</p>
            <p className="text-sm text-gray-500 mt-2">Example: {bookmakerConfig.codeExample}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-2">Stake Limits</h3>
            <p className="text-gray-400">
              Min: {formatCurrency(bookmakerConfig.minStake)}<br />
              Max: {formatCurrency(bookmakerConfig.maxStake)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-2">Odds Range</h3>
            <p className="text-gray-400">
              Min: {bookmakerConfig.minOdds}<br />
              Max: {bookmakerConfig.maxOdds}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-wrap gap-4 mb-8 justify-between items-center"
          variants={containerVariants}
        >
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              All Codes
            </button>
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'trending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'verified'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              Verified Only
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700"
          >
            <option value="popularity">Sort by Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="success-rate">Success Rate</option>
          </select>
        </motion.div>

        {/* Codes Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading codes...</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {codes.map((code) => (
              <motion.div
                key={code.id}
                className="bg-gray-800/50 rounded-xl overflow-hidden"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <span className="text-emerald-400 mr-1">★</span>
                      <span className="text-white">{code.rating}</span>
                    </div>
                    <span className="text-emerald-400 text-sm">
                      Success Rate: {code.success_rate}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {code.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {code.description}
                  </p>

                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                      <span className="text-sm font-medium text-white">
                        {code.predictor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-white flex items-center">
                        {code.predictor.name}
                        {code.predictor.verified && (
                          <svg className="w-4 h-4 text-blue-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        )}
                      </p>
                      <p className="text-xs text-emerald-400">
                        Success Rate: {code.predictor.success_rate}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-xs">Price</p>
                      <p className="text-white font-bold">
                        {formatCurrency(code.price)}
                      </p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Additional Information */}
        <motion.div
          className="mt-12 bg-gray-800/50 rounded-xl p-6"
          variants={containerVariants}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Why Choose {bookmakerConfig.name}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Features</h3>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Easy-to-use betting code system</li>
                <li>Wide range of sports and markets</li>
                <li>Competitive odds</li>
                <li>Fast payouts</li>
                <li>24/7 customer support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">How to Use</h3>
              <ol className="list-decimal list-inside text-gray-400 space-y-2">
                <li>Create an account on {bookmakerConfig.name}</li>
                <li>Fund your account</li>
                <li>Navigate to "Load Bet Slip"</li>
                <li>Enter the betting code</li>
                <li>Review and place your bet</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default BookmakerPage; 