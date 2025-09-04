/**
 * Calculate days since last contact
 * @param {Date} lastContactDate - The date of last contact
 * @returns {number} - Number of days since last contact
 */
export function calculateDaysSinceLastContact(lastContactDate) {
  if (!(lastContactDate instanceof Date) || isNaN(lastContactDate)) {
    return 90; // Default to 90 days if invalid date
  }
  
  const today = new Date();
  const diffTime = Math.abs(today - lastContactDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get suggested follow-up date based on last interaction
 * @param {Date} lastContactDate - The date of last contact
 * @param {number} interactionCount - Total number of interactions
 * @returns {Date} - Suggested follow-up date
 */
export function getSuggestedFollowUpDate(lastContactDate, interactionCount = 0) {
  const followUpDate = new Date(lastContactDate || new Date());
  
  // If never contacted or few interactions, suggest following up sooner
  if (!lastContactDate || interactionCount <= 1) {
    followUpDate.setDate(followUpDate.getDate() + 3); // 3 days for new connections
  } else {
    // For existing connections, base follow-up on relationship strength and last contact
    const daysSinceLastContact = calculateDaysSinceLastContact(lastContactDate);
    
    if (daysSinceLastContact > 60) {
      followUpDate.setDate(followUpDate.getDate() + 7); // 1 week for reconnecting
    } else if (daysSinceLastContact > 30) {
      followUpDate.setDate(followUpDate.getDate() + 14); // 2 weeks for monthly check-ins
    } else {
      followUpDate.setDate(followUpDate.getDate() + 3); // 3 days for recent contacts
    }
  }
  
  // Don't suggest weekends for business contacts
  if (followUpDate.getDay() === 0) { // Sunday
    followUpDate.setDate(followUpDate.getDate() + 1);
  } else if (followUpDate.getDay() === 6) { // Saturday
    followUpDate.setDate(followUpDate.getDate() + 2);
  }
  
  return followUpDate;
}

/**
 * Format date to a user-friendly string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} - True if the date is today
 */
export function isToday(date) {
  if (!(date instanceof Date) || isNaN(date)) return false;
  
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}
