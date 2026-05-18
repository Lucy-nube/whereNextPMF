import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import * as authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar token desde localStorage al iniciar
  useEffect(() => {
    const access = localStorage.getItem("access");

    if (access) {
      setToken(access);
    }

    setLoading(false);
  }, []);

  // Cuando el token cambia → cargar usuario
  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);

    // Esto dispara el useEffect de arriba
    setToken(data.access);

    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const fetchMe = async () => {
    try {
      const res = await API.get("me/");
      setUser(res.data);
    } catch (err) {
      console.log("Error loading user:", err.response?.data);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
