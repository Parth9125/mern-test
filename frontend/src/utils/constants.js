// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const APP_NAME = process.env.REACT_APP_APP_NAME || 'Arvyax MERN Test';

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

// Agent Status
export const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// List Status
export const LIST_STATUS = {
  PENDING: 'pending',
  CONTACTED: 'contacted',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ALLOWED_EXTENSIONS: ['.csv', '.xlsx', '.xls'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50],
};

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+[1-9]\d{10,14}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300,
  TOAST_AUTO_CLOSE: 5000,
  LOADING_DELAY: 200,
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  AGENTS: '/agents',
  AGENTS_ADD: '/agents/add',
  LISTS: '/lists',
  LISTS_UPLOAD: '/lists/upload',
  PROFILE: '/profile',
};

// Navigation Items
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    title: 'Agents',
    path: ROUTES.AGENTS,
    icon: 'Users',
  },
  {
    title: 'Lists',
    path: ROUTES.LISTS,
    icon: 'FileText',
  },
];

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
};

// Status Colors
export const STATUS_COLORS = {
  [AGENT_STATUS.ACTIVE]: 'success',
  [AGENT_STATUS.INACTIVE]: 'danger',
  [LIST_STATUS.PENDING]: 'warning',
  [LIST_STATUS.CONTACTED]: 'info',
  [LIST_STATUS.COMPLETED]: 'success',
  [LIST_STATUS.FAILED]: 'danger',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size exceeds ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB limit.`,
  INVALID_FILE_TYPE: 'Invalid file type. Only CSV, XLSX, and XLS files are allowed.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  AGENT_CREATED: 'Agent created successfully',
  AGENT_UPDATED: 'Agent updated successfully',
  AGENT_DELETED: 'Agent deleted successfully',
  LIST_UPLOADED: 'File uploaded and distributed successfully',
  LIST_DELETED: 'List deleted successfully',
};