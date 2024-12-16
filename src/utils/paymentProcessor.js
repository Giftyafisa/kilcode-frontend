import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const processPayment = async (type, data, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/${type}/initialize`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    switch (type) {
      case 'paystack':
        // Redirect to Paystack checkout
        window.location.href = response.data.authorization_url;
        break;

      case 'mtn_momo':
      case 'vodafone_cash':
        return {
          reference: response.data.reference,
          ussdCode: response.data.ussd_code,
          instructions: response.data.instructions
        };

      case 'bank_transfer':
        return {
          accountNumber: response.data.account_number,
          bankName: response.data.bank_name,
          reference: response.data.reference
        };

      default:
        throw new Error('Unsupported payment method');
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Payment processing failed');
  }
}; 