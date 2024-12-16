import axios from 'axios';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const paystackAxios = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const PaystackService = {
  initialize: async (data) => {
    try {
      const response = await paystackAxios.post('/transaction/initialize', {
        ...data,
        key: PAYSTACK_PUBLIC_KEY
      });
      return response.data;
    } catch (error) {
      console.error('Paystack initialize error:', error);
      throw error;
    }
  }
}; 