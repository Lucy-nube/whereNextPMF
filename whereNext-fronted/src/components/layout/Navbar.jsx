import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/navbar.css";
import { useAuth } from "../../context/AuthContext";
import { getMediaUrl } from "../../utils/media";
import API from "../../services/api";

function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [unreadInvitesCount, setUnreadInvitesCount] = useState(0);


  const { user, logout } = useAuth();
  const isLoggedIn = !!localStorage.getItem("access");
  const navigate = useNavigate();

  /* =========================================================
     🔒 CARGA ASÍNCRONA INTEGRADA
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

        const [notifRes, chatsRes, invitesRes] = await Promise.all([
          API.get("social/notifications/").catch(() => ({ data: [] })),
          API.get("chats/").catch(() => ({ data: [] })),
          API.get("invites/trip-invites/").catch(() => ({ data: [] }))
        ]);

        if (mounted) {
          setNotifications(notifRes.data || []);

          const unreadRooms = (chatsRes.data || []).filter(room => room.unread === true);
          setUnreadChatsCount(unreadRooms.length);

          const pendingInvites = (invitesRes.data || []).filter(inv => inv.status === "PENDING");
          setUnreadInvitesCount(pendingInvites.length);

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
    intervalId = setInterval(fetchAppUpdatesData, 15000);

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

  const handleOpenNotifications = async () => {
    // si está abierto y lo vas a cerrar → borrar notificaciones
    if (notifOpen) {
      try {
        await API.post("social/notifications/read_all/");
        setNotifications([]);   // vacía la lista
      } catch (err) {
        console.error("Error marcando todas como leídas:", err);
      }
    }

    // abrir/cerrar dropdown
    setNotifOpen(prev => !prev);
  };


  const handleFriendRequest = async (notif, action) => {
    try {
      // 1. Aceptar o rechazar la solicitud
      await API.post(`companions/${action}/${notif.object_id}/`);

      // 2. Marcar la notificación como leída (todas) en el backend
      await API.patch(`social/notifications/${notif.id}/mark_read/`);

      // 3. Eliminarla del estado local
      setNotifications(prev => prev.filter(n => n.id !== notif.id));

    } catch (err) {
      console.error("Error procesando solicitud de amistad:", err);
    }
  };

 const avatarUrl = getMediaUrl(
  user?.avatar,
  "/default-avatar.png"
 );

  const closePanels = () => {
    setSidebarOpen(false);
    setNotifOpen(false);
  };

  return (
    <>
      {/* CÁPSULA MINIMALISTA SUPERIOR */}
      <nav className="navbar-capsule">
        <div
          className="capsule-logo"
          onClick={() => {
            navigate("/explore");
            closePanels();
          }}
        >
          ✈️ WhereNext
        </div>

        <div className="capsule-right">
          <div className="notif-wrapper">
            <button
              type="button"
              className="notif-bell"
              onClick={handleOpenNotifications}
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
                    const currentType = String(
                      notif.notification_type || ""
                    ).toUpperCase();

                    if (
                      ![
                        "FRIEND_REQUEST",
                        "FRIEND_ACCEPTED",
                        "LIKE",
                        "COMMENT"
                      ].includes(currentType)
                    ) {
                      return null;
                    }
                    return (
                      <div key={notif.id} className="notif-item">
                        <span>
                          {currentType === "FRIEND_REQUEST" && (
                            <>
                              🤝 <strong>@{notif.from_user?.username}</strong> quiere ser tu compañero
                            </>
                          )}

                          {currentType === "FRIEND_ACCEPTED" && (
                            <>
                              🤝 <strong>@{notif.from_user?.username}</strong> aceptó tu solicitud
                            </>
                          )}


                          {currentType === "LIKE" && (
                            <>
                              ❤️ <strong>@{notif.from_user?.username}</strong> le dio me gusta a tu viaje
                            </>
                          )}

                          {currentType === "COMMENT" && (
                            <>
                              💬 <strong>@{notif.from_user?.username}</strong> comentó: "{notif.text_preview}"
                            </>
                          )}

                        </span>

                        {/* ACCIONES PARA FRIEND REQUEST */}
                        {currentType === "FRIEND_REQUEST" && (
                          <div className="notif-actions">
                            <button
                              className="notif-accept-btn"
                              onClick={() => handleFriendRequest(notif, "accept")}
                            >
                              Aceptar
                            </button>

                            <button
                              className="notif-reject-btn"
                              onClick={() => handleFriendRequest(notif, "reject")}
                            >
                              Rechazar
                            </button>
                          </div>
                        )}

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
        className={`ambient-scroll-trigger ${sidebarOpen ? "trigger--active-close" : "trigger--ambient-scroll"
          }`}
        onClick={() => {
          setSidebarOpen(!sidebarOpen);
          setNotifOpen(false);
        }}
      >
        <span className="trigger-line line-top"></span>
        <span className="trigger-line line-mid"></span>
        <span className="trigger-line line-bottom"></span>
      </div>

      {/* SIDEBAR INMERSIVO */}
      <aside
        className={`navigation-sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--closed"
          }`}
      >
        <div className="sidebar-header-zone">
          {isLoggedIn && (
            <img
              src={avatarUrl}
              alt="passport"
              className="sidebar-passport-pic sidebar-avatar-interactive"
              onClick={() => {
                navigate("/profile");
                closePanels();
              }}
            />
          )}
          <h3>@{user?.username || "Explorer"}</h3>
          <span>TRVL-#{user?.id || "000"}</span>
        </div>

        <div className="sidebar-links-stack">
          <NavLink to="/home" end onClick={closePanels}>
            🗺️ Inicio
          </NavLink>
          <NavLink to="/trips" onClick={closePanels}>
            ✈️ Tus Viajes
          </NavLink>
          <NavLink to="/explore" onClick={closePanels}>
            🌍 Explorar
          </NavLink>

          <NavLink
            to="/chats"
            onClick={closePanels}
            className="sidebar-link-with-badge-wrapper"
          >
            💬 Chats
            {unreadChatsCount > 0 && (
              <span className="sidebar-chats-notif-counter-badge">
                {unreadChatsCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/trip-invites"
            className="sidebar-link-with-badge-wrapper"
          >
            📨 Invitaciones
            {unreadInvitesCount > 0 && (
              <span className="sidebar-chats-notif-counter-badge">
                {unreadInvitesCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            📌 Favoritos
          </NavLink>


          <NavLink to="/profile" onClick={closePanels}>
            👤 Perfil
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={() => {
              logout();
              closePanels();
            }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Navbar;

