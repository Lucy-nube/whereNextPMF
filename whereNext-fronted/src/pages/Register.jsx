import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "../styles/Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 CARRUSEL ANIMADO
  useEffect(() => {
    const images = document.querySelectorAll(".auth-bg-image");
    let index = 0;

    const interval = setInterval(() => {
      images[index].classList.remove("active");
      index = (index + 1) % images.length;
      images[index].classList.add("active");
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/users/register/", { username, email, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      window.location.href = "/explore";
    } catch (err) {
      const serverMsg = err.response?.data?.error || "Fallo en los datos de aduana del pasaporte.";
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">

      {/* 🌅 CARRUSEL DE FONDOS */}
      <div
        className="auth-bg-image active"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      <div
        className="auth-bg-image"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      <div
        className="auth-bg-image"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      <div className="auth-overlay"></div>

      <div className="auth-container">
        <h1>Crear pasaporte</h1>

        <form onSubmit={handleRegisterSubmit}>
          {error && <p className="error">⚠️ {error}</p>}

          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarme e Ingresar"}
          </button>

          <div className="login-footer-redirect">
            ¿Ya tienes un pasaporte activo?{" "}
            <Link to="/login" className="login-redirect-link">
              Inicia sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
