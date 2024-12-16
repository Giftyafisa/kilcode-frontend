import React from 'react';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { wsManager } from '../utils/websocketManager';
import { OfflineStorage } from '../utils/offlineStorage';

function OfflineIndicator() {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [syncing, setSyncing] = React.useState(false);

  // Check pending items and online status
  React.useEffect(() => {
    const checkPending = async () => {
      const codes = await OfflineStorage.getPendingBettingCodes();
      setPendingCount(codes.length);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    checkPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
      isOffline ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      {isOffline ? (
        <>
          <FaExclamationTriangle className="mr-2" />
          Offline
        </>
      ) : (
        <>
          <FaWifi className="mr-2" />
          {syncing ? 'Syncing...' : `${pendingCount} pending`}
        </>
      )}
    </div>
  );
}

export default OfflineIndicator; 