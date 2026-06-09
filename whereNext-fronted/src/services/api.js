import axios from "axios";

const API = axios.create({
  baseURL: "https://wherenextpmf.onrender.com/api/",
 });
 API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = config.data instanceof FormData;

  if (isFormData) {
    // MUY IMPORTANTE: no tocar headers
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default API;