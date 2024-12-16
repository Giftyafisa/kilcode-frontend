import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const paymentVerified = localStorage.getItem('payment_verified') === 'true';
  const paymentReference = localStorage.getItem('payment_reference');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access to payment page
  if (location.pathname === '/payment') {
    return children;
  }

  // Check payment verification
  if (!user.is_verified && !paymentVerified) {
    return <Navigate to="/payment" replace />;
  }

  return children;
};

export default ProtectedRoute;