import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { bettingService } from '../services/bettingService';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { OfflineStorage } from '../utils/offlineStorage';
import { wsManager } from '../utils/websocketManager';
import { getCountryConfig } from '../config/countryConfig';
import { validateBettingCode, validateStakeAndOdds } from '../utils/bettingCodeValidator';

const BettingContext = createContext(null);

const initialState = {
  bettingCodes: [],
  pendingCodes: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    dateRange: 'all',
    bookmaker: 'all'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
};

const BETTING_STATES = {
  SUBMITTED: 'submitted',
  AWAITING_ADMIN: 'awaiting_admin',
  ADMIN_REVIEWING: 'admin_reviewing',
  VERIFICATION_PENDING: 'verification_pending',
  VERIFIED: 'verified',
  GAME_IN_PROGRESS: 'game_in_progress',
  WON: 'won',
  LOST: 'lost',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

const bettingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BETTING_CODES':
      return { ...state, bettingCodes: action.payload };
    case 'ADD_BETTING_CODE':
      return { 
        ...state, 
        bettingCodes: [action.payload, ...state.bettingCodes],
        pendingCodes: [action.payload, ...state.pendingCodes]
      };
    case 'UPDATE_CODE_STATUS':
      return {
        ...state,
        bettingCodes: state.bettingCodes.map(code =>
          code.id === action.payload.id 
            ? { 
                ...code, 
                status: action.payload.status,
                message: action.payload.message,
                verificationDetails: action.payload.verificationDetails,
                updatedAt: new Date().toISOString()
              }
            : code
        ),
        pendingCodes: state.pendingCodes.filter(code => 
          code.id !== action.payload.id || 
          action.payload.status === BETTING_STATES.AWAITING_ADMIN
        )
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case 'UPDATE_VERIFICATION_DETAILS':
      return {
        ...state,
        bettingCodes: state.bettingCodes.map(code =>
          code.id === action.payload.id 
            ? { 
                ...code, 
                verificationDetails: action.payload.details,
                lastChecked: new Date().toISOString()
              }
            : code
        )
      };
    default:
      return state;
  }
};

export const BettingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bettingReducer, initialState);
  const { user, loading: authLoading } = useAuth();

  // Wait for auth to complete before syncing
  useEffect(() => {
    if (!authLoading && user) {
      syncOfflineCodes();
    }
  }, [authLoading, user]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const handleWebSocketEvent = (type, data) => {
      if (!mounted) return;

      switch (type) {
        case 'message':
          if (data.type === 'CODE_STATUS_UPDATE') {
            dispatch({ 
              type: 'UPDATE_CODE_STATUS', 
              payload: data 
            });
          }
          break;
        case 'error':
          console.error('WebSocket error:', data);
          toast.error('Connection error. Retrying...');
          break;
        case 'connectionChange':
          if (data.status === 'connected') {
            toast.success('Real-time updates connected');
          }
          break;
      }
    };

    const cleanup = wsManager.addListener(handleWebSocketEvent);
    wsManager.connect(); // Connect after adding the listener

    return () => {
      mounted = false;
      cleanup();
      wsManager.cleanup();
    };
  }, [user]);

  const submitCode = async (codeData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Get user country from both localStorage and user object
      const userCountry = localStorage.getItem('userCountry')?.toLowerCase();
      const country = (userCountry || user?.country || '').toLowerCase();

      if (!country) {
        throw new Error('User country not found. Please log in again.');
      }

      // Validate country
      if (!['nigeria', 'ghana'].includes(country)) {
        throw new Error('Invalid country. Must be either Nigeria or Ghana.');
      }

      const { bookmaker, code: rawCode, stake, odds } = codeData;

      // Validate the code format using the validator
      const validationResult = validateBettingCode(rawCode, bookmaker, country);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Validate stake and odds
      const stakeValidation = validateStakeAndOdds(stake, odds, bookmaker, country);
      if (!stakeValidation.isValid) {
        throw new Error(stakeValidation.error);
      }

      // Use the formatted code from validation
      const formattedCode = validationResult.formattedCode;

      // Use the existing bookmaker mapping logic
      const bookmakerMappings = {
        'ghana': {
          'sportybet': 'sportybet',
          'betway': 'betway',
          'soccarbet': 'soccarbet',
          'bangbet': 'bangbet',
          '1xbet': '1xbet',
          'premierbet': 'premierbet'
        },
        'nigeria': {
          'sportybet': 'sportybet',
          'bet9ja': 'bet9ja',
          'nairabet': 'nairabet',
          'merrybet': 'merrybet',
          'bangbet': 'bangbet',
          '1xbet': '1xbet'
        }
      };

      const countryBookmakers = bookmakerMappings[country];
      if (!countryBookmakers) {
        throw new Error(`Invalid country: ${country}`);
      }

      const mappedBookmaker = countryBookmakers[bookmaker.toLowerCase()];
      if (!mappedBookmaker) {
        throw new Error(`${bookmaker} is not available in ${country}`);
      }

      // Prepare submission data with explicit user_country
      const submissionData = {
        user_country: country,  // Set user_country first
        bookmaker: mappedBookmaker,
        code: formattedCode,
        stake: parseFloat(stake),
        odds: parseFloat(odds),
        status: "pending"
      };

      // Log submission data for debugging
      console.log('Submitting betting code with:', submissionData);

      if (!navigator.onLine) {
        const stored = await OfflineStorage.storeBettingCode(submissionData);
        if (stored) {
          toast.success('Code saved offline. Will sync when online.');
          return { success: true, data: submissionData };
        } else {
          throw new Error('Failed to store code offline');
        }
      }

      // Set user country in localStorage before making the request
      localStorage.setItem('userCountry', country);

      const response = await bettingService.submitBettingCode({
        ...submissionData,
        user_country: country // Ensure user_country is included
      });

      dispatch({ type: 'ADD_BETTING_CODE', payload: response });
      toast.success('Betting code submitted successfully');
      return { success: true, data: response };

    } catch (error) {
      console.error('Code submission error:', error);
      const errorMessage = error.message || 'Failed to submit betting code';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return {
        success: false, 
        error: errorMessage,
        details: error.details || {} 
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchBettingHistory = async (page = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await bettingService.getBettingHistory({
        ...state.filters,
        page,
        limit: state.pagination.itemsPerPage
      });
      dispatch({ type: 'SET_BETTING_CODES', payload: response.codes });
      dispatch({ type: 'SET_PAGINATION', payload: response.pagination });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch betting history');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const syncOfflineCodes = async () => {
    if (!user?.country) {
      console.log('Waiting for user data before syncing...');
      return;
    }
    
    try {
      const result = await OfflineStorage.syncPendingBettingCodes(submitCode);
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} offline betting codes`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} codes`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync offline codes');
    }
  };

  return (
    <BettingContext.Provider value={{
      state,
      submitCode,
      fetchBettingHistory,
      setFilters: (filters) => dispatch({ type: 'SET_FILTERS', payload: filters })
    }}>
      {children}
    </BettingContext.Provider>
  );
};

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
}; 