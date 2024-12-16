import { useAuth } from '../context/AuthContext';
import { getCountryConfig } from '../config/countryConfig';

export const useCountryConfig = (country) => {
  const { user } = useAuth();
  
  // Get the country from either the parameter or user context
  const userCountry = country || user?.country;
  
  // If no country is available, return a minimal config
  if (!userCountry) {
    return {
      config: {
        currency: {
          code: '',
          symbol: '',
          name: ''
        },
        bookmakers: []
      },
      formatCurrency: (amount) => amount.toLocaleString(),
      validateBettingCode: () => false,
      getPaymentMethods: () => [],
      validateAmount: () => ({ isValid: false, message: 'Please log in to continue' })
    };
  }
  
  const config = getCountryConfig(userCountry);

  const formatCurrency = (amount) => {
    return `${config.currency.symbol}${amount.toLocaleString()}`;
  };

  const validateBettingCode = (code, bookmaker) => {
    const bookmakerConfig = config.bookmakers.find(b => b.id === bookmaker);
    if (!bookmakerConfig) return false;

    const pattern = bookmakerConfig.codeFormat
      .replace(/X/g, '[A-Z0-9]')
      .replace(/-/g, '\\-');
    
    return new RegExp(`^${pattern}$`, 'i').test(code);
  };

  const getPaymentMethods = (type = 'withdrawal') => {
    return config.payments?.[type]?.methods || [];
  };

  const validateAmount = (amount, type = 'withdrawal') => {
    const { minAmount = 0, maxAmount = 0 } = config.payments?.[type] || {};
    
    if (amount < minAmount) {
      return {
        isValid: false,
        message: `Minimum ${type} amount is ${formatCurrency(minAmount)}`
      };
    }

    if (amount > maxAmount) {
      return {
        isValid: false,
        message: `Maximum ${type} amount is ${formatCurrency(maxAmount)}`
      };
    }

    return { isValid: true };
  };

  return {
    config,
    formatCurrency,
    validateBettingCode,
    getPaymentMethods,
    validateAmount
  };
}; 