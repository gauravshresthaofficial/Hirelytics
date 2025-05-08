import axios from "axios";

const baseURL = import.meta.env.VITE_API;

const api = axios.create({
  baseURL,
});

// Request Interceptor: Add Authorization Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Errors Globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem("token");
      localStorage.removeItem("user-info");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;

export const googleAuth = (code) => api.get(`/auth/google?code=${code}`);
