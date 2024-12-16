import axios from 'axios';
import { getCountryConfig } from '../config/countryConfig';
import { wsManager } from '../utils/websocketManager';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

class BettingService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true // Enable CORS with credentials
    });

    // Add token and country to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      const userCountry = localStorage.getItem('userCountry')?.toLowerCase();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const country = (userCountry || user?.country || '').toLowerCase();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (country) {
        config.headers['X-User-Country'] = country;
      }

      // If this is a POST request to submit betting code
      if (config.method === 'post' && config.url?.includes('/betting-codes/submit')) {
        try {
          // Parse the data if it's a string
          let data = typeof config.data === 'string' ? JSON.parse(config.data) : { ...config.data };
          
          // Ensure user_country is set correctly
          if (country) {
            data.user_country = country;
          }
          
          // Ensure proper content type and data format
          config.headers['Content-Type'] = 'application/json';
          config.headers['Accept'] = 'application/json';
          config.data = JSON.stringify(data);
        } catch (error) {
          console.error('Error processing request data:', error);
          throw new Error('Failed to process request data');
        }
      }
      
      return config;
    }, (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    });

    // Add response interceptor for better error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        const errorMessage = this.getErrorMessage(error);
        toast.error(errorMessage);
        throw error;
      }
    );
  }

  getErrorMessage(error) {
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        return error.response.data.detail.map(err => err.msg).join(', ');
      }
      return error.response.data.detail;
    }
    return error.message || 'An unexpected error occurred';
  }

  async getBettingCodes(filters = {}) {
    try {
      const response = await this.api.get('/betting-codes/user/codes', {
        params: {
          status: filters.status,
          skip: (filters.page - 1) * filters.limit,
          limit: filters.limit,
          search: filters.search,
          sort: filters.sort,
          direction: filters.direction
        }
      });

      // Get user's country for proper formatting
      const country = localStorage.getItem('userCountry')?.toLowerCase();
      if (!country) {
        throw new Error('User country not found');
      }
      const countryConfig = getCountryConfig(country);

      // Ensure response.data is an array and handle each code
      const codes = Array.isArray(response.data) ? response.data : [];
      const formattedCodes = codes.map(code => {
        // Ensure all required fields exist with proper defaults
        return {
          id: code.id,
          bookmaker: code.bookmaker,
          code: code.code,
          stake: parseFloat(code.stake || 0),
          odds: parseFloat(code.odds || 0),
          status: (code.status || 'pending').toLowerCase(),
          potential_winnings: parseFloat(code.potential_winnings || 0),
          created_at: code.created_at ? new Date(code.created_at).toISOString() : new Date().toISOString(),
          verified_at: code.verified_at ? new Date(code.verified_at).toISOString() : null,
          admin_note: code.admin_note || '',
          message: code.message || '',
          user_country: code.user_country || country,
          verificationStatus: code.verificationStatus || null
        };
      });

      return {
        items: formattedCodes,
        total: formattedCodes.length
      };
    } catch (error) {
      console.error('Error fetching betting codes:', error);
      throw this.handleError(error);
    }
  }

  async submitBettingCode(codeData) {
    try {
      // Get user country from localStorage and user object
      const userCountry = localStorage.getItem('userCountry')?.toLowerCase();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const country = (userCountry || user?.country || '').toLowerCase();

      if (!country) {
        throw new Error('User country not found. Please log in again.');
      }

      // Validate country
      if (!['nigeria', 'ghana'].includes(country)) {
        throw new Error('Invalid country. Must be either Nigeria or Ghana.');
      }

      // Clean and format the data
      const bookmaker = codeData.bookmaker.toLowerCase().trim();
      const code = codeData.code.trim().toUpperCase();
      const stake = parseFloat(codeData.stake);
      const odds = parseFloat(codeData.odds);

      // Validate required fields
      if (!bookmaker) throw new Error('Bookmaker is required');
      if (!code) throw new Error('Betting code is required');
      if (!stake || isNaN(stake)) throw new Error('Valid stake amount is required');
      if (!odds || isNaN(odds)) throw new Error('Valid odds are required');

      // Prepare request data
      const requestData = {
        user_country: country,
        bookmaker,
        code,
        stake,
        odds,
        status: 'pending'
      };

      // Log request data for debugging
      console.log('Submitting betting code with:', requestData);

      // Make the request with explicit headers
      const response = await this.api.post('/betting-codes/submit', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-Country': country
        }
      });

      // Notify through WebSocket if successful
      if (response.data) {
        wsManager.sendCountryMessage('NEW_CODE_SUBMITTED', {
          code_id: response.data.id,
          bookmaker: requestData.bookmaker,
          code: requestData.code,
          stake: requestData.stake,
          odds: requestData.odds,
          potential_winnings: requestData.stake * requestData.odds,
          user_country: country
        });
      }

      return response.data;
    } catch (error) {
      console.error('Submit betting code error:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errorDetail = error.response.data.detail;
        if (Array.isArray(errorDetail)) {
          throw new Error(errorDetail.map(err => err.msg).join(', '));
        }
        throw new Error(errorDetail || 'Invalid betting code data');
      }

      // Handle other errors
      throw this.handleError(error);
    }
  }

  async checkVerificationStatus(codeId) {
    try {
      const response = await this.api.get(`/betting-codes/${codeId}/verification`);
      return {
        status: response.data.status,
        message: response.data.message,
        verified_at: response.data.verified_at,
        admin_note: response.data.admin_note
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw this.handleError(error);
    }
  }

  async getCodeDetails(codeId) {
    try {
      const response = await this.api.get(`/betting-codes/${codeId}`);
      return {
        ...response.data,
        created_at: new Date(response.data.created_at).toISOString(),
        verified_at: response.data.verified_at ? new Date(response.data.verified_at).toISOString() : null,
        potential_winnings: parseFloat(response.data.potential_winnings || 0),
        stake: parseFloat(response.data.stake || 0),
        odds: parseFloat(response.data.odds || 0)
      };
    } catch (error) {
      console.error('Error fetching code details:', error);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response?.status === 422) {
      const errorDetail = error.response.data.detail;
      if (Array.isArray(errorDetail)) {
        const messages = errorDetail.map(err => err.msg || err.message);
        throw new Error(messages.join(', '));
      }
      throw new Error(errorDetail || 'Validation error');
    }

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    throw new Error(error.message || 'An unexpected error occurred');
  }
}

export const bettingService = new BettingService(); 