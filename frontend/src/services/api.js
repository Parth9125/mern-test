import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (!response) {
      // Network error
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = response;

    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        if (data?.message?.includes('expired') || data?.message?.includes('invalid')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        } else {
          toast.error(data?.message || 'Unauthorized');
        }
        break;

      case 403:
        toast.error(data?.message || 'Access forbidden');
        break;

      case 404:
        toast.error(data?.message || 'Resource not found');
        break;

      case 429:
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        toast.error(data?.message || 'Internal server error');
        break;

      default:
        if (status >= 400) {
          toast.error(data?.message || `Error ${status}: Something went wrong`);
        }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.post('/auth/verify'),
  getProfile: () => api.get('/auth/profile'),
};

export const agentsAPI = {
  getAll: (params) => api.get('/agents', { params }),
  getById: (id) => api.get(`/agents/${id}`),
  create: (agentData) => api.post('/agents', agentData),
  update: (id, agentData) => api.put(`/agents/${id}`, agentData),
  delete: (id) => api.delete(`/agents/${id}`),
  getStats: () => api.get('/agents/stats'),
};

export const listsAPI = {
  getAll: (params) => api.get('/lists', { params }),
  getById: (id) => api.get(`/lists/${id}`),
  upload: (formData) => api.post('/lists/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/lists/${id}`),
  getStats: () => api.get('/lists/stats'),
  getAgentItems: (listId, agentId) => api.get(`/lists/${listId}/agents/${agentId}`),
};

// Utility functions
export const handleApiError = (error, customMessage) => {
  const message = error.response?.data?.message || customMessage || 'Something went wrong';
  toast.error(message);
  return message;
};

export const handleApiSuccess = (message) => {
  toast.success(message);
};

export default api;