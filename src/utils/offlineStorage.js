const CACHE_KEY = 'ws_offline_cache';
const MESSAGE_QUEUE_KEY = 'ws_message_queue';
const MAX_CACHE_ITEMS = 50;
const MAX_QUEUE_ITEMS = 25;
const MAX_CACHE_AGE = 3 * 24 * 60 * 60 * 1000;
const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024;
const BETTING_CODES_KEY = 'offline_betting_codes';
const PENDING_SUBMISSIONS_KEY = 'pending_betting_submissions';

const getStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length * 2;
    }
  }
  return total;
};

export const OfflineStorage = {
  // Cache management
  saveToCache: async function(data) {
    try {
      if (getStorageSize() > MAX_STORAGE_SIZE) {
        await this.cleanupStorage(true);
      }

      let cacheData = [];
      try {
        const cache = localStorage.getItem(CACHE_KEY);
        cacheData = cache ? JSON.parse(cache) : [];
      } catch (e) {
        cacheData = [];
      }

      // If data is an array, merge it
      if (Array.isArray(data)) {
        cacheData = [...cacheData, ...data.slice(-MAX_CACHE_ITEMS)];
      } else {
        cacheData.push({ ...data, timestamp: Date.now() });
      }

      // Keep only recent items
      const now = Date.now();
      cacheData = cacheData
        .filter(item => (now - (item.timestamp || 0)) < MAX_CACHE_AGE)
        .slice(-MAX_CACHE_ITEMS);

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {
          await this.cleanupStorage(true);
          localStorage.setItem(CACHE_KEY, JSON.stringify(
            Array.isArray(data) ? data.slice(-5) : [data]
          ));
        }
      }
    } catch (error) {
      console.error('Failed to save to cache:', error);
      await this.cleanupStorage(true);
    }
  },

  getCache: async function() {
    try {
      const cache = localStorage.getItem(CACHE_KEY) || '[]';
      const cacheData = JSON.parse(cache);
      
      // Filter out expired items
      const now = Date.now();
      return cacheData.filter(item => 
        (now - (item.timestamp || 0)) < MAX_CACHE_AGE
      );
    } catch (error) {
      console.error('Failed to get cache:', error);
      return [];
    }
  },

  // Message queue management
  addToMessageQueue: async function(message) {
    try {
      const queue = localStorage.getItem(MESSAGE_QUEUE_KEY) || '[]';
      let messageQueue = JSON.parse(queue);
      
      messageQueue.push({ ...message, timestamp: Date.now() });

      if (messageQueue.length > MAX_QUEUE_ITEMS) {
        messageQueue = messageQueue.slice(-MAX_QUEUE_ITEMS);
      }

      localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(messageQueue));
    } catch (error) {
      console.error('Failed to add to message queue:', error);
      await this.cleanupStorage();
    }
  },

  // Storage cleanup
  cleanupStorage: async function(force = false) {
    try {
      const cache = await this.getCache();
      const now = Date.now();
      const recentCache = cache
        .filter(item => (now - (item.timestamp || 0)) < (MAX_CACHE_AGE / 2))
        .slice(-Math.floor(MAX_CACHE_ITEMS / 2));
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(recentCache));

      const queue = await this.getMessageQueue();
      const recentQueue = queue.slice(-Math.floor(MAX_QUEUE_ITEMS / 2));
      localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(recentQueue));
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
    }
  },

  getMessageQueue: async function() {
    try {
      const queue = localStorage.getItem(MESSAGE_QUEUE_KEY) || '[]';
      return JSON.parse(queue);
    } catch (error) {
      console.error('Failed to get message queue:', error);
      return [];
    }
  },

  clearCache: async function() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  },

  clearMessageQueue: async function() {
    try {
      localStorage.removeItem(MESSAGE_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear message queue:', error);
    }
  },

  // Store betting code for offline submission
  storeBettingCode: async function(codeData) {
    try {
      const pendingCodes = await this.getPendingBettingCodes();
      
      // Validate required fields
      if (!codeData.bookmaker) {
        throw new Error('Bookmaker is required');
      }
      if (!codeData.code) {
        throw new Error('Code is required');
      }
      if (!codeData.stake) {
        throw new Error('Stake is required');
      }
      if (!codeData.odds) {
        throw new Error('Odds is required');
      }

      // Format betting code
      let formattedCode = codeData.code.toString().trim();
      
      if (codeData.bookmaker.toLowerCase() === 'nairabet') {
        // Remove all spaces and special characters
        formattedCode = formattedCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        
        // Ensure proper NB- prefix
        if (!formattedCode.startsWith('NB-')) {
          formattedCode = formattedCode.replace(/^NB/i, '');
          formattedCode = `NB-${formattedCode}`;
        }
        
        // Validate exactly 8 digits after NB-
        const digits = formattedCode.replace(/^NB-/i, '');
        if (digits.length !== 8 || !/^\d+$/.test(digits)) {
          throw new Error('Nairabet code must be exactly 8 digits (e.g., NB-12345678)');
        }
      }

      // Calculate potential winnings
      const potentialWinnings = parseFloat(codeData.stake) * parseFloat(codeData.odds);

      const formattedData = {
        bookmaker: codeData.bookmaker.toLowerCase(),
        code: formattedCode,
        stake: parseFloat(codeData.stake),
        odds: parseFloat(codeData.odds),
        potential_winnings: potentialWinnings,
        status: 'pending',
        id: `offline_${Date.now()}`,
        timestamp: Date.now(),
        country: codeData.country?.toLowerCase() || 'nigeria'
      };

      // Validate all required fields are present and have correct types
      console.log('Storing betting code:', formattedData);

      pendingCodes.push(formattedData);
      localStorage.setItem(
        PENDING_SUBMISSIONS_KEY, 
        JSON.stringify(pendingCodes.slice(-MAX_CACHE_ITEMS))
      );

      return true;
    } catch (error) {
      console.error('Failed to store betting code:', error);
      return false;
    }
  },

  // Get pending betting codes
  getPendingBettingCodes: async function() {
    try {
      const codes = localStorage.getItem(PENDING_SUBMISSIONS_KEY);
      return codes ? JSON.parse(codes) : [];
    } catch (error) {
      console.error('Failed to get pending betting codes:', error);
      return [];
    }
  },

  // Remove a pending betting code after successful submission
  removePendingBettingCode: async function(codeId) {
    try {
      const pendingCodes = await this.getPendingBettingCodes();
      const updatedCodes = pendingCodes.filter(code => code.id !== codeId);
      localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(updatedCodes));
      return true;
    } catch (error) {
      console.error('Failed to remove pending betting code:', error);
      return false;
    }
  },

  // Sync pending betting codes when online
  syncPendingBettingCodes: async function(submitFunction) {
    try {
      const pendingCodes = await this.getPendingBettingCodes();
      if (!pendingCodes.length) return { success: true, synced: 0 };

      let syncedCount = 0;
      const errors = [];

      for (const code of pendingCodes) {
        try {
          const result = await submitFunction(code);
          if (result.success) {
            await this.removePendingBettingCode(code.id);
            syncedCount++;
          } else {
            errors.push({ code: code.id, error: result.error });
          }
        } catch (error) {
          errors.push({ code: code.id, error: error.message });
        }
      }

      return {
        success: true,
        synced: syncedCount,
        failed: errors.length,
        errors
      };
    } catch (error) {
      console.error('Failed to sync pending betting codes:', error);
      return { success: false, error: error.message };
    }
  }
}; 