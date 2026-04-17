import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';
const API_KEY = 'cardiowise-dev-key-2024';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'Request failed';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export const apiService = {
  // Health check
  health: () => apiClient.get('/api/health'),

  // Prediction
  predict: (data) => apiClient.post('/api/predict', data),

  // Get prediction history
  getHistory: () => apiClient.get('/api/history'),

  // Get statistics
  getStats: () => apiClient.get('/api/stats'),
};

export default apiService;
