import { OfflineStorage } from './offlineStorage';

export class SyncManager {
  static VERSION_KEY = 'data_version';
  static SYNC_TIMESTAMP = 'last_sync';

  static async getLastSyncTimestamp() {
    return localStorage.getItem(this.SYNC_TIMESTAMP) || '0';
  }

  static async setLastSyncTimestamp() {
    localStorage.setItem(this.SYNC_TIMESTAMP, Date.now().toString());
  }

  static async getDataVersion() {
    return localStorage.getItem(this.VERSION_KEY) || '0';
  }

  static async setDataVersion(version) {
    localStorage.setItem(this.VERSION_KEY, version);
  }

  static async synchronize(apiUrl, token) {
    try {
      // Track sync attempt
      const syncAttempt = {
        startTime: Date.now(),
        status: 'started',
        errors: []
      };

      const lastSync = await this.getLastSyncTimestamp();
      const currentVersion = await this.getDataVersion();

      try {
        const response = await fetch(`${apiUrl}/sync`, {
          method: 'POST',
          headers: {
            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lastSync,
            version: currentVersion
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Sync failed');
        }

        const { updates, newVersion } = await response.json();

        // Process updates with tracking
        let processedCount = 0;
        let failedCount = 0;
        
        if (updates?.length > 0) {
          for (const update of updates) {
            try {
              await this.processUpdate(update);
              processedCount++;
            } catch (error) {
              failedCount++;
              syncAttempt.errors.push({
                type: update.type,
                error: error.message,
                data: update
              });
            }
          }
        }

        // Update version and timestamp
        await this.setDataVersion(newVersion);
        await this.setLastSyncTimestamp();

        // Update sync status
        syncAttempt.status = 'completed';
        syncAttempt.endTime = Date.now();
        syncAttempt.stats = {
          total: updates?.length || 0,
          processed: processedCount,
          failed: failedCount
        };

        // Save sync history
        await this.saveSyncHistory(syncAttempt);

        return { 
          success: true, 
          processed: processedCount,
          failed: failedCount,
          errors: syncAttempt.errors
        };

      } catch (error) {
        syncAttempt.status = 'failed';
        syncAttempt.endTime = Date.now();
        syncAttempt.errors.push({
          type: 'sync',
          error: error.message
        });
        await this.saveSyncHistory(syncAttempt);
        throw error;
      }
    } catch (error) {
      console.error('Synchronization failed:', error);
      return { 
        success: false, 
        error: error.message,
        details: error.errors || []
      };
    }
  }

  static async saveSyncHistory(syncAttempt) {
    try {
      const history = JSON.parse(localStorage.getItem('sync_history') || '[]');
      history.push(syncAttempt);
      // Keep last 50 sync attempts
      while (history.length > 50) history.shift();
      localStorage.setItem('sync_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save sync history:', error);
    }
  }

  static async processUpdates(updates) {
    for (const update of updates) {
      switch (update.type) {
        case 'CODE_STATUS':
          await this.handleCodeStatusUpdate(update);
          break;
        case 'PAYMENT_STATUS':
          await this.handlePaymentStatusUpdate(update);
          break;
        case 'USER_SETTINGS':
          await this.handleSettingsUpdate(update);
          break;
        // Add more cases as needed
      }
    }
  }

  static async handleCodeStatusUpdate(update) {
    try {
      const cache = await OfflineStorage.getCache();
      
      if (!update || !update.code) {
        console.error('Invalid update data:', update);
        return;
      }

      // Find and update existing item or add new one
      const existingIndex = cache.findIndex(item => 
        item.type === 'CODE_STATUS' && 
        item.code === update.code
      );

      const updatedItem = {
        ...update,
        timestamp: Date.now(),
        synced: true // Add sync status
      };

      if (existingIndex >= 0) {
        cache[existingIndex] = {
          ...cache[existingIndex],
          ...updatedItem
        };
      } else {
        cache.push(updatedItem);
      }

      await OfflineStorage.saveToCache(cache);
      return true;
    } catch (error) {
      console.error('Failed to handle code status update:', error);
      throw error; // Propagate error for better tracking
    }
  }

  static async handlePaymentStatusUpdate(update) {
    // Implementation for handling payment status updates
    // Similar to code status updates
  }

  static async handleSettingsUpdate(update) {
    // Implementation for handling settings updates
    localStorage.setItem('user_settings', JSON.stringify(update.settings));
  }

  static async syncPendingCodes() {
    try {
      const pendingCodes = await OfflineStorage.getPendingBettingCodes();
      if (!pendingCodes.length) return { success: true, synced: 0 };

      let syncedCount = 0;
      const errors = [];

      for (const code of pendingCodes) {
        try {
          // Try to send via WebSocket first
          const wsSuccess = window.wsManager?.send({
            type: 'CODE_SUBMITTED',
            data: {
              ...code,
              status: 'pending',
              submittedAt: new Date().toISOString()
            },
            messageId: code.id
          });

          if (wsSuccess) {
            // If WebSocket succeeds, try API submission
            await bettingService.submitBettingCode(code);
            await OfflineStorage.removePendingBettingCode(code.id);
            syncedCount++;
          } else {
            errors.push({ code: code.id, error: 'WebSocket send failed' });
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
      console.error('Failed to sync pending codes:', error);
      return { success: false, error: error.message };
    }
  }
} 