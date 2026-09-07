import axios from "axios";

// Always use the same-origin /api path.
//
// Production:
// https://next-gen-placement-portal.vercel.app/api
//        ↓ Vercel rewrite
// http://15.135.189.44:5000/api
//
// This prevents the browser from making an insecure HTTP request.
const baseURL = "/api";

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
