import axios from "axios";

const API = axios.create({
  baseURL: "https://wherenextpmf.onrender.com/api/",
});

// Attach token en cada request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Refresh automático
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          const res = await axios.post(
            "https://wherenextpmf.onrender.com/api/token/refresh/",
            { refresh }
          );

          localStorage.setItem("access", res.data.access);

          // Reintenta la petición original con el nuevo token
          err.config.headers.Authorization = `Bearer ${res.data.access}`;
          return API(err.config);
        } catch (refreshError) {
          // Si el refresh también falla, ahora sí borra tokens
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
      }
    }

    return Promise.reject(err);
  }
);

export default API;
