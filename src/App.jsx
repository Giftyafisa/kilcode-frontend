import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitCode from './pages/SubmitCode';
import Notifications from './pages/Notifications';
import Marketplace from './pages/marketplace';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentVerification from './components/PaymentVerification';
import { AuthProvider } from './context/AuthContext';
import { BettingProvider } from './context/BettingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BettingProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/payment" element={<PaymentVerification />} />
              <Route path="/payment/verify" element={<PaymentVerification />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-code"
                element={
                  <ProtectedRoute>
                    <SubmitCode />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <ToastContainer position="bottom-right" />
          </div>
        </BettingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;