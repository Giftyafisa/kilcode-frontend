import { FaMobileAlt, FaCreditCard, FaUniversity, FaMoneyBill, FaWallet } from 'react-icons/fa';

export const countryConfig = {
  nigeria: {
    currency: {
      code: 'NGN',
      symbol: '₦',
      name: 'Nigerian Naira',
      format: (amount) => `₦${amount.toLocaleString('en-NG')}`
    },
    bookmakers: [
      {
        id: 'bet9ja',
        name: 'Bet9ja',
        logo: '/images/bookmakers/bet9ja.png',
        codeFormat: 'B9J-XXXXXX to B9J-XXXXXXXXXXXX',
        codeExample: 'B9J-123456 or B9J-123456789012',
        prefix: 'B9J-',
        pattern: /^(?:B9J-)?[A-Z0-9]{6,12}$/i,
        minStake: 100,
        maxStake: 500000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://web.bet9ja.com'
      },
      {
        id: 'sportybet',
        name: 'SportyBet',
        logo: '/images/bookmakers/sportybet.png',
        codeFormat: 'SB-XXXXXX to SB-XXXXXXXXXXXX',
        codeExample: 'SB-123456 or SB-123456789012',
        prefix: 'SB-',
        pattern: /^(?:SB-)?[A-Z0-9]{6,12}$/i,
        minStake: 100,
        maxStake: 500000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.sportybet.com/ng/'
      },
      {
        id: 'nairabet',
        name: 'NairaBet',
        logo: '/images/bookmakers/nairabet.png',
        codeFormat: 'NB-XXXXXX to NB-XXXXXXXXXXXX',
        codeExample: 'NB-123456 or NB-123456789012',
        prefix: 'NB-',
        pattern: /^(?:NB-)?[A-Z0-9]{6,12}$/i,
        minStake: 100,
        maxStake: 500000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.nairabet.com'
      },
      {
        id: 'merrybet',
        name: 'MerryBet',
        logo: '/images/bookmakers/merrybet.png',
        codeFormat: 'MB-XXXXXX to MB-XXXXXXXXXXXX',
        codeExample: 'MB-123456 or MB-123456789012',
        prefix: 'MB-',
        pattern: /^(?:MB-)?[A-Z0-9]{6,12}$/i,
        minStake: 100,
        maxStake: 500000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.merrybet.com'
      },
      {
        id: 'bangbet',
        name: 'BangBet',
        logo: '/images/bookmakers/bangbet.png',
        codeFormat: 'BB-XXXXXX to BB-XXXXXXXXXXXX',
        codeExample: 'BB-123456 or BB-123456789012',
        prefix: 'BB-',
        pattern: /^(?:BB-)?[A-Z0-9]{6,12}$/i,
        minStake: 100,
        maxStake: 500000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.bangbet.com.ng'
      },
      {
        id: '1xbet',
        name: '1xBet Nigeria',
        logo: '/images/bookmakers/1xbet.png',
        codeFormat: '1X-XXXXXX to 1X-XXXXXXXXXXXX',
        codeExample: '1X-123456 or 1X-123456789012',
        prefix: '1X-',
        pattern: /^(?:1X-)?[A-Z0-9]{6,12}$/i,
        minStake: 100,
        maxStake: 1000000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://1xbet.ng'
      }
    ],
    paymentMethods: {
      deposit: [
        {
          id: 'paystack',
          name: 'Card Payment (Paystack)',
          icon: FaCreditCard,
          minAmount: 100,
          maxAmount: 1000000,
          fee: 0,
          processingTime: 'Instant',
          requiresEmail: true
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          icon: FaUniversity,
          minAmount: 1000,
          maxAmount: 10000000,
          fee: 0,
          processingTime: '1-24 hours',
          requiresBankDetails: true
        },
        {
          id: 'ussd',
          name: 'USSD Transfer',
          icon: FaMobileAlt,
          minAmount: 100,
          maxAmount: 100000,
          fee: 0,
          processingTime: 'Instant',
          requiresPhone: true,
          banks: [
            { code: '*894#', name: 'First Bank' },
            { code: '*833#', name: 'GTBank' },
            { code: '*822#', name: 'UBA' }
          ]
        },
        {
          id: 'opay',
          name: 'OPay Wallet',
          icon: FaWallet,
          minAmount: 100,
          maxAmount: 500000,
          fee: 0,
          processingTime: 'Instant',
          requiresPhone: true
        }
      ],
      withdrawal: [
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          icon: FaUniversity,
          minAmount: 5000,
          maxAmount: 1000000,
          fee: '1.5%',
          processingTime: '1-24 hours',
          requiresBankDetails: true
        },
        {
          id: 'opay',
          name: 'OPay Wallet',
          icon: FaWallet,
          minAmount: 1000,
          maxAmount: 500000,
          fee: '1%',
          processingTime: '1-24 hours',
          requiresPhone: true
        }
      ]
    },
    support: {
      phone: '+234 800 123 4567',
      email: 'support.ng@kilcode.com',
      hours: '24/7',
      whatsapp: '+234 800 123 4567'
    },
    validation: {
      phone: {
        pattern: /^(\+0)[789][01]\d{8}$/,
        example: '080xxxxxxxx or +234 80xxxxxxxx'
      },
      bankAccount: {
        numberLength: 10,
        pattern: /^\d{10}$/
      }
    },
    transactionRules: {
      deposit: {
        dailyLimit: 5000000,
        monthlyLimit: 50000000,
        minTransaction: 100,
        maxTransaction: 1000000,
        allowedMethods: ['paystack', 'bank_transfer', 'ussd', 'opay']
      },
      withdrawal: {
        dailyLimit: 2000000,
        monthlyLimit: 20000000,
        minTransaction: 1000,
        maxTransaction: 500000,
        allowedMethods: ['bank_transfer', 'opay'],
        requiresVerification: true
      }
    }
  },
  ghana: {
    currency: {
      code: 'GHS',
      symbol: 'GH₵',
      name: 'Ghana Cedi',
      format: (amount) => `GH₵${amount.toLocaleString('en-GH')}`
    },
    bookmakers: [
      {
        id: 'sportybet',
        name: 'SportyBet Ghana',
        logo: '/images/bookmakers/sportybet.png',
        codeFormat: 'SBG-XXXXXX to SBG-XXXXXXXXXXXX',
        codeExample: 'SBG-123456 or SBG-123456789012',
        prefix: 'SBG-',
        pattern: /^(?:SBG-)?[A-Z0-9]{6,12}$/i,
        minStake: 1,
        maxStake: 10000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.sportybet.com/gh/'
      },
      {
        id: 'betway',
        name: 'Betway Ghana',
        logo: '/images/bookmakers/betway.png',
        codeFormat: 'BW-XXXXXX to BW-XXXXXXXXXXXX',
        codeExample: 'BW-123456 or BW-123456789012',
        prefix: 'BW-',
        pattern: /^(?:BW-)?[A-Z0-9]{6,12}$/i,
        minStake: 1,
        maxStake: 5000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.betway.com.gh'
      },
      {
        id: 'soccarbet',
        name: 'SoccarBet Ghana',
        logo: '/images/bookmakers/soccarbet.png',
        codeFormat: 'SC-XXXXXX to SC-XXXXXXXXXXXX',
        codeExample: 'SC-123456 or SC-123456789012',
        prefix: 'SC-',
        pattern: /^(?:SC-)?[A-Z0-9]{6,12}$/i,
        minStake: 1,
        maxStake: 5000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.soccarbet.com.gh'
      },
      {
        id: 'bangbet',
        name: 'BangBet Ghana',
        logo: '/images/bookmakers/bangbet.png',
        codeFormat: 'BB-XXXXXX to BB-XXXXXXXXXXXX',
        codeExample: 'BB-123456 or BB-123456789012',
        prefix: 'BB-',
        pattern: /^(?:BB-)?[A-Z0-9]{6,12}$/i,
        minStake: 1,
        maxStake: 5000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.bangbet.com.gh'
      },
      {
        id: '1xbet',
        name: '1xBet Ghana',
        logo: '/images/bookmakers/1xbet.png',
        codeFormat: '1X-XXXXXX to 1X-XXXXXXXXXXXX',
        codeExample: '1X-123456 or 1X-123456789012',
        prefix: '1X-',
        pattern: /^(?:1X-)?[A-Z0-9]{6,12}$/i,
        minStake: 1,
        maxStake: 10000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://1xbet.com/gh'
      },
      {
        id: 'premierbet',
        name: 'PremierBet Ghana',
        logo: '/images/bookmakers/premierbet.png',
        codeFormat: 'PB-XXXXXX to PB-XXXXXXXXXXXX',
        codeExample: 'PB-123456 or PB-123456789012',
        prefix: 'PB-',
        pattern: /^(?:PB-)?[A-Z0-9]{6,12}$/i,
        minStake: 1,
        maxStake: 5000,
        minOdds: 1.2,
        maxOdds: 1000,
        website: 'https://www.premierbet.com.gh'
      }
    ],
    paymentMethods: {
      deposit: [
        {
          id: 'mtn_momo',
          name: 'MTN Mobile Money',
          icon: FaMobileAlt,
          minAmount: 1,
          maxAmount: 10000,
          fee: 0,
          processingTime: 'Instant',
          requiresPhone: true
        },
        {
          id: 'vodafone_cash',
          name: 'Vodafone Cash',
          icon: FaMobileAlt,
          minAmount: 1,
          maxAmount: 10000,
          fee: 0,
          processingTime: 'Instant',
          requiresPhone: true
        },
        {
          id: 'airtel_money',
          name: 'AirtelTigo Money',
          icon: FaMobileAlt,
          minAmount: 1,
          maxAmount: 10000,
          fee: 0,
          processingTime: 'Instant',
          requiresPhone: true
        },
        {
          id: 'zeepay',
          name: 'Zeepay Wallet',
          icon: FaWallet,
          minAmount: 1,
          maxAmount: 5000,
          fee: 0,
          processingTime: 'Instant',
          requiresPhone: true
        }
      ],
      withdrawal: [
        {
          id: 'mtn_momo',
          name: 'MTN Mobile Money',
          icon: FaMobileAlt,
          minAmount: 10,
          maxAmount: 10000,
          fee: '1%',
          processingTime: '1-24 hours',
          requiresPhone: true
        },
        {
          id: 'vodafone_cash',
          name: 'Vodafone Cash',
          icon: FaMobileAlt,
          minAmount: 10,
          maxAmount: 10000,
          fee: '1%',
          processingTime: '1-24 hours',
          requiresPhone: true
        },
        {
          id: 'airtel_money',
          name: 'AirtelTigo Money',
          icon: FaMobileAlt,
          minAmount: 10,
          maxAmount: 10000,
          fee: '1%',
          processingTime: '1-24 hours',
          requiresPhone: true
        },
        {
          id: 'zeepay',
          name: 'Zeepay Wallet',
          icon: FaWallet,
          minAmount: 10,
          maxAmount: 5000,
          fee: '1%',
          processingTime: '1-24 hours',
          requiresPhone: true
        },
        {
          id: 'airteltigo',
          title: 'AirtelTigo Money',
          description: 'Withdraw to your AirtelTigo Money wallet',
          requiresPhone: true,
          minAmount: 1,
          maxAmount: 5000,
          fee: '1%'
        }
      ]
    },
    support: {
      phone: '+233 30 123 4567',
      email: 'support.gh@kilcode.com',
      hours: '24/7',
      whatsapp: '+233 30 123 4567'
    },
    validation: {
      phone: {
        pattern: /^(\+233|0)[235]\d{8}$/,
        example: '02xxxxxxxx or +233 2xxxxxxxx'
      },
      bankAccount: {
        numberLength: 13,
        pattern: /^\d{13}$/
      }
    },
    transactionRules: {
      deposit: {
        dailyLimit: 20000,
        monthlyLimit: 100000,
        minTransaction: 1,
        maxTransaction: 10000,
        allowedMethods: ['mtn_momo', 'vodafone_cash', 'airtel_money', 'zeepay']
      },
      withdrawal: {
        dailyLimit: 10000,
        monthlyLimit: 50000,
        minTransaction: 10,
        maxTransaction: 5000,
        allowedMethods: ['mtn_momo', 'vodafone_cash', 'airtel_money', 'zeepay'],
        requiresVerification: true
      }
    },
    bettingRules: {
      sportybet_gh: {
        minStake: 1,
        maxStake: 10000,
        minOdds: 1.2,
        maxOdds: 1000,
        maxWinning: 50000,
        dailyStakeLimit: 20000,
        codeFormat: {
          prefix: 'SBG-',
          length: '6-12',
          allowedCharacters: 'A-Z, 0-9',
          example: 'SBG-A12B34'
        },
        validationRules: [
          'Must start with SBG-',
          'Must contain 6-12 characters after prefix',
          'Letters and numbers are allowed after prefix',
          'No spaces allowed'
        ]
      },
      betway_gh: {
        minStake: 1,
        maxStake: 10000,
        minOdds: 1.2,
        maxOdds: 1000,
        maxWinning: 50000,
        dailyStakeLimit: 20000,
        codeFormat: {
          prefix: 'BW-',
          length: '6-12',
          allowedCharacters: 'A-Z, 0-9',
          example: 'BW-A12B34'
        },
        validationRules: [
          'Must start with BW-',
          'Must contain 6-12 characters after prefix',
          'Letters and numbers are allowed after prefix',
          'No spaces allowed'
        ]
      }
    }
  }
};

