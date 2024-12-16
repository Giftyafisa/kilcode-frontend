import React, { useState, useEffect } from 'react';
import { useCountryConfig } from '../hooks/useCountryConfig';
import { useBetting } from '../context/BettingContext';
import { useAuth } from '../context/AuthContext';
import { validateBettingCode, formatBettingCode } from '../utils/bettingCodeValidator';
import toast from 'react-hot-toast';
import BettingConfirmationModal from '../components/betting/BettingConfirmationModal';
import { wsManager } from '../utils/websocketManager';
import { OfflineStorage } from '../utils/offlineStorage';

function SubmitCode() {
  const { user } = useAuth();
  const { config, formatCurrency } = useCountryConfig(user?.country);
  const { submitCode } = useBetting();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookmaker: '',
    code: '',
    stake: '',
    odds: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState({
    status: 'idle', // idle, submitting, success, error
    message: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    bookmaker: '',
    code: '',
    stake: '',
    odds: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [potentialWinnings, setPotentialWinnings] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (formData.bookmaker) {
      const bookmaker = config.bookmakers.find(b => b.id === formData.bookmaker);
      if (bookmaker) {
        setFormData(prev => ({
          ...prev,
          code: bookmaker.prefix ? `${bookmaker.prefix}-` : ''
        }));
      }
    }
  }, [formData.bookmaker]);

  useEffect(() => {
    if (!user?.country) {
      toast.error('Please log in to submit betting codes');
    }
  }, [user]);

  const handleCodeChange = (e) => {
    let rawCode = e.target.value.toUpperCase();
    if (!formData.bookmaker) {
      setFormData(prev => ({ ...prev, code: rawCode }));
      return;
    }

    const bookmaker = config.bookmakers.find(b => b.id === formData.bookmaker);
    if (!bookmaker) return;

    const prefix = bookmaker.prefix;

    // Remove any existing prefix, multiple dashes, and spaces
    let cleanCode = rawCode
      .replace(new RegExp(`^${prefix}`, 'i'), '') // Remove prefix if exists
      .replace(/[-\s]+/g, '')                     // Remove all dashes and spaces
      .replace(/[^A-Z0-9]/g, '');                 // Remove any non-alphanumeric chars

    // Format the code with correct prefix and no double dash
    let formattedCode = cleanCode ? `${prefix}${cleanCode}` : prefix;

    // Limit the length based on bookmaker's pattern
    const maxLength = bookmaker.codeFormat.length;
    if (formattedCode.length > maxLength) {
      formattedCode = formattedCode.slice(0, maxLength);
    }

    setFormData(prev => ({ ...prev, code: formattedCode }));

    // Validate the code
    const validation = validateBettingCode(
      formattedCode,
      formData.bookmaker,
      user?.country || 'ghana'
    );

    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        code: validation.error
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        code: ''
      }));
    }
  };

  const validateForm = () => {
    if (!user?.country) {
      toast.error('Please log in to submit betting codes');
      return false;
    }

    const errors = {};
    const bookmaker = config.bookmakers.find(b => b.id === formData.bookmaker);

    // Validate bookmaker
    if (!formData.bookmaker) {
      errors.bookmaker = 'Please select a bookmaker';
    }

    // Validate code
    if (!formData.code) {
      errors.code = 'Betting code is required';
    } else {
      const validation = validateBettingCode(formData.code, formData.bookmaker, user.country);
      if (!validation.isValid) {
        errors.code = validation.error;
      }
    }

    // Validate stake with proper currency formatting
    const stake = parseFloat(formData.stake);
    if (!formData.stake || isNaN(stake)) {
      errors.stake = 'Please enter a valid stake amount';
    } else if (bookmaker && stake < bookmaker.minStake) {
      errors.stake = `Minimum stake is ${config.currency.format(bookmaker.minStake)}`;
    } else if (bookmaker && stake > bookmaker.maxStake) {
      errors.stake = `Maximum stake is ${config.currency.format(bookmaker.maxStake)}`;
    }

    // Validate odds
    const odds = parseFloat(formData.odds);
    if (!formData.odds || isNaN(odds)) {
      errors.odds = 'Please enter valid odds';
    } else if (bookmaker && odds < bookmaker.minOdds) {
      errors.odds = `Minimum odds is ${bookmaker.minOdds}`;
    } else if (bookmaker && odds > bookmaker.maxOdds) {
      errors.odds = `Maximum odds is ${bookmaker.maxOdds}`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookmakerChange = (e) => {
    const newBookmaker = e.target.value;
    setFormData(prev => ({
      ...prev,
      bookmaker: newBookmaker,
      // Reset code when bookmaker changes
      code: newBookmaker ? 
        (config.bookmakers.find(b => b.id === newBookmaker)?.prefix || '') + '-' 
        : ''
    }));
    
    // Clear validation errors when bookmaker changes
    setValidationErrors(prev => ({
      ...prev,
      bookmaker: '',
      code: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    // Calculate potential winnings
    const stake = parseFloat(formData.stake);
    const odds = parseFloat(formData.odds);
    const winnings = stake * odds;

    // Show confirmation modal
    setPotentialWinnings(winnings);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!user?.country) {
      toast.error('Please log in to submit betting codes');
      return;
    }

    setLoading(true);
    setShowConfirmation(false);

    const submissionData = {
      user_country: user.country.toLowerCase(),
      bookmaker: formData.bookmaker,
      code: formData.code.trim().toUpperCase(),
      stake: parseFloat(formData.stake),
      odds: parseFloat(formData.odds)
    };

    try {
      // Validate required fields
      const requiredFields = ['user_country', 'bookmaker', 'code', 'stake', 'odds'];
      const missingFields = requiredFields.filter(field => !submissionData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const result = await submitCode(submissionData);
      
      if (result.success) {
        toast.success('Betting code submitted successfully!');
        setFormData({ bookmaker: '', code: '', stake: '', odds: '' });
        setPotentialWinnings(0);
      } else {
        throw new Error(result.error || 'Failed to submit betting code');
      }
    } catch (error) {
      console.error('Submit betting code error:', error);
      toast.error(error.message || 'Failed to submit betting code');
      
      // Only store for offline if it's a network error
      if (!navigator.onLine) {
        await OfflineStorage.storeBettingCode(submissionData);
        toast('Code saved for retry when connection improves', {
          icon: '🔄',
          duration: 4000,
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.stake && formData.odds) {
      const stake = parseFloat(formData.stake);
      const odds = parseFloat(formData.odds);
      if (!isNaN(stake) && !isNaN(odds)) {
        setPotentialWinnings(stake * odds);
      }
    }
  }, [formData.stake, formData.odds]);

  useEffect(() => {
    if (!user?.country) return;
    
    const unsubscribe = wsManager.addListener((type, data) => {
      if (type === 'message' && data.type === 'CODE_STATUS_UPDATE') {
        toast.success(`Code status: ${data.status}`);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Submit Betting Code</h1>
      
      {/* Add submission status banner */}
      {submissionStatus.status !== 'idle' && (
        <div className={`mb-4 p-4 rounded-md ${
          submissionStatus.status === 'submitting' ? 'bg-blue-50 text-blue-700' :
          submissionStatus.status === 'success' ? 'bg-green-50 text-green-700' :
          'bg-red-50 text-red-700'
        }`}>
          {submissionStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bookmaker
          </label>
          <select
            value={formData.bookmaker}
            onChange={handleBookmakerChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Bookmaker</option>
            {config.bookmakers.map(bookmaker => (
              <option key={bookmaker.id} value={bookmaker.id}>
                {bookmaker.name}
              </option>
            ))}
          </select>
          {validationErrors.bookmaker && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.bookmaker}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Betting Code
          </label>
          <div className="mt-1">
            <input
              type="text"
              value={formData.code}
              onChange={handleCodeChange}
              placeholder={formData.bookmaker ? 
                config.bookmakers.find(b => b.id === formData.bookmaker)?.codeExample :
                'Select a bookmaker first'
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {formData.bookmaker && (
              <p className="mt-1 text-sm text-gray-500">
                Example: {config.bookmakers.find(b => b.id === formData.bookmaker)?.codeExample}
              </p>
            )}
            {validationErrors.code && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.code}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stake Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {config.currency.symbol}
                </span>
              </div>
              <input
                type="number"
                value={formData.stake}
                onChange={(e) => setFormData({ ...formData, stake: e.target.value })}
                className="block w-full pl-7 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {validationErrors.stake && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.stake}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Odds
            </label>
            <input
              type="number"
              value={formData.odds}
              onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
              step="0.01"
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {validationErrors.odds && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.odds}</p>
            )}
          </div>
        </div>

        {/* Add potential winnings display */}
        {formData.stake && formData.odds && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Potential Winnings</p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(potentialWinnings)}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Code'}
        </button>
      </form>

      {/* Add confirmation modal */}
      <BettingConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        data={formData}
        potentialWinnings={potentialWinnings}
      />
    </div>
  );
}

export default SubmitCode;