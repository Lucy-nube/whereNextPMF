import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../services/api";
import "../styles/Auth.css";
import { useAuth } from "../context/AuthContext";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      console.log(err.response?.data);
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="auth-background">

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
        <h1>Iniciar sesión</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Entrar</button>

          {error && <p className="error">{error}</p>}

          <div className="login-footer-redirect">
            ¿Eres un nuevo explorador?{" "}
            <Link to="/register" className="login-redirect-link">
              Crea tu pasaporte aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
