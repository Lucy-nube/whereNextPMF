import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = config.data instanceof FormData;

  if (isFormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default API;
