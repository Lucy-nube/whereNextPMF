import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/navbar.css";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🚀 NUEVO ESTADO: Guarda el total de chats no leídos calculados en tiempo real
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* =========================================================
     🔒 CARGA ASÍNCRONA INTEGRADA (NOTIFICACIONES + CONTADOR DE CHATS 🚀)
     ========================================================= */
  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;
    let intervalId = null;

    const fetchAppUpdatesData = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          if (intervalId) clearInterval(intervalId);
          return;
        }

        // Lanzamos las peticiones en paralelo al feed de alertas y a la central de chats
        const [notifRes, chatsRes] = await Promise.all([
          API.get("social/notifications/").catch(() => ({ data: [] })),
          API.get("chats/").catch(() => ({ data: [] }))
        ]);

        if (mounted) {
          // 1. Sincronizamos las notificaciones estándar de la campanita
          setNotifications(notifRes.data || []);

          // 2. 🚀 CÁLCULO DINÁMICO: Filtramos cuántos chats de la barra lateral vienen marcados con unread: true
          const unreadRooms = (chatsRes.data || []).filter(room => room.unread === true);
          setUnreadChatsCount(unreadRooms.length);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn("🧭 Sesión expirada. Sincronización en pausa.");
          if (intervalId) clearInterval(intervalId);
        } else {
          console.error("Error sincronizando métricas del Navbar:", err);
        }
      }
    };

    fetchAppUpdatesData();
    intervalId = setInterval(fetchAppUpdatesData, 15000); // Sincroniza cada 15 segundos en segundo plano

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [user?.id]);

  /* =========================================================
     CONTROLERS DE COMPORTAMIENTO NATIVO
     ========================================================= */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("body-scroll-lock");
    } else {
      document.body.classList.remove("body-scroll-lock");
    }
    return () => document.body.classList.remove("body-scroll-lock");
  }, [sidebarOpen]);

  const handleInteractAlert = async (alertId, tripId) => {
    try {
      await API.patch(`social/notifications/${alertId}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== alertId));
      if (tripId) navigate(`/trips/${tripId}`);
      setNotifOpen(false);
      setSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  const avatarUrl = getMediaUrl(user?.avatar);

  const closePanels = () => {
    setSidebarOpen(false);
    setNotifOpen(false);
  };

  return (
    <>
      {/* CÁPSULA MINIMALISTA SUPERIOR */}
      <nav className="navbar-capsule">
        <div className="capsule-logo" onClick={() => { navigate("/explore"); closePanels(); }}>
          ✈️ WhereNext
        </div>

        <div className="capsule-right">
          <div className="notif-wrapper">
            <button
              type="button"
              className="notif-bell"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setSidebarOpen(false);
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">
                <h4>Notificaciones recientes</h4>
                {notifications.length === 0 ? (
                  <p className="no-notifs">No hay alertas nuevas</p>
                ) : (
                  notifications.map((notif) => {
                    const currentType = String(notif.notification_type || "").toUpperCase();
                    return (
                      <div key={notif.id} className="notif-item" onClick={() => handleInteractAlert(notif.id, notif.trip_id)}>
                        <span>
                          {currentType === "FRIEND_REQUEST" && (
                            <>🤝 <strong>@{notif.from_user}</strong> te envió una solicitud de compañero</>
                          )}
                          {currentType === "FRIEND_ACCEPTED" && (
                            <>🎉 <strong>@{notif.from_user}</strong> aceptó tu solicitud</>
                          )}
                          {currentType === "FRIEND_REJECTED" && (
                            <>💔 <strong>@{notif.from_user}</strong> rechazó tu solicitud</>
                          )}
                          {currentType === "LIKE" && (
                            <>❤️ <strong>@{notif.from_user}</strong> le dio me gusta a tu viaje</>
                          )}
                          {currentType === "COMMENT" && (
                            <>💬 <strong>@{notif.from_user}</strong> comentó: "{notif.text_preview || 'Nueva respuesta'}"</>
                          )}
                          {!["FRIEND_REQUEST", "FRIEND_ACCEPTED", "FRIEND_REJECTED", "LIKE", "COMMENT"].includes(currentType) && (
                            <>🔔 Nueva alerta de @{notif.from_user}</>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* DISPARADOR DEL SIDEBAR */}
      <div
        className={`ambient-scroll-trigger ${sidebarOpen ? "trigger--active-close" : "trigger--ambient-scroll"}`}
        onClick={() => { setSidebarOpen(!sidebarOpen); setNotifOpen(false); }}
      >
        <span className="trigger-line line-top"></span>
        <span className="trigger-line line-mid"></span>
        <span className="trigger-line line-bottom"></span>
      </div>

      {/* SIDEBAR INMERSIVO */}
      <aside className={`navigation-sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--closed"}`}>
        <div className="sidebar-header-zone">
          <img 
            src={avatarUrl} 
            alt="passport" 
            className="sidebar-passport-pic sidebar-avatar-interactive" 
            onClick={() => { navigate("/profile"); closePanels(); }}
          />
          <h3>@{user?.username || "Explorer"}</h3>
          <span>TRVL-#{user?.id || "000"}</span>
        </div>

        <div className="sidebar-links-stack">
          <NavLink to="/" end onClick={closePanels}>🗺️ Inicio</NavLink>
          <NavLink to="/trips" onClick={closePanels}>✈️ Tus Viajes</NavLink>
          <NavLink to="/explore" onClick={closePanels}>🌍 Explorar</NavLink>
          
          {/* 🚀 RESPUESTA ESTRATÉGICA: Pestaña de chats modificada con contenedor de badge relativo */}
          <NavLink to="/chats" onClick={closePanels} className="sidebar-link-with-badge-wrapper">
            💬 Chats
            {unreadChatsCount > 0 && (
              <span className="sidebar-chats-notif-counter-badge">{unreadChatsCount}</span>
            )}
          </NavLink>

          <NavLink to="/profile" onClick={closePanels}>👤 Perfil</NavLink>
        </div>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-logout-btn" onClick={() => { logout(); closePanels(); }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}

export default Navbar;
