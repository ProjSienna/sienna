/**
 * API service for communicating with the backend server
 * Uses different base URLs for development and production environments
 * Maintains localStorage for core data while integrating with backend APIs
 */
import { API_URL, FEATURES } from '../config';

// Use the API URL from the config
const API_BASE_URL = API_URL;

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function fetchApi(endpoint, options = {}) {
  // Skip API calls if the feature is disabled
  const featureName = options.featureName;
  if (featureName && !FEATURES[featureName]) {
    console.log(`API call skipped: Feature ${featureName} is disabled`);
    return Promise.reject(new Error(`Feature ${featureName} is disabled`));
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle HTTP 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    // Parse the JSON response if it has content
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(
        typeof data === 'object' && data.message 
          ? data.message 
          : 'Something went wrong'
      );
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * External API services - Integration with backend APIs
 * These don't modify localStorage data, just integrate with backend services
 */
export const externalApi = {
  // Get wallet balance
  getWalletBalance: (walletAddress) => 
    fetchApi(`/wallet/${walletAddress}/balance`, {
      featureName: 'BALANCE_CHECKS'
    }),
  
  // Generate PDF receipt for a payroll
  generatePayrollReceipt: (payrollId) => 
    fetchApi(`/payroll/${payrollId}/receipt`, {
      featureName: 'RECEIPT_GENERATION'
    }),
    
  // Submit transaction data to the backend for processing/monitoring
  submitTransaction: (transactionData) =>
    fetchApi('/transactions/submit', {
      method: 'POST',
      body: JSON.stringify(transactionData),
      featureName: 'TRANSACTION_SUBMISSION'
    }),
};

/**
 * API methods for payees
 */
export const payeesApi = {
  getAll: () => fetchApi('/payees'),
  getById: (id) => fetchApi(`/payees/${id}`),
  create: (payee) => fetchApi('/payees', {
    method: 'POST',
    body: JSON.stringify(payee),
  }),
  update: (id, payee) => fetchApi(`/payees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payee),
  }),
  delete: (id) => fetchApi(`/payees/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * API methods for transactions
 */
export const transactionsApi = {
  getAll: () => fetchApi('/transactions'),
  getById: (id) => fetchApi(`/transactions/${id}`),
  create: (transaction) => fetchApi('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  }),
  getBySenderWallet: (walletAddress) => 
    fetchApi(`/transactions/sender/${walletAddress}`),
  getByRecipientWallet: (walletAddress) => 
    fetchApi(`/transactions/recipient/${walletAddress}`),
  getRequestedByWallet: (walletAddress) => 
    fetchApi(`/transactions/requested/${walletAddress}`),
  getByPayrollId: (payrollId) => 
    fetchApi(`/transactions/payroll/${payrollId}`),
};

/**
 * API methods for payrolls
 */
export const payrollsApi = {
  getAll: () => fetchApi('/payrolls'),
  getById: (id) => fetchApi(`/payrolls/${id}`),
  create: (payroll) => fetchApi('/payrolls', {
    method: 'POST',
    body: JSON.stringify(payroll),
  }),
  update: (id, payroll) => fetchApi(`/payrolls/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payroll),
  }),
  delete: (id) => fetchApi(`/payrolls/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Authentication API methods
 * For user authentication with the backend
 */
export const authApi = {
  login: (credentials) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
  getCurrentUser: () => fetchApi('/auth/me'),
};

export default {
  externalApi,
  authApi,
  fetchApi,
  payeesApi,
  transactionsApi,
  payrollsApi,
}; 