export const getCountryConfig = (country) => {
  const config = countryConfig[country.toLowerCase()] || countryConfig['ghana'];
  
  // Ensure currency formatting is correct
  const formatCurrency = (amount) => {
    const isGhana = config.currency.code === 'GHS';
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      return isGhana ? 'GH₵0.00' : '₦0.00';
    }

    try {
      const formatter = new Intl.NumberFormat(isGhana ? 'en-GH' : 'en-NG', {
        style: 'currency',
        currency: config.currency.code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // For Ghana, ensure GH₵ symbol is used
      if (isGhana) {
        return formatter.format(numAmount).replace('GHS', 'GH₵');
      }
      
      return formatter.format(numAmount);
    } catch (error) {
      // Fallback formatting if Intl.NumberFormat fails
      const symbol = isGhana ? 'GH₵' : '₦';
      return `${symbol}${numAmount.toFixed(2)}`;
    }
  };

  return {
    ...config,
    currency: {
      ...config.currency,
      format: formatCurrency
    }
  };
};

export const validatePhoneNumber = (phone, country) => {
  const config = getCountryConfig(country);
  return {
    isValid: config.validation.phone.pattern.test(phone),
    example: config.validation.phone.example
  };
};

export const validateAmount = (amount, method, type, country) => {
  const config = getCountryConfig(country);
  const paymentMethod = config.paymentMethods[type]?.find(m => m.id === method);
  
  if (!paymentMethod) return { isValid: false, error: 'Invalid payment method' };
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return { isValid: false, error: 'Invalid amount' };
  
  if (numAmount < paymentMethod.minAmount) {
    return { 
      isValid: false, 
      error: `Minimum amount is ${config.currency.format(paymentMethod.minAmount)}` 
    };
  }
  
  if (numAmount > paymentMethod.maxAmount) {
    return { 
      isValid: false, 
      error: `Maximum amount is ${config.currency.format(paymentMethod.maxAmount)}` 
    };
  }
  
  return { isValid: true };
};

export const validateTransaction = (amount, type, method, country, userTransactions = []) => {
  const config = getCountryConfig(country);
  const rules = config.transactionRules[type];
  
  // Basic amount validation
  const amountValidation = validateAmount(amount, method, type, country);
  if (!amountValidation.isValid) return amountValidation;

  // Check if method is allowed
  if (!rules.allowedMethods.includes(method)) {
    return {
      isValid: false,
      error: `${method} is not allowed for ${type} in ${country}`
    };
  }

  // Calculate daily total
  const today = new Date().toDateString();
  const dailyTotal = userTransactions
    .filter(t => 
      t.type === type && 
      new Date(t.created_at).toDateString() === today
    )
    .reduce((sum, t) => sum + t.amount, 0);

  if (dailyTotal + parseFloat(amount) > rules.dailyLimit) {
    return {
      isValid: false,
      error: `Daily ${type} limit of ${config.currency.format(rules.dailyLimit)} exceeded`
    };
  }

  // Calculate monthly total
  const thisMonth = new Date().getMonth();
  const monthlyTotal = userTransactions
    .filter(t => 
      t.type === type && 
      new Date(t.created_at).getMonth() === thisMonth
    )
    .reduce((sum, t) => sum + t.amount, 0);

  if (monthlyTotal + parseFloat(amount) > rules.monthlyLimit) {
    return {
      isValid: false,
      error: `Monthly ${type} limit of ${config.currency.format(rules.monthlyLimit)} exceeded`
    };
  }

  return { isValid: true };
}; 