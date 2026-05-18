import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";

function Navbar({ onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>

      <div className="navbar-left">
        ✈️ <span>WhereNext</span>
      </div>

      <div className={`navbar-center ${menuOpen ? "open" : ""}`}>

        <Link to="/">Inicio</Link>

        <Link to="/profile">Perfil</Link>

        <Link to="/viajes">Viajes</Link>

        <Link to="/explorar">Explorar</Link>

      </div>

      <div className="navbar-right">

        <button className="logout-btn" onClick={onLogout}>
          Salir
        </button>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </div>

    </nav>
  );
}

export default Navbar;