import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
            'Content-Type': 'application/json',
      },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
      (config) => {
            const token = tokenStorage.getToken();
            if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
      },
      (error) => {
            return Promise.reject(error);
      }
);

// Response interceptor for error handling
api.interceptors.response.use(
      (response) => response,
      (error) => {
            // Handle 401 Unauthorized - token expired or invalid
            if (error.response?.status === 401) {
                  tokenStorage.removeToken();
                  // Optionally redirect to login
                  if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                  }
            }

            // Return a more user-friendly error message
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            return Promise.reject(new Error(errorMessage));
      }
);

export default api;
