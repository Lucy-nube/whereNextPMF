import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import * as authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // 1. Inicializar token correctamente
  const [token, setToken] = useState(() => localStorage.getItem("access"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Sincronizar token al montar
  useEffect(() => {
    const stored = localStorage.getItem("access");
    if (stored && !token) {
      setToken(stored);
    }
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================
  const login = async (username, password) => {
    const data = await authService.login(username, password);

    // Guardar token ANTES de navegar
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    setToken(data.access); // Esto dispara loadUser()

    return data;
  };

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  // ============================================================
  // CARGAR USUARIO AUTENTICADO
  // ============================================================
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/users/me/");
        setUser(res.data);
      } catch (err) {
        console.log("Token inválido, cerrando sesión");
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
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
