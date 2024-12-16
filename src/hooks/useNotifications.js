import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getNotification, NOTIFICATION_TYPES } from '../utils/notifications';
import { wsManager } from '../utils/websocketManager';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const notify = (type, subType, params = {}) => {
    const notification = getNotification(user?.country, type, subType, params);
    if (!notification) return;

    toast(notification.message, {
      icon: notification.icon,
      duration: 5000,
      position: 'top-right'
    });
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Fetched notifications:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notify('CONNECTION', NOTIFICATION_TYPES.CONNECTION.ONLINE);
    };

    const handleOffline = () => {
      setIsOnline(false);
      notify('CONNECTION', NOTIFICATION_TYPES.CONNECTION.OFFLINE);
    };

    const handleWebSocketEvent = (type, data) => {
      if (type === 'sync') {
        setIsSyncing(data.status === 'started');
        notify('SYNC', 
          data.status === 'started' 
            ? NOTIFICATION_TYPES.SYNC.STARTED 
            : NOTIFICATION_TYPES.SYNC.COMPLETED,
          { count: data.updatesCount }
        );
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const cleanup = wsManager.addListener(handleWebSocketEvent);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup();
    };
  }, []);

  return {
    notifications,
    isLoading,
    fetchNotifications,
    notify,
    isOnline,
    isSyncing
  };
}; 