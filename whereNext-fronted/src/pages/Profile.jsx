import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/Profile.css";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [companions, setcompanions] = useState({ sent: [], received: [], friends: [] });
  const [isMe, setIsMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfilePrivate, setIsProfilePrivate] = useState(false);

  const [stamps, setStamps] = useState([]);
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);
  const [friendsProfiles, setFriendsProfiles] = useState([]);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  useEffect(() => {
    setLoading(true);

    const userEndpoint = id ? `users/${id}/` : "users/me/";
    const tripsEndpoint = "trips/";
    const companionsEndpoint = "companions/hub/";

    Promise.all([
      API.get("users/me/").catch(() => ({ data: {} })),
      API.get(userEndpoint).catch(() => ({ data: null })),
      API.get(companionsEndpoint).catch(() => ({ data: { sent: [], received: [], friends: [] } })),
      API.get(tripsEndpoint).catch(() => ({ data: [] }))
    ])
      .then(([meRes, userRes, companionsRes, tripsRes]) => {
        const me = meRes.data;
        const profileUser = userRes.data;

        if (!profileUser) {
          setUser(null);
          return;
        }

        setUser(profileUser);

        setcompanions({
          sent: companionsRes.data.sent || [],
          received: companionsRes.data.received || [],
          friends: companionsRes.data.friends || []
        });

        const filteredTrips = (tripsRes.data || []).filter(
          (t) => t.owner?.id === profileUser.id
        );

        setTrips(filteredTrips);

        setIsMe(me.id === profileUser.id);
        setIsProfilePrivate(profileUser.is_private || false);
      })
      .catch((err) => {
        console.error("Error connecting passport profiles channels:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const loadStamps = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await API.get("stamps/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStamps(res.data);
      } catch (err) {
        console.error("Error cargando stamps:", err);
      }
    };

    loadStamps();
  }, []);

  const handleAddCompanion = async () => {
    try {
      await API.post(`companions/invite/${user.id}/`);
      const res = await API.get("companions/hub/");

      setcompanions({
        sent: res.data.sent || [],
        received: res.data.received || [],
        friends: res.data.friends || []
      });

      showToast("Solicitud enviada 🤝");
    } catch (err) {
      showToast("Error enviando solicitud ❌");
      console.error(err);
    }
  };

  const handleAccept = async () => {
    try {
      const req = companions.received.find(c => c.user?.id === user.id);
      if (!req) return;

      await API.post(`companions/accept/${req.id}/`);

      const res = await API.get("companions/hub/");

      setcompanions({
        sent: res.data.sent || [],
        received: res.data.received || [],
        friends: res.data.friends || []
      });

      showToast("Solicitud aceptada ✔️");
    } catch (err) {
      showToast("Error al aceptar ❌");
      console.error(err);
    }
  };

  const handleCancelRequest = async () => {
    try {
      const req = companions.sent.find(c => c.companion?.id === user.id);
      if (!req) return;

      await API.post(`companions/cancel/${req.id}/`);

      const res = await API.get("companions/hub/");

      setcompanions({
        sent: res.data.sent || [],
        received: res.data.received || [],
        friends: res.data.friends || []
      });

      showToast("Solicitud cancelada ❌");
    } catch (err) {
      showToast("Error al cancelar ❌");
      console.error(err);
    }
  };

  const getcompanionstatus = () => {
    const sent = companions.sent?.find(c => c.companion?.id === user.id);
    if (sent) return "PENDING_SENT";

    const received = companions.received?.find(c => c.user?.id === user.id);
    if (received) return "PENDING_RECEIVED";

    const friend = companions.friends?.find(
      c => c.user?.id === user.id || c.companion?.id === user.id
    );

    if (friend) return "ACCEPTED";

    return null;
  };

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  const handleOpenCompanionsModal = async () => {
    if (companions.friends.length === 0) return;

    if (isMe) {
      try {
        const res = await API.get("companions/");
        setFriendsProfiles(res.data || []);
      } catch (err) {
        console.error("Error cargando perfiles de amigos:", err);
      }
    } else {
      const rawFriends = companions.friends.map(c => {
        const friendObj = c.user?.id === user.id ? c.companion : c.user;

        return {
          id: friendObj?.id,
          username: friendObj?.username || "Viajero",
          avatar: friendObj?.avatar || friendObj?.profile?.avatar || null
        };
      });

      setFriendsProfiles(rawFriends);
    }

    setShowCompanionsModal(true);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner" />
        <p>Cargando pasaporte digital...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="passport-profile passport-error-view">
        <h2>🔒 Perfil no disponible</h2>
        <button type="button" className="btn-primary" onClick={() => navigate("/")}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="passport-profile">

      {toastMessage && (
        <div className="td-toast-notification">
          {toastMessage}
        </div>
      )}

      {/* ================= PASSPORT CARD BASE ================= */}
      <div className="passport-card">
        <div className="passport-topbar">
          <span>🪪 PASAPORTE DIGITAL</span>
          <span className="passport-status">ACTIVE</span>
        </div>

        <div className="passport-main">
          <div className="profile-avatar">
            <img src={getMediaUrl(user.avatar)} alt="avatar" />
          </div>

          <div className="passport-info">
            <h1>@{user.username}</h1>
            <p className="passport-bio">{user.bio || "Explorer without limits"}</p>

            {isMe && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate("/profile/edit")}
              >
                ✏️ Editar perfil
              </button>
            )}

            {/* ================= ACTIONS DECK (🚀 COMPLEMENTED & CLOSED) ================= */}
            <div className="passport-actions-deck">
              {!isMe && (
                <>
                  {(() => {
                    const status = getcompanionstatus();

                    if (status === "PENDING_SENT") {
                      return (
                        <button
                          type="button"
                          className="btn-pending"
                          onClick={handleCancelRequest}
                        >
                          ❌ Cancelar solicitud
                        </button>
                      );
                    }

                    if (status === "PENDING_RECEIVED") {
                      return (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={handleAccept}
                        >
                          ✔️ Aceptar solicitud
                        </button>
                      );
                    }

                    if (status === "ACCEPTED") {
                      return (
                        <button type="button" className="btn-friend" disabled>
                          🤝 Ya son compañeros
                        </button>
                      );
                    }

                    return (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleAddCompanion}
                      >
                        🤝 Agregar compañero
                      </button>
                    );
                  })()}

                  {/* Instant Direct Chat Message Trigger */}
                  <button
                    type="button"
                    className="btn-secondary btn-chat-action-trigger"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("access");

                        const res = await API.post(
                          `/chats/start/${user.id}/`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        const roomId = res.data.room_id;
                        navigate(`/chats/${roomId}`);

                      } catch (err) {
                        if (err.response?.status === 403) {
                          showToast("Debes ser compañero para enviar mensajes 🤝");
                          return;
                        }
                        console.error("Error launching chat thread context:", err);
                      }
                    }}
                  >
                    💬 Mensaje
                  </button>

                </>
              )}
            </div>
            {isMe && (
              <label className="toggle-privacy">
                <input
                  type="checkbox"
                  checked={isProfilePrivate}
                  onChange={async (e) => {
                    const value = e.target.checked;
                    setIsProfilePrivate(value);
                    await API.put("users/me/", { is_private: value });
                  }}
                />
                <span>
                  {isProfilePrivate ? "🔒 Perfil privado activado" : "🌍 Hacer perfil privado"}
                </span>
              </label>
            )}

            <div className="passport-meta">
              <div>
                <span>STATUS</span>
                <strong>{isMe ? "OWNER" : "TRAVELER"}</strong>
              </div>
              <div>
                <span>ID</span>
                <strong>#{user.id}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="passport-chip">TRVL-{user.id}</div>
      </div>

      {/* ================= STATS CHIPS DECK ================= */}
      <div className="passport-stats">
        <div className="passport-widget widget-interactive" onClick={() => navigate("/trips")}>
          <h2>{trips.length}</h2>
          <p>✈️ Trips</p>
        </div>

        <div className="passport-widget widget-interactive" onClick={() => navigate("/companions-hub")}>
          <h2>{companions.friends?.length || 0}</h2>
          <p>🤝 Companions</p>
        </div>

        <div className="passport-widget">
          <h2>{stamps.length}</h2>
          <p>📍 Places</p>
        </div>
      </div>

      {/* ================= RECENT TRIPS TRACKS (🚀 PORTADAS RESTAURADAS) ================= */}
      <div className="passport-card">
        <div className="passport-header">
          <h3>✈️ Recent Trips</h3>
          {isMe && (
            <button type="button" className="btn-secondary" onClick={() => navigate("/trips/create")}>
              + Add trip
            </button>
          )}
        </div>

        <div className="profile-grid">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="trip-mini-card"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                {/* 🚀 foto de perfil*/}
                <img
                  src={getMediaUrl(trip.cover_photo || trip.photos?.[0]?.image)}
                  alt={trip.title}
                  className="trip-mini-thumb"
                />

                <h4 className="profile-trip-title">{trip.title}</h4>
                <p className="profile-trip-meta">{trip.destination || "No destination yet"}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No trips yet 🧳</p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
         🚀 COMPANIONS MODAL DIRECTORY LINK (GLASSMORPHISM OVERLAY)
         ========================================================= */}
      {showCompanionsModal && (
        <div className="td-modal-overlay" onClick={() => setShowCompanionsModal(false)}>
          <div className="td-modal-card companions-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="companions-modal-header">
              <h3>👥 Compañeros de {user.username}</h3>
              <button type="button" className="companions-modal-close" onClick={() => setShowCompanionsModal(false)}>✕</button>
            </div>

            <div className="companions-modal-body">
              {friendsProfiles.length === 0 ? (
                <p className="td-empty-gallery-msg">Aún no hay compañeros confirmados en esta bitácora.</p>
              ) : (
                <div className="companions-modal-list">
                  {friendsProfiles.map((friend) => (
                    <div
                      key={friend.id}
                      className="companions-modal-item"
                      onClick={() => {
                        setShowCompanionsModal(false);
                        navigate(`/users/${friend.id}`);
                      }}
                    >
                      <img
                        src={getMediaUrl(friend.avatar)}
                        alt="avatar"
                        className="companion-item-avatar"
                      />
                      <span className="companion-item-name">@{friend.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

