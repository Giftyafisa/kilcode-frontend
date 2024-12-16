import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { wsManager } from '../utils/websocketManager';

export const useWebSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('initializing');

  useEffect(() => {
    if (!user) return;

    const handleWebSocketEvent = (type, data) => {
      switch (type) {
        case 'connectionChange':
          setIsConnected(data.status === 'connected');
          setConnectionStatus(data.status);
          if (data.status === 'connected') {
            setConnectionError(null);
          }
          break;
        case 'error':
          setConnectionError(data);
          break;
      }
    };

    const cleanup = wsManager.addListener(handleWebSocketEvent);

    return () => {
      cleanup();
    };
  }, [user]);

  const sendMessage = useCallback((message) => {
    return wsManager.send(message);
  }, []);

  const reconnect = useCallback(() => {
    wsManager.connect();
  }, []);

  return {
    isConnected,
    connectionError,
    connectionStatus,
    sendMessage,
    reconnect
  };
}; 