import { useEffect, useState } from "react";
// 🚀 UPGRADE: Swapped Link for NavLink to unlock active tracking parameters natively
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/navbar.css";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) {
        setScrolled(window.scrollY > 10);
      } else {
        setScrolled(false); 
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); 

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);
  

   // NOTIFICATIONS FETCH
useEffect(() => {
  if (!user?.id) return;

  let isMounted = true;
  let interval;

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access");

      // 🚀 si no hay token no hacemos request
      if (!token) return;

      const res = await API.get("/notifications/");

      if (isMounted) {
        setNotifications(res.data || []);
      }

    } catch (err) {

      // 🚀 si expira token limpiamos
      if (err.response?.status === 401) {
        console.warn("Sesión expirada");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setNotifications([]);
        return;
      }

      console.error("Error cargando notificaciones:", err);
    }
  };

  fetchNotifications();

  interval = setInterval(fetchNotifications, 15000);

  return () => {
    isMounted = false;

    if (interval) {
      clearInterval(interval);
    }
  };
}, [user?.id]);
  
  const handleAcceptCompanion = async (id, alertId) => {
    try {
      await API.post(`/companions/accept/${id}/`);
      try { await API.patch(`/notifications/${alertId}//`); } catch { await API.patch(`/social/notifications/${alertId}/`); }
      setNotifications(prev => prev.filter((n) => n.id !== alertId));
    } catch (err) { console.error(err); }
  };

  const handleRejectCompanion = async (id, alertId) => {
    try {
      await API.post(`/companions/reject/${id}/`);
      try { await API.patch(`/notifications/${alertId}//`); } catch { await API.patch(`/social/notifications/${alertId}/`); }
      setNotifications(prev => prev.filter((n) => n.id !== alertId));
    } catch (err) { console.error(err); }
  };

  const handleInteractAlert = async (alertId, tripId) => {
    try {
      try { await API.patch(`/notifications/${alertId}//`); } catch { await API.patch(`/social/notifications/${alertId}/`); }
      setNotifications(prev => prev.filter((n) => n.id !== alertId));
      if (tripId) {
        navigate(`/trips/${tripId}`);
        setNotifOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>

      <div className="navbar-left" onClick={() => navigate("/explore")}>
        ✈️ WhereNext
      </div>

      {/* 🚀 MODERNIZED LINK ROW: Using NavLink elements handles active states character-for-character */}
      <div className={`navbar-center ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" end onClick={closeMenu}>Inicio</NavLink>
        <NavLink to="/profile" onClick={closeMenu}>Perfil</NavLink>
        <NavLink to="/trips" onClick={closeMenu}>Viajes</NavLink>
        <NavLink to="/explore" onClick={closeMenu}>Explorar</NavLink>
        <NavLink to="/chats" onClick={closeMenu}>Chats 💬</NavLink>
        
        <button className="logout-btn logout-mobile" onClick={() => { logout(); closeMenu(); }}>
          Salir
        </button>
      </div>

      <div className="navbar-right">

        <div className="notif-wrapper">
          <button type="button" className="notif-bell" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {notifications.length > 0 && (
              <span className="notif-badge">{notifications.length}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <h4>Notificaciones recientes</h4>
              {notifications.length === 0 ? (
                <p className="no-notifs">No hay notificaciones</p>
              ) : (
                notifications.map((notif) => {
                  const currentType = String(notif.type || "").toUpperCase();
                  return (
                    <div key={notif.id} className="notif-item">
                      {currentType === "LIKE" && (
                        <div className="notif-clickable-body" onClick={() => handleInteractAlert(notif.id, notif.trip_id)}>
                          <span>❤️ <strong>@{notif.from_user}</strong> le dio me gusta a tu viaje <em>"{notif.trip_title}"</em></span>
                        </div>
                      )}
                      {currentType === "COMMENT" && (
                        <div className="notif-clickable-body" onClick={() => handleInteractAlert(notif.id, notif.trip_id)}>
                          <span>💬 <strong>@{notif.from_user}</strong> comentó: "{notif.text_preview}..." en <em>"{notif.trip_title}"</em></span>
                        </div>
                      )}
                      {currentType === "COMPANION" && (
                        <div className="notif-companion-row">
                          <span>👥 <strong>@{notif.from_user}</strong> quiere conectar</span>
                          <div className="notif-actions">
                            <button className="notif-btn-accept" onClick={() => handleAcceptCompanion(notif.row_instance_id || notif.id, notif.id)}>✓</button>
                            <button className="notif-btn-reject" onClick={() => handleRejectCompanion(notif.row_instance_id || notif.id, notif.id)}>✕</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <button onClick={logout} className="logout-btn logout-desktop">
          Salir
        </button>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

      </div>
    </nav>
  );
}

export default Navbar;
