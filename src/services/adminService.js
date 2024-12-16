import axios from 'axios';

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: ADMIN_API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Betting Code Verification Methods
  async getPendingBettingCodes(country, page = 1, limit = 10, filters = {}) {
    try {
      const response = await this.api.get('/betting-codes/pending', {
        params: {
          country: country.toLowerCase(),
          page,
          limit,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyBettingCode(codeId, verificationData) {
    try {
      const response = await this.api.post(`/betting-codes/verify/${codeId}`, verificationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBettingStatistics(country) {
    try {
      const response = await this.api.get(`/statistics/betting/${country.toLowerCase()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error Handler
  handleError(error) {
    return {
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status,
      details: error.response?.data?.details || {}
    };
  }
}

export const adminService = new AdminService(); 