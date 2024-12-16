import axios from 'axios';
import { getCountryConfig } from '../config/countryConfig';
import { wsManager } from '../utils/websocketManager';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

class MarketplaceService {
  constructor() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });

    // Initialize WebSocket connection
    this.socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: false
    });

    this.setupWebSocket();
    this.setupInterceptors();
    this.initializeCache();
  }

  // WebSocket Setup
  setupWebSocket() {
    this.socket.on('connect', () => {
      console.log('Connected to marketplace WebSocket');
      this.subscribeToUpdates();
    });

    this.socket.on('code_update', (data) => {
      this.handleCodeUpdate(data);
    });

    this.socket.on('price_update', (data) => {
      this.handlePriceUpdate(data);
    });

    this.socket.on('stats_update', (data) => {
      this.handleStatsUpdate(data);
    });
  }

  // API Interceptors
  setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        const country = this.getCountry();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (country) {
          config.headers['X-Country'] = country;
        }

        // Add request timestamp for cache validation
        config.metadata = { startTime: new Date() };

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const duration = new Date() - response.config.metadata.startTime;
        console.debug(`Request to ${response.config.url} took ${duration}ms`);
        
        // Cache successful responses
        if (this.isCacheable(response.config)) {
          this.cacheResponse(response);
        }

        return response;
      },
      async (error) => {
        if (!error.response) {
          return this.handleNetworkError(error);
        }

        switch (error.response.status) {
          case 401:
            return this.handleUnauthorized();
          case 429:
            return this.handleRateLimit(error);
          case 503:
            return this.handleServiceUnavailable(error);
          default:
            return Promise.reject(error);
        }
      }
    );
  }

  // Cache Management
  initializeCache() {
    this.cache = new Map();
    this.cacheConfig = {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100 // Maximum number of cached items
    };
  }

  isCacheable(config) {
    return config.method === 'get' && !config.noCache;
  }

  cacheResponse(response) {
    const key = this.getCacheKey(response.config);
    this.cache.set(key, {
      data: response.data,
      timestamp: Date.now()
    });

    // Cleanup old cache entries
    if (this.cache.size > this.cacheConfig.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  getCacheKey(config) {
    return `${config.url}|${JSON.stringify(config.params)}`;
  }

  async getCachedResponse(config) {
    const key = this.getCacheKey(config);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheConfig.ttl) {
      return cached.data;
    }

    return null;
  }

  // Error Handlers
  async handleNetworkError(error) {
    if (this.shouldRetry(error)) {
      return this.retryRequest(error.config);
    }
    throw new Error('Network error occurred. Please check your connection.');
  }

  async handleUnauthorized() {
    // Check if this is a payment-related request
    const isPaymentRequest = window.location.pathname.includes('/marketplace');
    
    if (!isPaymentRequest) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    } else {
      // For payment requests, just throw the error without redirecting
      throw new Error('Authentication error during payment');
    }
  }

  async handleRateLimit(error) {
    const retryAfter = error.response.headers['retry-after'] || 5;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return this.retryRequest(error.config);
  }

  async handleServiceUnavailable(error) {
    if (this.shouldRetry(error)) {
      const backoff = Math.min(1000 * Math.pow(2, error.config.__retryCount || 0), 10000);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return this.retryRequest(error.config);
    }
    throw new Error('Service is temporarily unavailable. Please try again later.');
  }

  // Retry Logic
  shouldRetry(error) {
    const config = error.config || {};
    return !config.__isRetryRequest && (config.__retryCount || 0) < 3;
  }

  async retryRequest(config) {
    config.__retryCount = (config.__retryCount || 0) + 1;
    config.__isRetryRequest = true;
    return this.axiosInstance(config);
  }

  // WebSocket Handlers
  handleCodeUpdate(data) {
    // Invalidate cache for affected code
    const cacheKey = this.getCacheKey({ url: `/codes/${data.codeId}` });
    this.cache.delete(cacheKey);

    // Notify subscribers
    this.notifySubscribers('code_update', data);
  }

  handlePriceUpdate(data) {
    // Update local cache with new price
    const cacheKey = this.getCacheKey({ url: `/codes/${data.codeId}` });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.data.price = data.newPrice;
      this.cache.set(cacheKey, cached);
    }

    // Notify subscribers
    this.notifySubscribers('price_update', data);
  }

  handleStatsUpdate(data) {
    // Update analytics cache
    const cacheKey = this.getCacheKey({ url: '/analytics/stats' });
    this.cache.delete(cacheKey);

    // Notify subscribers
    this.notifySubscribers('stats_update', data);
  }

  // Subscription Management
  subscribeToUpdates() {
    const country = this.getCountry();
    if (country) {
      this.socket.emit('subscribe', { country });
    }
  }

  notifySubscribers(event, data) {
    wsManager.sendCountryMessage(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Utility Methods
  getCountry() {
    // Try to get country from localStorage
    const storedCountry = localStorage.getItem('userCountry')?.toLowerCase();
    if (storedCountry && ['nigeria', 'ghana'].includes(storedCountry)) {
      return storedCountry;
    }

    // Try to get country from user data in localStorage
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userCountry = userData?.country?.toLowerCase();
      if (userCountry && ['nigeria', 'ghana'].includes(userCountry)) {
        // Store the country for future use
        localStorage.setItem('userCountry', userCountry);
        return userCountry;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // If no country is found, try to get it from the JWT token
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        if (payload.country && ['nigeria', 'ghana'].includes(payload.country.toLowerCase())) {
          const country = payload.country.toLowerCase();
          localStorage.setItem('userCountry', country);
          return country;
        }
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }

    return null;
  }

  formatPrice(price, country) {
    const config = getCountryConfig(country);
    if (!config || !config.currency) {
      return price?.toString() || '0';
    }
    return new Intl.NumberFormat(config.locale || 'en-US', {
      style: 'currency',
      currency: config.currency.code
    }).format(price || 0);
  }

  // API Methods
  async getMarketplaceCodes({ country, filter, sortBy, page = 1, limit = 12, search, filters } = {}) {
    try {
      // Validate country parameter
      if (!country) {
        console.error('Country is required');
        return {
          success: false,
          message: 'Please select a country to view codes',
          items: [],
          total: 0,
          page: page,
          limit: limit
        };
      }

      const queryParams = new URLSearchParams();
      queryParams.append('country', country.toLowerCase());
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (sortBy) queryParams.append('sort_by', sortBy);
      if (search) queryParams.append('search', search);
      if (filter && filter !== 'all') queryParams.append('filter', filter);

      // Add numeric filters
      if (filters) {
        if (filters.minRating) queryParams.append('min_rating', filters.minRating);
        if (filters.minWinRate) queryParams.append('min_win_prob', filters.minWinRate);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.minPrice) queryParams.append('min_price', filters.minPrice);
        if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice);
        if (filters.bookmaker) queryParams.append('bookmaker', filters.bookmaker);
      }

      const endpoint = `/code-analyzer/marketplace-codes?${queryParams}`;
      console.log('Fetching marketplace codes with URL:', endpoint);
      
      const response = await this.axiosInstance.get(endpoint);
      
      if (!response.data) {
        console.error('Invalid response from server:', response);
        throw new Error('Invalid response from server');
      }

      const data = response.data;
      
      // Ensure items is always an array
      const items = Array.isArray(data.items) ? data.items : [];
      
      return {
        success: true,
        items: items,
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit
      };
    } catch (error) {
      console.error('Error fetching marketplace codes:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch marketplace codes',
        items: [],
        total: 0,
        page: page,
        limit: limit
      };
    }
  }

  async getCodeDetails(codeId) {
    try {
      const cachedResponse = await this.getCachedResponse({ url: `/codes/${codeId}` });
      if (cachedResponse) {
        return this.processCodeDetails(cachedResponse);
      }

      const response = await this.axiosInstance.get(`/codes/${codeId}`);
      return this.processCodeDetails(response.data);
    } catch (error) {
      console.error('Error fetching code details:', error);
      throw this.handleError(error);
    }
  }

  async getAnalyzerStats() {
    try {
      const country = this.getCountry();
      if (!country) {
        throw new Error('Country is required to fetch marketplace statistics');
      }

      const response = await this.axiosInstance.get('/marketplace/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      throw error;
    }
  }

  async processPayment(codeId, paymentData) {
    try {
      // Validate payment data
      await this.validatePaymentData(paymentData);

      // Send payment data to backend for verification
      const verifyResponse = await this.axiosInstance.post(`/code-analyzer/verify-payment`, {
        reference: paymentData.reference,
        payment_method: paymentData.payment_method,
        amount: paymentData.amount,
        currency: paymentData.currency,
        country: paymentData.country,
        code_id: codeId,
        email: paymentData.email
      });

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.message || 'Payment verification failed');
      }

      // Return the purchased code
      return {
        success: true,
        code: verifyResponse.data.code
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw this.handleError(error);
    }
  }

  validatePaymentData(paymentData) {
    const requiredFields = ['payment_method', 'amount', 'reference', 'email', 'currency', 'country'];
    const missingFields = requiredFields.filter(field => !paymentData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required payment fields: ${missingFields.join(', ')}`);
    }
  }

  notifyPurchaseSuccess(codeId) {
    // Emit WebSocket event for real-time updates
    if (this.socket) {
      this.socket.emit('code_purchased', {
        code_id: codeId,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Data Processing Methods
  processMarketplaceResponse(data, country) {
    // Handle both array and paginated responses
    const items = Array.isArray(data) ? data : (data.items || []);
    const total = Array.isArray(data) ? data.length : (data.total || items.length);
    const page = Array.isArray(data) ? 1 : (data.page || 1);
    const limit = Array.isArray(data) ? items.length : (data.limit || items.length);

    return {
      items: items.map(code => ({
        ...code,
        currency: getCountryConfig(country).currency.code,
        formattedPrice: this.formatPrice(code.price, country),
        isExpired: new Date(code.valid_until) < new Date(),
        timeRemaining: this.getTimeRemaining(code.valid_until),
        rating: code.rating || 0,
        verified: code.verified || false,
        expected_odds: code.expected_odds || 'N/A',
        bookmaker: code.bookmaker || 'Unknown'
      })),
      total,
      page,
      limit,
      analytics: data.analytics || {}
    };
  }

  processCodeDetails(data) {
    const country = this.getCountry();
    return {
      ...data,
      currency: getCountryConfig(country).currency.code,
      formattedPrice: this.formatPrice(data.price, country),
      metrics: this.processMetrics(data.metrics),
      predictions: this.processPredictions(data.predictions),
      feedback: this.processFeedback(data.feedback)
    };
  }

  // Analytics Methods
  async trackPurchaseAnalytics(codeId, paymentMethod) {
    try {
      await this.axiosInstance.post('/analytics/track', {
        event: 'purchase',
        code_id: codeId,
        payment_method: paymentMethod,
        country: this.getCountry(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking purchase analytics:', error);
    }
  }

  // Cache Management Methods
  invalidateRelatedCaches(codeId) {
    const relatedPatterns = [
      `/codes/${codeId}`,
      '/codes',
      '/analytics/stats',
      `/feedback/${codeId}`
    ];

    for (const [key] of this.cache) {
      if (relatedPatterns.some(pattern => key.includes(pattern))) {
        this.cache.delete(key);
      }
    }
  }

  // Error Handling
  handleError(error) {
    console.error('API Error:', error);
    let message;
    
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'object' && !Array.isArray(detail)) {
        message = Object.values(detail).join(', ');
      } else if (Array.isArray(detail)) {
        message = detail.map(err => err.msg || err.message || String(err)).join(', ');
      } else {
        message = String(detail);
      }
    } else {
      message = error.message || String(error) || 'An unexpected error occurred';
    }
    
    toast.error(String(message));
    return new Error(message);
  }

  // Cleanup
  cleanup() {
    this.socket.disconnect();
    this.cache.clear();
  }

  async getPurchasedCodes() {
    try {
      const response = await this.axiosInstance.get('/marketplace/purchases');
      return {
        success: true,
        items: response.data.map(code => this.processCodeDetails(code))
      };
    } catch (error) {
      console.error('Error fetching purchased codes:', error);
      throw this.handleError(error);
    }
  }

  async sendPurchaseEmail(data) {
    try {
      const response = await this.axiosInstance.post('/notifications/marketplace/send-purchase-email', {
        email: data.email,
        code: data.code
      });
      
      return {
        success: true,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Error sending purchase email:', error);
      throw this.handleError(error);
    }
  }
}

export const marketplaceService = new MarketplaceService();