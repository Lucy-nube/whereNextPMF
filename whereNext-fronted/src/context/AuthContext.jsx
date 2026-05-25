import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import * as authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("access", token);
      fetchMe();
    } else {
      localStorage.removeItem("access");
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);

    localStorage.setItem("access", data.access);
    setToken(data.access);

    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("user");
  };

  const fetchMe = async () => {
    try {
      const res = await API.get("me/");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
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