import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const verifyPayment = async (reference, token) => {
  try {
    // Check if this is a marketplace payment
    const pendingPurchase = localStorage.getItem('pendingMarketplacePurchase');
    const isMarketplace = pendingPurchase ? true : false;

    console.log('Verifying payment:', {
      reference,
      type: isMarketplace ? 'marketplace' : 'registration',
      pendingPurchase: pendingPurchase ? JSON.parse(pendingPurchase) : null
    });

    const endpoint = isMarketplace 
      ? '/marketplace/verify-payment'
      : '/payments/verify';

    const response = await axios.post(
      `${API_URL}${endpoint}`,
      { 
        reference,
        ...(isMarketplace && {
          code_id: JSON.parse(pendingPurchase).code_id,
          amount: JSON.parse(pendingPurchase).price
        })
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // Clear pending purchase data if it exists
    if (pendingPurchase) {
      localStorage.removeItem('pendingMarketplacePurchase');
    }

    return {
      success: true,
      data: response.data,
      redirect: isMarketplace ? '/marketplace/purchases' : '/dashboard'
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Payment verification failed'
    };
  }
}; 