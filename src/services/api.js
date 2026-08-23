import axios from 'axios';
import { STORAGE_KEYS } from '../constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let unauthorizedHandler = null;

/** Registered by AuthContext so a 401 can end the session globally. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.friendlyMessage =
        'Unable to connect to the server. Please check your connection and try again.';
    } else if (error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        unauthorizedHandler?.();
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.friendlyMessage) return error.friendlyMessage;
  if (error?.response?.data?.message) return error.response.data.message;
  return fallback;
}

export function getValidationErrors(error) {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors)) {
    const map = {};
    for (const item of errors) {
      if (item?.field) map[item.field] = item.message;
    }
    return map;
  }
  return null;
}

export default api;
