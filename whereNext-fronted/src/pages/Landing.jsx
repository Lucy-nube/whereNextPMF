import { Link, Navigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Landing() {
  const token = localStorage.getItem("token");

  // Si el usuario está logueado → redirigir a /home
  if (token) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="auth-background">

      {/* Carrusel igual que Login */}
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

      <div className="auth-container landing-center">
        <h1 className="landing-title">Explora. Comparte. Viaja.</h1>
        <p className="landing-subtitle">
          Tu pasaporte digital para descubrir aventuras y conectar con viajeros.
        </p>

        <div className="landing-buttons">
          <Link to="/explore" className="landing-btn primary">Explorar</Link>
          <Link to="/login" className="landing-btn secondary">Iniciar sesión</Link>
          <Link to="/register" className="landing-btn secondary">Crear pasaporte</Link>
        </div>
      </div>
    </div>
  );
}
