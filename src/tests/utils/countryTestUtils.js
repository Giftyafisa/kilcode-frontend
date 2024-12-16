import { countryConfig } from '../../config/countryConfig';

export const MOCK_USERS = {
  nigeria: {
    id: 1,
    email: 'user@nigeria.com',
    name: 'Nigerian User',
    country: 'nigeria',
    phone: '+2348012345678',
    balance: 50000
  },
  ghana: {
    id: 2,
    email: 'user@ghana.com',
    name: 'Ghanaian User',
    country: 'ghana',
    phone: '+233201234567',
    balance: 500
  }
};

export const MOCK_TRANSACTIONS = {
  nigeria: [
    {
      id: 1,
      type: 'deposit',
      amount: 10000,
      status: 'completed',
      payment_method: 'paystack',
      currency: 'NGN'
    }
  ],
  ghana: [
    {
      id: 1,
      type: 'deposit',
      amount: 100,
      status: 'completed',
      payment_method: 'mtn_momo',
      currency: 'GHS'
    }
  ]
};

export const generateMockBettingCode = (country) => {
  const config = countryConfig[country];
  const bookmaker = config.bookmakers[0];
  
  switch(country) {
    case 'nigeria':
      return {
        code: 'B9J-123456-ABCD',
        bookmaker: 'bet9ja',
        odds: 2.5,
        stake: 1000
      };
    case 'ghana':
      return {
        code: 'BW-12345678',
        bookmaker: 'betway',
        odds: 2.5,
        stake: 10
      };
    default:
      throw new Error(`Unsupported country: ${country}`);
  }
}; 