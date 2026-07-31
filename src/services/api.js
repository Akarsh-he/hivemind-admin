import axios from 'axios';

// Dynamic API Base URL configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60s timeout for Render free tier cold-start spin-ups
});

// Cold-start detection subscriber system
let activePendingRequests = 0;
let coldStartTimer = null;
const listeners = new Set();

const notifyListeners = (isPending) => {
  listeners.forEach((cb) => cb(isPending));
};

export const onColdStartChange = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

// Intercept requests to attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    activePendingRequests++;
    if (activePendingRequests === 1 && !coldStartTimer) {
      coldStartTimer = setTimeout(() => {
        if (activePendingRequests > 0) {
          notifyListeners(true);
        }
      }, 1500);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const handleRequestComplete = () => {
  activePendingRequests = Math.max(0, activePendingRequests - 1);
  if (activePendingRequests === 0) {
    if (coldStartTimer) {
      clearTimeout(coldStartTimer);
      coldStartTimer = null;
    }
    notifyListeners(false);
  }
};

api.interceptors.response.use(
  (response) => {
    handleRequestComplete();
    return response;
  },
  (error) => {
    handleRequestComplete();
    return Promise.reject(error);
  }
);

export default api;
export { api };
