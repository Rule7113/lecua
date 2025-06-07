// frontend/src/api/client.js

import axios from 'axios';

// Define the base URL for the API
const baseURL = 'http://localhost:8000/api';

// Create an axios instance with default configuration
const client = axios.create({
  baseURL, // Base URL for all requests
  headers: {
    'Content-Type': 'application/json', // Default content type
    'Accept': 'application/json', // Default accept type
  },
  withCredentials: true, // Send cookies with requests
});

// Add a request interceptor to the axios instance
client.interceptors.request.use(
  (config) => {
    // Get the access token from local storage
    const token = localStorage.getItem('access_token');
    if (token) {
      // If token exists, set Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Return config to proceed with the request
  },
  (error) => {
    // Handle request error
    console.error('Request error:', error);
    return Promise.reject(error); // Reject promise with error
  }
);

// Add a response interceptor to the axios instance
client.interceptors.response.use(
  (response) => response, // Return the response if successful
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and request hasn't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request as retried

      try {
        // Get the refresh token from local storage
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available'); // Throw error if no refresh token
        }

        // Attempt to refresh the token
        const response = await axios.post(`${baseURL}/token/refresh/`, {
          refresh: refreshToken,
        });

        // Extract the new access token from the response
        const { access } = response.data;
        
        // Update tokens in localStorage
        localStorage.setItem('access_token', access);

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Update the client's default headers
        client.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Retry the original request
        return client(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear local storage and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshError); // Reject promise with refresh error
      }
    }

    // Handle other errors
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status, // Log status code
        data: error.response.data, // Log response data
        url: error.config.url, // Log the request URL
      });
    }

    return Promise.reject(error); // Reject promise with error
  }
);

// Define API endpoints for easier reference
export const endpoints = {
  auth: {
    login: 'token/',
    register: 'register/',
    refresh: 'token/refresh/',
    user: 'user/',
    users: 'user/list/',
    resetPassword: 'user/reset-password/',
    changePassword: 'user/change-password/',
  },
  analysis: {
    analyze: 'analyze-text/',
    history: 'analyses/',
    documents: 'documents/',
    upload: 'documents/upload/',
  },
  reports: {
    create: 'reports/',
    list: 'reports/',
    update: 'reports/',
  },
  notifications: {
    create: 'notifications/',
    list: 'notifications/',
    update: 'notifications/',
  },
  admin: {
    dashboard: 'admin/dashboard/',
    users: 'admin/users/',
    reports: 'admin/reports/',
    analytics: 'admin/analytics/',
    database: 'admin/database/',
    passwords: 'admin/passwords/',
    settings: 'admin/settings/',
  }
};

// Export the client instance for use in other files
export default client;