import axios from "axios";

// Priority: explicit VITE_API_URL (e.g. a direct backend URL for local dev,
// like http://localhost:5000/api) — falls back to a same-origin relative
// "/api" path, which is correct when a reverse proxy (Nginx, Vercel
// rewrites, etc.) forwards /api/* to the backend in production.
const baseURL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({ baseURL });

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ngcc_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// The backend always replies with { success, message, data?, meta? } on
// success and { success:false, message, errors? } on failure. Normalize
// axios errors so every caller can just read `err.message` / `err.errors`.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const payload = err.response?.data;

    const normalized = new Error(
      payload?.message || err.message || "Something went wrong",
    );

    normalized.status = err.response?.status;
    normalized.errors = payload?.errors || null;

    return Promise.reject(normalized);
  },
);

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem("ngcc_token", token);
  } else {
    localStorage.removeItem("ngcc_token");
  }
};

export const getStoredToken = () => localStorage.getItem("ngcc_token");
