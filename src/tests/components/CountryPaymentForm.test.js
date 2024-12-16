import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CountryPaymentForm } from '../../components/payments/CountryPaymentForm';
import { AuthProvider } from '../../context/AuthContext';
import { MOCK_USERS } from '../utils/countryTestUtils';

describe('CountryPaymentForm', () => {
  const renderWithAuth = (country) => {
    const mockUser = MOCK_USERS[country];
    return render(
      <AuthProvider initialUser={mockUser}>
        <CountryPaymentForm />
      </AuthProvider>
    );
  };

  test('renders Nigeria-specific payment methods', () => {
    renderWithAuth('nigeria');
    
    expect(screen.getByText('Card Payment (Paystack)')).toBeInTheDocument();
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
    expect(screen.queryByText('MTN Mobile Money')).not.toBeInTheDocument();
  });

  test('renders Ghana-specific payment methods', () => {
    renderWithAuth('ghana');
    
    expect(screen.getByText('MTN Mobile Money')).toBeInTheDocument();
    expect(screen.getByText('Vodafone Cash')).toBeInTheDocument();
    expect(screen.queryByText('Card Payment (Paystack)')).not.toBeInTheDocument();
  });

  // Add more tests...
}); 