import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * @param {...string} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Date format (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'MMM dd, yyyy') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };
  
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  if (typeof amount !== 'number') return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate time difference in human readable format
 * @param {Date|string} date - Date to compare
 * @returns {string} Human readable time difference
 */
export function timeAgo(date) {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate random ID
 * @param {number} length - Length of ID (default: 8)
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export function getInitials(name) {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalizeWords(str) {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return text.slice(0, length) + '...';
}

/**
 * Get status color based on status value
 * @param {string} status - Status value
 * @returns {string} Tailwind color class
 */
export function getStatusColor(status) {
  const statusColors = {
    active: 'text-success-600 bg-success-50',
    inactive: 'text-secondary-600 bg-secondary-50',
    pending: 'text-warning-600 bg-warning-50',
    approved: 'text-success-600 bg-success-50',
    rejected: 'text-error-600 bg-error-50',
    probation: 'text-warning-600 bg-warning-50',
    terminated: 'text-error-600 bg-error-50',
    resigned: 'text-secondary-600 bg-secondary-50',
    present: 'text-success-600 bg-success-50',
    absent: 'text-error-600 bg-error-50',
    late: 'text-warning-600 bg-warning-50',
    'on_leave': 'text-primary-600 bg-primary-50',
  };
  
  return statusColors[status?.toLowerCase()] || 'text-secondary-600 bg-secondary-50';
}

/**
 * Get employment status badge color
 * @param {string} status - Employment status
 * @returns {string} Tailwind color class
 */
export function getEmploymentStatusColor(status) {
  const statusColors = {
    active: 'text-success-600 bg-success-50 border-success-200',
    inactive: 'text-secondary-600 bg-secondary-50 border-secondary-200',
    probation: 'text-warning-600 bg-warning-50 border-warning-200',
    terminated: 'text-error-600 bg-error-50 border-error-200',
    resigned: 'text-secondary-600 bg-secondary-50 border-secondary-200',
  };
  
  return statusColors[status?.toLowerCase()] || 'text-secondary-600 bg-secondary-50 border-secondary-200';
}
