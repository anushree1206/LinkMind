/**
 * API utility functions for communicating with the backend
 * Handles authentication, requests, and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Helper function to get refresh token from localStorage
const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

// Helper function to save tokens to localStorage
const saveTokens = (accessToken, refreshToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Helper function to clear tokens from localStorage
const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Base fetch function with authentication and error handling
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  // Check if token is expired and try to refresh
  if (token && isTokenExpired(token)) {
    const refreshed = await refreshAuthToken();
    if (!refreshed) {
      // Redirect to login if refresh fails
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Authentication expired');
    }
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle different response statuses
    if (response.status === 401) {
      // Token expired or invalid, try to refresh
      const refreshed = await refreshAuthToken();
      if (!refreshed) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed');
      }
      
      // Retry the request with new token
      const newToken = getAuthToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!retryResponse.ok) {
        throw new Error(`HTTP error! status: ${retryResponse.status}`);
      }
      
      return await retryResponse.json();
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);  // Add this line
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Refresh authentication token
const refreshAuthToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    if (data.success && data.data.accessToken) {
      saveTokens(data.data.accessToken, refreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Authentication API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.tokens) {
      saveTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    }
    
    return response;
  },
  
  // Login user
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.tokens) {
      saveTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    }
    
    return response;
  },
  
  // Get current user profile
  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  // Change password
  changePassword: async (passwordData) => {
    return await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
  
  // Logout user
  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearTokens();
    }
  },
  
  // Delete account
  deleteAccount: async (password) => {
    const response = await apiRequest('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
    
    if (response.success) {
      clearTokens();
    }
    
    return response;
  },
};

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard overview data
  getOverview: async () => {
    return await apiRequest('/dashboard/overview');
  },
  
  // Get dashboard notifications
  getNotifications: async () => {
    return await apiRequest('/dashboard/notifications');
  },
  
  // Get at-risk contacts
  getAtRiskContacts: async () => {
    return await apiRequest('/dashboard/at-risk-contacts');
  },
  
  // Get relationship distribution
  getRelationshipDistribution: async () => {
    return await apiRequest('/dashboard/relationship-distribution');
  },
  
  // Get recent contacts
  getRecentContacts: async () => {
    return await apiRequest('/dashboard/recent-contacts');
  },
  
  // Get AI insights
  getAIInsights: async () => {
    return await apiRequest('/dashboard/ai-insights');
  },

  // Get complete dashboard summary
  getSummary: async () => {
    return await apiRequest('/dashboard/summary');
  },
};

// Contacts API functions
export const contactsAPI = {
  // Get all contacts with optional filters
  getContacts: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/contacts?${queryString}` : '/contacts';
    
    return await apiRequest(endpoint);
  },
  
  // Get a single contact by ID
  getContact: async (id) => {
    return await apiRequest(`/contacts/${id}`);
  },
  
  // Create a new contact
  createContact: async (contactData) => {
    return await apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },
  
  // Update an existing contact
  updateContact: async (id, contactData) => {
    return await apiRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  },
  
  // Delete a contact
  deleteContact: async (id) => {
    return await apiRequest(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Add a note to a contact
  addNote: async (id, noteData) => {
    return await apiRequest(`/contacts/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },
  
  // Add an interaction to a contact
  addInteraction: async (id, interactionData) => {
    return await apiRequest(`/contacts/${id}/interactions`, {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  },
  
  // Update relationship strength
  updateRelationshipStrength: async (id, strength) => {
    return await apiRequest(`/contacts/${id}/relationship-strength`, {
      method: 'PUT',
      body: JSON.stringify({ relationshipStrength: strength }),
    });
  },
  
  // Get contact statistics
  getStats: async () => {
    return await apiRequest('/contacts/stats');
  },
  
  // Search contacts with advanced filters
  searchContacts: async (searchParams = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/contacts/search?${queryString}` : '/contacts/search';
    
    return await apiRequest(endpoint);
  },
  
  // Bulk update contacts
  bulkUpdate: async (contactIds, updates) => {
    return await apiRequest('/contacts/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ contactIds, updates }),
    });
  },
};

// Analytics API functions
export const analyticsAPI = {
  // Get relationship growth trends
  getGrowthTrends: async (period = 30, startDate = null, endDate = null) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/growth-trends?${queryString}` : `/analytics/growth-trends?period=${period}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get detailed analytics for a date range
  getAnalyticsDetails: async (startDate, endDate, granularity = 'daily') => {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);
    queryParams.append('granularity', granularity);
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/details?${queryString}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get network health insights
  getNetworkHealthInsights: async (period = 30) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/network-health?${queryString}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get analytics summary for dashboard
  getAnalyticsSummary: async () => {
    return await apiRequest('/analytics/summary');
  },
  
  // Get interaction trends by type
  getInteractionTrends: async (period = 30, type = null) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    
    if (type && type !== 'all') queryParams.append('type', type);
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/interaction-trends?${queryString}`;
    
    return await apiRequest(endpoint);
  },
  
  // Generate analytics for a specific date
  generateAnalytics: async (date = null) => {
    return await apiRequest('/analytics/generate', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },
  
  // Get engagement quality breakdown
  getEngagementQualityBreakdown: async (period = 30, startDate = null, endDate = null) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/engagement-quality?${queryString}` : `/analytics/engagement-quality?period=${period}`;
    
    return await apiRequest(endpoint);
  },

  // Get communication medium effectiveness
  getCommunicationMediumEffectiveness: async (period = 30, viewMode = 'overall', contactId) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    queryParams.append('viewMode', viewMode);
    
    if (contactId) queryParams.append('contactId', contactId);
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/communication-medium-effectiveness?${queryString}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get AI-powered opportunity suggestions
  getOpportunitySuggestions: async (limit = 5) => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/opportunity-suggestions?${queryString}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get communication channel insights
  getCommunicationChannelInsights: async (period = 30, startDate = null, endDate = null) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/communication-channels?${queryString}` : `/analytics/communication-channels?period=${period}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get follow-up effectiveness tracker
  getFollowUpEffectiveness: async (period = 30) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/follow-up-effectiveness?${queryString}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get relationship health timeline
  getRelationshipHealthTimeline: async (period = 90, limit = 5) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/relationship-health-timeline?${queryString}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get detailed risk contacts analysis
  getRiskContactsAnalysis: async (limit = 10) => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/risk-contacts?${queryString}`;
    
    return await apiRequest(endpoint);
  },
  
  // Get networking score
  getNetworkingScore: async () => {
    return await apiRequest('/analytics/networking-score');
  },
  
  // Get reply indicators
  getReplyIndicators: async (period = 7) => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/reply-indicators?${queryString}`;
    
    return await apiRequest(endpoint);
  },
};

// Interaction API functions
export const interactionAPI = {
  // Add interaction to a contact
  addInteraction: async (contactId, interactionData) => {
    return await apiRequest(`/contacts/${contactId}/interactions`, {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  },

  // Get interactions for a contact
  getContactInteractions: async (contactId) => {
    return await apiRequest(`/contacts/${contactId}/interactions`);
  },

  // Get recent contacts (with recent interactions)
  getRecentContacts: async (limit = 10) => {
    return await apiRequest(`/contacts/recent?limit=${limit}`);
  },

  // Get dashboard summary
  getDashboardSummary: async () => {
    return await apiRequest('/dashboard/summary');
  },
};

// Integration API functions
export const integrationAPI = {
  // Sync LinkedIn contacts
  syncLinkedIn: async () => {
    return await apiRequest('/integrations/linkedin/sync', {
      method: 'POST',
    });
  },

  // Get AI suggestion for interaction
  getAISuggestion: async (contactId, interactionType) => {
    return await apiRequest('/integrations/ai/suggest', {
      method: 'POST',
      body: JSON.stringify({ contactId, interactionType }),
    });
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAuthToken();
    return token && !isTokenExpired(token);
  },
  
  // Get current user ID from token
  getCurrentUserId: () => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      return null;
    }
  },
  
  // Get current user email from token
  getCurrentUserEmail: () => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email;
    } catch (error) {
      return null;
    }
  },
  
  // Clear all stored data
  clearAll: () => {
    clearTokens();
  },
};

export default {
  auth: authAPI,
  contacts: contactsAPI,

  analytics: analyticsAPI,

  dashboard: dashboardAPI,
  interactions: interactionAPI,
  integrations: integrationAPI,

  utils: apiUtils,
};
