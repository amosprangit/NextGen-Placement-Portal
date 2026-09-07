import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ngcc_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Normalize backend errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;

    const normalized = new Error(
      payload?.message ||
        error.message ||
        "Something went wrong"
    );

    normalized.status = error.response?.status;
    normalized.errors = payload?.errors || null;

    return Promise.reject(normalized);
  }
);

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem("ngcc_token", token);
  } else {
    localStorage.removeItem("ngcc_token");
  }
};

export const getStoredToken = () => {
  return localStorage.getItem("ngcc_token");
};
