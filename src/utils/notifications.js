export const NOTIFICATIONS = {
  nigeria: {
    payment: {
      success: {
        title: 'Payment Successful',
        message: '₦{amount} has been added to your account'
      },
      pending: {
        title: 'Payment Processing',
        message: 'Your payment of ₦{amount} is being processed'
      },
      failed: {
        title: 'Payment Failed',
        message: 'Unable to process payment of ₦{amount}'
      }
    },
    betting: {
      submitted: {
        title: 'Bet Submitted',
        message: 'Your betting code has been submitted successfully'
      },
      won: {
        title: 'Congratulations!',
        message: 'Your bet won! ₦{amount} has been added to your account'
      },
      lost: {
        title: 'Better Luck Next Time',
        message: 'Your bet did not win this time'
      }
    }
  },
  ghana: {
    payment: {
      success: {
        title: 'Payment Successful',
        message: 'GH₵{amount} has been added to your account'
      },
      pending: {
        title: 'Payment Processing',
        message: 'Your payment of GH₵{amount} is being processed'
      },
      failed: {
        title: 'Payment Failed',
        message: 'Unable to process payment of GH₵{amount}'
      }
    },
    betting: {
      submitted: {
        title: 'Bet Submitted',
        message: 'Your betting code has been submitted successfully'
      },
      won: {
        title: 'Congratulations!',
        message: 'Your bet won! GH₵{amount} has been added to your account'
      },
      lost: {
        title: 'Better Luck Next Time',
        message: 'Your bet did not win this time'
      }
    }
  }
};

export const NOTIFICATION_TYPES = {
  SYNC: {
    STARTED: 'sync_started',
    COMPLETED: 'sync_completed',
    FAILED: 'sync_failed'
  },
  CONNECTION: {
    ONLINE: 'connection_online',
    OFFLINE: 'connection_offline',
    RECONNECTING: 'connection_reconnecting'
  },
  BETTING: {
    SUBMITTED: 'betting_submitted',
    VERIFIED: 'betting_verified',
    REJECTED: 'betting_rejected'
  }
};

export const getNotification = (country, type, subType, params = {}) => {
  const countryNotifications = NOTIFICATIONS[country.toLowerCase()] || NOTIFICATIONS.nigeria;
  const notification = countryNotifications[type]?.[subType];
  
  if (!notification) return null;
  
  return {
    ...notification,
    message: notification.message.replace(
      /\{(\w+)\}/g,
      (match, key) => params[key] || match
    )
  };
}; 