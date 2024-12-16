import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

const Notifications = () => {
  const { notifications, isLoading } = useNotifications();

  if (isLoading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-panel">
      {notifications.length === 0 ? (
        <div>No notifications</div>
      ) : (
        notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.read ? 'read' : 'unread'}`}>
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <small>{new Date(notification.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications; 