function Navbar({ setToken }) {

  return (
    <div>

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo-section">
          <span className="logo-icon">✈️</span>

          <h1 className="logo-text">
            WhereNext
          </h1>
        </div>

        <div className="nav-links">

          <a href="#">Inicio</a>

          <a href="#">
            Mis viajes
          </a>

          <a href="#">
            Explorar
          </a>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null);
            }}
          >
            Logout
          </button>

        </div>

      </nav>

    </div>
  );
}

export default Navbar;