import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import OfflineIndicator from './OfflineIndicator';
import { FaBell } from 'react-icons/fa';

function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav className="bg-blue-600">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-white text-2xl font-bold">
            Kilcode
          </Link>
          <div className="flex items-center space-x-4">
            <OfflineIndicator />
            <Link to="/" className="text-white hover:text-gray-200">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/submit-code" className="text-white hover:text-gray-200">
                  Submit Code
                </Link>
                <Link to="/dashboard" className="text-white hover:text-gray-200">
                  Dashboard
                </Link>
                <Link to="/notifications" className="text-white hover:text-gray-200 relative">
                  <FaBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="text-white hover:text-gray-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-gray-200">
                  Login
                </Link>
                <Link to="/register" className="text-white hover:text-gray-200">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;