import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useCountryConfig } from '../../../hooks/useCountryConfig';

function CountryPromotions() {
  const { user } = useAuth();
  const { config, formatCurrency } = useCountryConfig(user?.country);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would fetch promotions specific to the user's country
    // For now, using sample data
    const samplePromotions = [
      {
        id: 1,
        title: 'Weekend Special',
        description: 'Get 20% off on all premium codes this weekend',
        discount: 20,
        validUntil: '2024-12-31',
        bookmakers: config?.bookmakers?.map(b => b.name) || [],
        minimumPurchase: 5000,
        code: 'WEEKEND20'
      },
      {
        id: 2,
        title: 'New User Bonus',
        description: 'First-time users get 30% off their first purchase',
        discount: 30,
        validUntil: '2024-12-31',
        bookmakers: config?.bookmakers?.map(b => b.name) || [],
        minimumPurchase: 2000,
        code: 'NEWUSER30'
      },
      // Add more promotions
    ];

    setPromotions(samplePromotions);
    setLoading(false);
  }, [config?.bookmakers]);

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
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={containerVariants}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Special Promotions for {user?.country || 'Your Region'}
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Take advantage of these exclusive offers to get premium betting codes at discounted prices.
          </p>
        </motion.div>

        {/* Promotions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading promotions...</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {promotions.map((promo) => (
              <motion.div
                key={promo.id}
                className="relative group"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                  <div className="p-6">
                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {promo.discount}% OFF
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {promo.title}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {promo.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div>
                        <p className="text-gray-400 text-sm">Valid Until</p>
                        <p className="text-white">
                          {new Date(promo.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Minimum Purchase</p>
                        <p className="text-white">
                          {formatCurrency(promo.minimumPurchase)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Valid Bookmakers</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {promo.bookmakers.map((bookmaker, index) => (
                            <span
                              key={index}
                              className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-sm"
                            >
                              {bookmaker}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-400 text-sm mb-1">Promo Code</p>
                      <div className="flex items-center justify-between bg-gray-900 rounded-md p-2">
                        <code className="text-emerald-400 font-mono">
                          {promo.code}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(promo.code)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Browse Codes
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
            How to Use Promotions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Terms & Conditions</h3>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Promotions are valid for specified duration only</li>
                <li>Minimum purchase amount must be met</li>
                <li>Cannot be combined with other offers</li>
                <li>Valid only for users in {user?.country || 'your region'}</li>
                <li>Subject to availability</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">How to Redeem</h3>
              <ol className="list-decimal list-inside text-gray-400 space-y-2">
                <li>Choose your preferred betting codes</li>
                <li>Add them to your cart</li>
                <li>Enter the promotion code at checkout</li>
                <li>Verify the discount is applied</li>
                <li>Complete your purchase</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CountryPromotions; 