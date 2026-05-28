import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import * as authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("access"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOGIN
  // ============================================================
  const login = async (username, password) => {
    const data = await authService.login(username, password);

    // Guardar tokens
    setToken(data.access);
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

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
        // Mantener token en localStorage
        localStorage.setItem("access", token);

        // RUTA CORRECTA (sin slash inicial)
        const res = await API.get("users/me/");

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
