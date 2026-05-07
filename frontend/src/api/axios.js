// ─────────────────────────────────────────────
// api/axios.js
// Central Axios instance used throughout the app.
// - Automatically attaches JWT token to every request
// - Handles 401 errors globally (auto logout)
// ─────────────────────────────────────────────

import axios from "axios";

const api = axios.create({
  baseURL: "https://expensetracker-2-sn3f.onrender.com/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ──────────────────────
// Runs before every request is sent.
// Reads the JWT from localStorage and adds it to the Authorization header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────
// Runs after every response is received.
// If the server returns 401 (Unauthorized), clear storage and reload.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
