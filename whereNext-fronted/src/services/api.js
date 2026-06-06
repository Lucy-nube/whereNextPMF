import axios from "axios";

const API = axios.create({
  baseURL: "https://wherenextpmf.onrender.com/api/",
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Manejo de errores global
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access");
    }

    return Promise.reject(err);
  }
);

export default API;
