export const validatePaymentDetails = (method, details, country) => {
  const errors = {};

  switch (method) {
    case 'paystack':
      if (!details.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(details.email)) {
        errors.email = 'Invalid email address';
      }
      break;

    case 'bank_transfer':
      if (!details.accountNumber) {
        errors.accountNumber = 'Account number is required';
      } else if (!/^\d{10}$/.test(details.accountNumber)) {
        errors.accountNumber = 'Account number must be 10 digits';
      }
      if (!details.bankCode) {
        errors.bankCode = 'Bank is required';
      }
      break;

    case 'ussd':
      if (!details.bankCode) {
        errors.bankCode = 'Bank is required';
      }
      break;

    case 'mtn_momo':
    case 'vodafone_cash':
    case 'airtel_money':
    case 'zeepay':
    case 'opay':
      if (!details.phone) {
        errors.phone = 'Phone number is required';
      } else {
        // Validate phone number based on country
        const phoneRegex = country.toLowerCase() === 'nigeria' 
          ? /^(\+0)[789]\d{9}$/ 
          : /^(\+233|0)[235]\d{8}$/;
        
        if (!phoneRegex.test(details.phone)) {
          errors.phone = `Invalid ${country} phone number`;
        }
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 