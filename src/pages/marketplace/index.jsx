import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCountryConfig } from '../../hooks/useCountryConfig';
import { marketplaceService } from '../../services/marketplaceService';
import MarketplaceGrid from '../../components/marketplace/MarketplaceGrid';
import CodeDetails from './components/CodeDetails';
import PaymentModal from './components/PaymentModal';
import CodePreview from './components/CodePreview';
import MarketplaceIntegration from './components/MarketplaceIntegration';
import { toast } from 'react-hot-toast';
import { FaSearch, FaFilter, FaChartLine, FaMoneyBillWave, FaStar, FaShoppingBag } from 'react-icons/fa';

function Marketplace() {
  const { user } = useAuth();
  const { config, formatCurrency } = useCountryConfig();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedCode, setSelectedCode] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    minWinRate: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    bookmaker: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('userCountry')?.toLowerCase() || '');
  const [showPurchases, setShowPurchases] = useState(false);
  const [purchasedCodes, setPurchasedCodes] = useState([]);
  const [showPurchasedCode, setShowPurchasedCode] = useState(false);
  const [purchasedCodeDetails, setPurchasedCodeDetails] = useState(null);

  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem('userCountry', selectedCountry);
      loadCodes();
      loadStats();
    }
  }, [selectedCountry]);

  useEffect(() => {
    loadCodes();
    loadStats();
  }, [filter, sortBy, pagination.page, searchQuery, filters]);

  useEffect(() => {
    if (user) {
      loadPurchasedCodes();
    }
  }, [user]);

  const loadCodes = async () => {
    try {
      if (!selectedCountry || !['nigeria', 'ghana'].includes(selectedCountry.toLowerCase())) {
        setLoading(false);
        toast.error('Please select your country to view available codes');
        return;
      }

      setLoading(true);
      console.log('Loading codes for country:', selectedCountry);
      
      const response = await marketplaceService.getMarketplaceCodes({
        country: selectedCountry,
        filter,
        sortBy,
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        filters
      });

      console.log('API Response:', response);

      if (response.success) {
        if (response.items && response.items.length > 0) {
          setCodes(response.items);
          setPagination(prev => ({
            ...prev,
            total: response.total || 0
          }));
        } else {
          console.log('No codes found for', selectedCountry);
          setCodes([]);
          toast('No codes available for ' + selectedCountry + ' at the moment', {
            icon: '🔍'
          });
        }
      } else {
        console.error('Failed to load codes:', response.message);
        toast.error(response.message || 'Failed to load codes');
        setCodes([]);
      }
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Failed to load marketplace codes');
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      if (!config || !config.country) {
        console.log('Country not selected, skipping stats loading');
        return;
      }
      
      const response = await marketplaceService.getAnalyzerStats();
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Don't show error toast for stats as it's not critical for marketplace functionality
    }
  };

  const loadPurchasedCodes = async () => {
    try {
      const response = await marketplaceService.getPurchasedCodes();
      if (response.success) {
        setPurchasedCodes(response.items);
      }
    } catch (error) {
      console.error('Error loading purchased codes:', error);
      toast.error('Failed to load your purchased codes');
    }
  };

  const handlePurchase = async (code) => {
    try {
      // Store the code details for payment
      localStorage.setItem('pendingMarketplacePurchase', JSON.stringify({
        code_id: code.id,
        price: code.price,
        type: 'marketplace_code',
        timestamp: Date.now()
      }));

      console.log('Initiating purchase for code:', code.id);
      setSelectedCode(code);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to initiate purchase');
    }
  };

  const handlePreview = (code) => {
    setSelectedCode(code);
    setShowPreview(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      console.log('Payment successful:', paymentDetails);
      
      // Get the purchased code details
      const response = await marketplaceService.processPayment(selectedCode.id, {
        payment_method: 'paystack',
        amount: paymentDetails.amount,
        reference: paymentDetails.reference,
        email: paymentDetails.email,
        currency: paymentDetails.currency,
        country: paymentDetails.country
      });

      if (response.success) {
        toast.success('Code purchased successfully!');
        setShowPaymentModal(false);
        
        // Store the purchased code details
        setPurchasedCodeDetails(response.code);
        setShowPurchasedCode(true);

        // Send email with code details
        try {
          const emailResponse = await marketplaceService.sendPurchaseEmail({
            email: paymentDetails.email,
            code: response.code
          });
          
          if (emailResponse.success) {
            toast.success('Code details sent to your email!');
          } else {
            console.error('Failed to send email:', emailResponse.message);
            toast.error('Could not send email confirmation. Please check your purchase history.');
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          toast.error('Could not send email confirmation. Please check your purchase history.');
        }

        // Refresh the marketplace
        loadCodes();
      } else {
        throw new Error(response.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadCodes();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      minRating: '',
      minWinRate: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      bookmaker: ''
    });
    setSearchQuery('');
  };

  const PurchasedCodeModal = ({ code, onClose }) => {
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        toast.success('Code copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy code');
      });
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
              <h2 className="text-2xl font-bold text-white">Your Purchased Code</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Code Details */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Betting Code Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Code</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-white font-mono bg-gray-700 p-2 rounded flex-1">
                        {code.code}
                      </p>
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Bookmaker</p>
                    <p className="text-white">{code.bookmaker}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Win Probability</p>
                    <p className="text-white">{code.win_probability}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Expected Odds</p>
                    <p className="text-white">{code.expected_odds}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Valid Until</p>
                    <p className="text-white">{new Date(code.valid_until).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Category</p>
                    <p className="text-white">{code.category}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 text-center">
                A copy of this code has been sent to your email: {code.email}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Country Selection */}
        {!selectedCountry && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Select Your Country</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedCountry('nigeria')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Nigeria
              </button>
              <button
                onClick={() => setSelectedCountry('ghana')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Ghana
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Premium Betting Codes Marketplace
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Access verified betting codes from successful predictors. Country-specific predictions for {selectedCountry}.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Active Listings</p>
                  <p className="text-3xl font-bold">{stats.active_listings}</p>
                </div>
                <FaChartLine className="text-blue-500 text-3xl" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Total Revenue</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats.total_revenue)}</p>
                </div>
                <FaMoneyBillWave className="text-emerald-500 text-3xl" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Average Win Rate</p>
                  <p className="text-3xl font-bold">{stats.avg_win_rate}%</p>
                </div>
                <FaStar className="text-yellow-500 text-3xl" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search betting codes..."
                  className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-800 rounded-lg mt-4 overflow-hidden"
              >
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Minimum Rating
                      </label>
                      <input
                        type="number"
                        name="minRating"
                        value={filters.minRating}
                        onChange={handleFilterChange}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Minimum Win Rate
                      </label>
                      <input
                        type="number"
                        name="minWinRate"
                        value={filters.minWinRate}
                        onChange={handleFilterChange}
                        min="0"
                        max="100"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">All Categories</option>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                        <option value="tennis">Tennis</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        min="0"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Bookmaker
                      </label>
                      <select
                        name="bookmaker"
                        value={filters.bookmaker}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">All Bookmakers</option>
                        {config.bookmakers?.map((bookmaker) => (
                          <option key={bookmaker.id} value={bookmaker.id}>
                            {bookmaker.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Options */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Codes
            </button>
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'trending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'verified'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
            <option value="rating">Rating</option>
          </select>
        </div>

        {/* Marketplace Grid */}
        <MarketplaceGrid
          codes={codes}
          countryConfig={config}
          onPurchase={handlePurchase}
          onPreview={handlePreview}
          loading={loading}
        />

        {/* Pagination */}
        {!loading && codes.length > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && selectedCode && (
            <PaymentModal
              code={selectedCode}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && selectedCode && (
            <CodePreview
              code={selectedCode}
              onClose={() => setShowPreview(false)}
              onPurchase={() => {
                setShowPreview(false);
                handlePurchase(selectedCode);
              }}
            />
          )}
        </AnimatePresence>

        {/* My Purchases Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowPurchases(!showPurchases)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaShoppingBag />
            My Purchases
          </button>
        </div>

        {/* Purchased Codes Section */}
        <AnimatePresence>
          {showPurchases && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">My Purchased Codes</h3>
                {purchasedCodes.length === 0 ? (
                  <p className="text-gray-400">You haven't purchased any codes yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedCodes.map((code) => (
                      <div key={code.id} className="bg-gray-900 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-white">{code.title}</h4>
                            <p className="text-sm text-gray-400">
                              Purchased on {new Date(code.purchase_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            code.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            code.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {code.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-gray-800 p-3 rounded">
                            <p className="text-white">{code.content}</p>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Win Probability</span>
                            <span className="text-white">{code.win_probability}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Expected Odds</span>
                            <span className="text-white">{code.expected_odds}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add PurchasedCodeModal */}
        <AnimatePresence>
          {showPurchasedCode && purchasedCodeDetails && (
            <PurchasedCodeModal
              code={purchasedCodeDetails}
              onClose={() => setShowPurchasedCode(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Marketplace;