import { format, parseISO } from 'date-fns';

/**
 * Format a date string based on user's country settings
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - Optional format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  try {
    if (!date) return '';
    
    // If date is a string, parse it first
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date with time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(date);
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
};

/**
 * Check if a date is expired
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if date is expired
 */
export const isExpired = (date) => {
  if (!date) return true;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
  } catch (error) {
    console.error('Error checking date expiration:', error);
    return true;
  }
};

/**
 * Get time remaining until a date
 * @param {string|Date} date - The target date
 * @returns {string} Time remaining string
 */
export const getTimeRemaining = (date) => {
  if (!date) return 'Expired';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    
    if (dateObj < now) return 'Expired';
    
    const diffInSeconds = Math.floor((dateObj - now) / 1000);
    
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m remaining`;
    }
    
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      return `${hours}h ${minutes}m remaining`;
    }
    
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d remaining`;
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return 'Expired';
  }
}; 