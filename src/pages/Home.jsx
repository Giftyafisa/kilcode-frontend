import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCountryConfig } from '../hooks/useCountryConfig';

function Home() {
  const { user } = useAuth();
  const { config, error: countryConfigError, isLoading: isCountryConfigLoading } = useCountryConfig(user?.country);
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

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
    <AnimatePresence>
      {isClientSide && (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="min-h-screen relative bg-gray-900 overflow-hidden"
          aria-label="Kilcode Home Page"
        >
          {/* Background Layers */}
          <div className="absolute inset-0 z-0">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900"></div>
            
            {/* Pattern Overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{ 
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
              aria-hidden="true"
            />
            
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/50 to-gray-900/90 animate-pulse-slow"></div>
            </div>
            
            {/* Glow Effects */}
            <div className="absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Hero Section */}
            <div className="relative pt-20 pb-16 overflow-hidden">
              <motion.div 
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                variants={containerVariants}
              >
                <motion.div 
                  className="relative inline-block mb-8"
                  variants={itemVariants}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg blur opacity-30 animate-pulse-slow" />
                  <h1 className="relative text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 animate-gradient">
                    Welcome to Kilcode
                  </h1>
                </motion.div>

                <motion.div 
                  className="max-w-3xl mx-auto mb-12"
                  variants={itemVariants}
                >
                  <p className="text-xl md:text-2xl text-gray-300 mb-4">
                    Your Premier Platform for Sports Betting Success
                  </p>
                  <p className="text-lg text-gray-400">
                    Submit your winning betting codes to earn rewards, or access premium predictions from top analysts. Available in Nigeria and Ghana.
                  </p>
                </motion.div>

                <motion.div 
                  className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
                  variants={itemVariants}
                >
                  <Link
                    to="/submit-code"
                    className="group relative inline-flex items-center"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300" />
                    <div className="relative px-8 py-4 bg-gray-900 rounded-lg leading-none flex items-center">
                      <span className="text-blue-400 group-hover:text-blue-300 transition duration-300">
                        Submit Your Code
                      </span>
                      <svg className="ml-3 w-5 h-5 text-blue-400 group-hover:text-blue-300 transition transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </Link>

                  <Link
                    to="/marketplace"
                    className="group relative inline-flex items-center"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300" />
                    <div className="relative px-8 py-4 bg-gray-900 rounded-lg leading-none flex items-center">
                      <span className="text-emerald-400 group-hover:text-emerald-300 transition duration-300">
                        Browse Marketplace
                      </span>
                      <svg className="ml-3 w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>

                {/* Country Support Section */}
                <motion.div 
                  className="flex flex-wrap justify-center gap-4 mb-16"
                  variants={itemVariants}
                >
                  <div className="flex items-center bg-gray-800/50 rounded-full px-4 py-2">
                    <img 
                      src="/images/flags/nigeria.svg" 
                      alt="Nigeria Flag" 
                      className="w-6 h-6 rounded-full mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="1" height="2" x="0" fill="%23008751"/><rect width="1" height="2" x="1" fill="%23ffffff"/><rect width="1" height="2" x="2" fill="%23008751"/></svg>';
                      }}
                    />
                    <span className="text-gray-300">Nigeria</span>
                  </div>
                  <div className="flex items-center bg-gray-800/50 rounded-full px-4 py-2">
                    <img 
                      src="/images/flags/ghana.svg" 
                      alt="Ghana Flag" 
                      className="w-6 h-6 rounded-full mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="900" height="600" fill="%23006b3f"/><rect width="900" height="400" fill="%23fcd116"/><rect width="900" height="200" fill="%23ce1126"/></svg>';
                      }}
                    />
                    <span className="text-gray-300">Ghana</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Features Section */}
            <motion.div 
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
              variants={containerVariants}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
                <p className="text-gray-400">Choose your path to betting success</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Submit Codes Path */}
                <motion.div 
                  className="group relative"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                  <div className="relative glass-effect p-8 rounded-xl">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:animate-float">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-4">Submit & Earn</h2>
                    <ul className="space-y-3 text-gray-400 mb-6">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Submit your betting codes
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Get verified by our experts
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Earn rewards for winning bets
                      </li>
                    </ul>
                    <Link
                      to="/submit-code"
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Start Submitting
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>

                {/* Buy Codes Path */}
                <motion.div 
                  className="group relative"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                  <div className="relative glass-effect p-8 rounded-xl">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:animate-float">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-4">Buy Premium Codes</h2>
                    <ul className="space-y-3 text-gray-400 mb-6">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Access verified predictions
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Country-specific bookmakers
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Track success rates
                      </li>
                    </ul>
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Visit Marketplace
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
              variants={containerVariants}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <motion.div 
                  className="glass-effect p-6 rounded-xl text-center"
                  variants={itemVariants}
                >
                  <div className="text-3xl font-bold text-white mb-2">5000+</div>
                  <div className="text-gray-400">Active Users</div>
                </motion.div>
                <motion.div 
                  className="glass-effect p-6 rounded-xl text-center"
                  variants={itemVariants}
                >
                  <div className="text-3xl font-bold text-white mb-2">85%</div>
                  <div className="text-gray-400">Success Rate</div>
                </motion.div>
                <motion.div 
                  className="glass-effect p-6 rounded-xl text-center"
                  variants={itemVariants}
                >
                  <div className="text-3xl font-bold text-white mb-2">₦10M+</div>
                  <div className="text-gray-400">Paid Out</div>
                </motion.div>
                <motion.div 
                  className="glass-effect p-6 rounded-xl text-center"
                  variants={itemVariants}
                >
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-gray-400">Support</div>
                </motion.div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div 
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
              variants={containerVariants}
            >
              <motion.div 
                className="relative inline-block"
                variants={itemVariants}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg blur opacity-30 animate-pulse-slow" />
                <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Start Winning?
                </h2>
              </motion.div>
              <motion.p 
                className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
                variants={itemVariants}
              >
                Join thousands of successful bettors on Kilcode. Submit your codes or access premium predictions today.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={itemVariants}
              >
                {!user ? (
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center"
                    aria-label="Create Free Account"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300" />
                    <div className="relative px-8 py-4 bg-gray-900 rounded-lg leading-none flex items-center">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 group-hover:from-blue-300 group-hover:to-emerald-300 transition duration-300">
                        Create Free Account
                      </span>
                      <svg 
                        className="ml-3 w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition transform duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </Link>
                ) : null}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Home;