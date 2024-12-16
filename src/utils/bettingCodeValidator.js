const BETTING_CODE_PATTERNS = {
  nigeria: {
    bet9ja: {
      pattern: /^(?:B9J-)?[A-Z0-9]{6,12}$/i,
      format: 'B9J-XXXXXX to B9J-XXXXXXXXXXXX',
      example: 'B9J-A12B34 or B9J-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 100,
      maxStake: 500000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^B9J/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    sportybet: {
      pattern: /^(?:SB-)?[A-Z0-9]{6,12}$/i,
      format: 'SB-XXXXXX to SB-XXXXXXXXXXXX',
      example: 'SB-A12B34 or SB-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 100,
      maxStake: 500000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^SB/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    nairabet: {
      pattern: /^(?:NB-)?[A-Z0-9]{6,12}$/i,
      format: 'NB-XXXXXX to NB-XXXXXXXXXXXX',
      example: 'NB-A12B34 or NB-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 100,
      maxStake: 500000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^NB/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    merrybet: {
      pattern: /^(?:MB-)?[A-Z0-9]{6,12}$/i,
      format: 'MB-XXXXXX to MB-XXXXXXXXXXXX',
      example: 'MB-A12B34 or MB-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 100,
      maxStake: 500000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^MB/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    bangbet: {
      pattern: /^(?:BB-)?[A-Z0-9]{6,12}$/i,
      format: 'BB-XXXXXX to BB-XXXXXXXXXXXX',
      example: 'BB-A12B34 or BB-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 100,
      maxStake: 500000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^BB/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    '1xbet': {
      pattern: /^(?:1X-)?[A-Z0-9]{6,12}$/i,
      format: '1X-XXXXXX to 1X-XXXXXXXXXXXX',
      example: '1X-A12B34 or 1X-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 100,
      maxStake: 1000000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^1X/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    }
  },
  ghana: {
    sportybet: {
      pattern: /^(?:SBG-)?[A-Z0-9]{6,12}$/i,
      format: 'SBG-XXXXXX to SBG-XXXXXXXXXXXX',
      example: 'SBG-A12B34 or SBG-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 1,
      maxStake: 10000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^SBG/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    betway: {
      pattern: /^(?:BW-)?[A-Z0-9]{6,12}$/i,
      format: 'BW-XXXXXX to BW-XXXXXXXXXXXX',
      example: 'BW-A12B34 or BW-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 1,
      maxStake: 5000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^BW/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    soccarbet: {
      pattern: /^(?:SC-)?[A-Z0-9]{6,12}$/i,
      format: 'SC-XXXXXX to SC-XXXXXXXXXXXX',
      example: 'SC-A12B34 or SC-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 1,
      maxStake: 5000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^SC/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    bangbet: {
      pattern: /^(?:BB-)?[A-Z0-9]{6,12}$/i,
      format: 'BB-XXXXXX to BB-XXXXXXXXXXXX',
      example: 'BB-A12B34 or BB-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 1,
      maxStake: 5000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^BB/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    '1xbet': {
      pattern: /^(?:1X-)?[A-Z0-9]{6,12}$/i,
      format: '1X-XXXXXX to 1X-XXXXXXXXXXXX',
      example: '1X-A12B34 or 1X-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 1,
      maxStake: 10000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^1X/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    },
    premierbet: {
      pattern: /^(?:PB-)?[A-Z0-9]{6,12}$/i,
      format: 'PB-XXXXXX to PB-XXXXXXXXXXXX',
      example: 'PB-A12B34 or PB-123456789012',
      prefixOptional: true,
      minOdds: 1.2,
      maxOdds: 1000,
      minStake: 1,
      maxStake: 5000,
      validate: (code) => {
        const cleaned = code.replace(/[^A-Z0-9]/gi, '');
        const codeWithoutPrefix = cleaned.replace(/^PB/i, '');
        return codeWithoutPrefix.length >= 6 && codeWithoutPrefix.length <= 12;
      }
    }
  }
};

export const formatBettingCode = (code, bookmaker, country = 'nigeria') => {
  const safeCountry = (country || 'nigeria').toLowerCase();
  const safeBookmaker = (bookmaker || '').toLowerCase().replace(/_gh$|_ng$/, '');

  let cleanCode = code.replace(/\s+/g, '').replace(/[^A-Z0-9]/gi, '').toUpperCase();

  const prefixMap = {
    'ghana_sportybet': 'SBG',
    'nigeria_sportybet': 'SB',
    'ghana_betway': 'BW',
    'nigeria_bet9ja': 'B9J',
    'nigeria_nairabet': 'NB',
    'nigeria_merrybet': 'MB',
    'nigeria_bangbet': 'BB',
    'ghana_bangbet': 'BB',
    'nigeria_1xbet': '1X',
    'ghana_1xbet': '1X',
    'ghana_soccarbet': 'SC',
    'ghana_premierbet': 'PB'
  };

  const prefix = prefixMap[`${safeCountry}_${safeBookmaker}`];
  if (!prefix) return code;

  cleanCode = cleanCode.replace(new RegExp(`^${prefix}`, 'i'), '');

  if (cleanCode.length >= 6 && cleanCode.length <= 12) {
    return `${prefix}-${cleanCode}`;
  }

  return code;
};

export const validateBettingCode = (code, bookmaker, country = 'nigeria') => {
  const safeCountry = (country || 'nigeria').toLowerCase();
  const safeBookmaker = (bookmaker || '').toLowerCase().replace(/_gh$|_ng$/, '');
  
  const trimmedCode = code.trim();
  
  const countryPatterns = BETTING_CODE_PATTERNS[safeCountry];
  if (!countryPatterns) {
    return { 
      isValid: false, 
      error: `Country ${country} is not supported` 
    };
  }

  const bookmakerPattern = countryPatterns[safeBookmaker];
  if (!bookmakerPattern) {
    return { 
      isValid: false, 
      error: `Bookmaker ${bookmaker} is not supported in ${country}` 
    };
  }

  const cleanCode = trimmedCode.replace(/[^A-Z0-9-]/gi, '').toUpperCase();
  const isValid = bookmakerPattern.validate(cleanCode);

  if (!isValid) {
    return {
      isValid: false,
      error: `Invalid code format. For ${country} ${safeBookmaker}, code must contain both letters and numbers.\nExample: ${bookmakerPattern.example}`,
      format: bookmakerPattern.format,
      formattedCode: cleanCode
    };
  }

  const formattedCode = formatBettingCode(cleanCode, safeBookmaker, safeCountry);
  return {
    isValid: true,
    formattedCode,
    bookmaker: safeBookmaker,
    country: safeCountry
  };
};

export const validateStakeAndOdds = (stake, odds, bookmaker, country = 'nigeria') => {
  const safeCountry = country.toLowerCase();
  const safeBookmaker = bookmaker.toLowerCase();

  const countryPatterns = BETTING_CODE_PATTERNS[safeCountry];
  if (!countryPatterns) {
    return {
      isValid: false,
      error: `${country} is not supported`
    };
  }

  const bookmakerPattern = countryPatterns[safeBookmaker];
  if (!bookmakerPattern) {
    return {
      isValid: false,
      error: `${bookmaker} is not supported in ${country}`
    };
  }

  // Validate stake
  const stakeAmount = parseFloat(stake);
  if (isNaN(stakeAmount)) {
    return {
      isValid: false,
      error: 'Invalid stake amount'
    };
  }

  if (stakeAmount < bookmakerPattern.minStake) {
    return {
      isValid: false,
      error: `Minimum stake is ${bookmakerPattern.minStake}`
    };
  }

  if (stakeAmount > bookmakerPattern.maxStake) {
    return {
      isValid: false,
      error: `Maximum stake is ${bookmakerPattern.maxStake}`
    };
  }

  // Validate odds
  const oddsValue = parseFloat(odds);
  if (isNaN(oddsValue)) {
    return {
      isValid: false,
      error: 'Invalid odds'
    };
  }

  if (oddsValue < bookmakerPattern.minOdds) {
    return {
      isValid: false,
      error: `Minimum odds is ${bookmakerPattern.minOdds}`
    };
  }

  if (oddsValue > bookmakerPattern.maxOdds) {
    return {
      isValid: false,
      error: `Maximum odds is ${bookmakerPattern.maxOdds}`
    };
  }

  return {
    isValid: true,
    error: null
  };
}; 