import { getCountryConfig } from '../config/countryConfig';
import { SyncManager } from './syncManager';
import toast from 'react-hot-toast';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.connectionStatus = 'initializing';
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.RECONNECT_INTERVAL = 5000;
    this.reconnectTimeout = null;
    this.isConnecting = false;
    this.pingInterval = null;
    this.PING_INTERVAL = 30000; // 30 seconds
    this.lastToken = null;
  }

  setupBFCacheHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.connect();
      } else {
        this.cleanup();
      }
    });

    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        this.connect();
      }
    });
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      try {
        listener(type, data);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !userData?.country) {
      console.log('Missing token or country');
      this.isConnecting = false;
      this.notifyListeners('error', { 
        type: 'AUTH_ERROR', 
        message: 'Authentication required' 
      });
      return;
    }

    // Reset reconnect attempts if token changes
    if (token !== this.lastToken) {
      this.reconnectAttempts = 0;
    }

    // Don't reconnect with same token if connection failed
    if (token === this.lastToken && this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnection attempts reached with current token');
      this.notifyListeners('error', {
        type: 'MAX_RECONNECTS',
        message: 'Connection failed. Please try logging in again.'
      });
      return;
    }

    try {
      this.cleanup();

      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws`;
      const cleanToken = token.replace('Bearer ', '');
      const params = new URLSearchParams({
        token: cleanToken,
        country: userData.country.toLowerCase()
      });
      
      console.log('Connecting to WebSocket...');
      
      this.ws = new WebSocket(`${wsUrl}?${params.toString()}`);
      this.lastToken = token;
      this.setupWebSocketHandlers();

      // Set connection timeout
      setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          console.log('Connection timeout');
          this.ws.close();
          this.handleError(new Error('Connection timeout'));
        }
      }, 10000);

    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error('WebSocket error:', error);
    this.isConnecting = false;
    this.connectionStatus = 'error';

    // Check if error is due to authentication
    const isAuthError = error.message?.includes('403') || 
                       error.message?.includes('401') ||
                       error.message?.includes('validate credentials');

    if (isAuthError) {
      this.notifyListeners('error', { 
        type: 'AUTH_ERROR', 
        message: 'Authentication failed. Please log in again.' 
      });
      // Don't retry on auth errors
      this.reconnectAttempts = this.MAX_RECONNECT_ATTEMPTS;
      return;
    }

    this.notifyListeners('error', { 
      type: 'CONNECTION_ERROR', 
      message: error.message 
    });

    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    } else {
      this.notifyListeners('error', {
        type: 'MAX_RECONNECTS',
        message: 'Connection failed. Please refresh the page.'
      });
    }
  }

  setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.notifyListeners('connectionChange', { status: 'connected' });
      this.startPingInterval();
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code);
      this.cleanup();
      
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.handleError(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  handleMessage(data) {
    console.log('Received WebSocket message:', data);
    
    try {
      switch (data.type) {
        case 'CODE_STATUS_UPDATE':
          this.handleCodeStatusUpdate(data);
          break;
        case 'CODE_VERIFIED':
          this.handleCodeVerified(data);
          break;
        case 'PAYMENT_VERIFICATION':
          this.handlePaymentVerification(data);
          break;
        case 'ADMIN_NOTE':
          this.handleAdminNote(data);
          break;
        case 'NEW_CODE_SUBMITTED':
          this.handleNewCodeSubmitted(data);
          break;
        case 'CODE_PURCHASED':
          this.handleCodePurchased(data);
          break;
        case 'NEW_REVIEW_ADDED':
          this.handleNewReview(data);
          break;
        case 'PONG':
          // Handle ping response
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
      
      // Notify all listeners about the message
      this.notifyListeners('message', data);
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  handleCodeStatusUpdate(data) {
    const statusMessages = {
      won: 'Congratulations! Your betting code has won! 🎉',
      lost: 'Sorry, your betting code did not win this time.',
      pending: 'Your code is being reviewed by an admin.',
      processing: 'Your code is being processed.',
      rejected: 'Your code was rejected. Please check the admin note.'
    };

    const message = statusMessages[data.status] || `Status updated to: ${data.status}`;
    
    toast(message, {
      icon: data.status === 'won' ? '🎉' : 
            data.status === 'lost' ? '😔' : 
            data.status === 'rejected' ? '❌' : 'ℹ️',
      duration: 5000
    });

    if (data.admin_note) {
      toast.info(`Admin note: ${data.admin_note}`, { duration: 7000 });
    }
  }

  handleCodeVerified(data) {
    console.log('=== HANDLING CODE VERIFICATION ===');
    console.log('Received data:', data);
    
    const { status, note, reward_amount, new_balance } = data.data || {};
    
    try {
      // Show appropriate toast notification
      if (status === 'won') {
        toast.success('Your betting code has won! 🎉', { duration: 5000 });
        
        if (reward_amount) {
          toast.success(`Reward: ${reward_amount}`, { duration: 5000 });
        }
        
        // Force balance update in UI
        if (new_balance !== undefined) {
          console.log('Broadcasting new balance:', new_balance);
          this.notifyListeners('message', {
            type: 'CODE_VERIFICATION',
            data: {
              new_balance: new_balance,
              transaction: data.data.transaction
            }
          });
          
          // Force UI refresh
          localStorage.setItem('wallet_balance_update', Date.now().toString());
          localStorage.removeItem('wallet_balance_update');
          
          // Notify sync manager to refresh data
          SyncManager.requestSync('transactions');
        }
      } else if (status === 'lost') {
        toast.error('Sorry, your betting code did not win.', { duration: 5000 });
      }
      
      // Show admin note if present
      if (note) {
        toast.info(`Admin note: ${note}`, { duration: 7000 });
      }
      
    } catch (error) {
      console.error('Error handling code verification:', error);
      toast.error('Error updating balance. Please refresh the page.');
    }
  }

  handlePaymentVerification(data) {
    console.log('=== HANDLING PAYMENT VERIFICATION ===');
    console.log('Received data:', data);
    
    const { status, amount, currency, new_balance, note } = data.data || {};
    
    try {
      // Update local storage with new balance
      localStorage.setItem('wallet_balance_update', new_balance?.toString());
      
      // Dispatch custom event for balance update
      window.dispatchEvent(new CustomEvent('wallet-balance-updated', {
        detail: { balance: new_balance }
      }));
      
      // Show appropriate toast notification
      if (status === 'approved') {
        toast.success(`Withdrawal of ${currency} ${amount} approved!`, {
          duration: 5000
        });
      } else if (status === 'rejected') {
        toast.error(`Withdrawal rejected${note ? `: ${note}` : ''}`, {
          duration: 7000
        });
      }
      
      // Refresh transactions list if available
      if (window.refreshTransactions) {
        window.refreshTransactions();
      }
      
    } catch (error) {
      console.error('Error handling payment verification:', error);
    }
  }

  handleAdminNote(data) {
    const { message, type } = data;
    
    toast(message, {
      icon: type === 'info' ? 'ℹ️' : 
            type === 'warning' ? '⚠️' : 
            type === 'error' ? '❌' : '📝',
      duration: 5000
    });
  }

  cleanup() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (err) {
        console.error('Error closing WebSocket:', err);
      }
      this.ws = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.isConnecting = false;
  }

  startPingInterval() {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, this.PING_INTERVAL);
  }

  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (document.visibilityState === 'visible') {
        this.connect();
      }
    }, delay);
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }

  sendCountryMessage(type, data) {
    return this.send({
      type,
      data,
      country: this.country,
      timestamp: new Date().toISOString()
    });
  }
}

export const wsManager = new WebSocketManager(); 