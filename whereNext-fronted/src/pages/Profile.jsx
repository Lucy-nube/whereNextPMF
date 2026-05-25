import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/Profile.css";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [trips, setTrips] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [isMe, setIsMe] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [isCompanion, setIsCompanion] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 🚀 ESTADO DE PRIVACIDAD SINCRONIZADO
  const [isProfilePrivate, setIsProfilePrivate] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    const userEndpoint = id ? `users/${id}/` : "me/";
    const tripsEndpoint = id ? `users/${id}/trips/` : "trips/";

    Promise.all([
      API.get("me/").catch(err => { console.error("Error loading 'me':", err); return { data: {} }; }),
      API.get(userEndpoint).catch(err => { console.error("Error loading profile user:", err); return { data: null }; }),
      API.get("places/").catch(err => { console.error("Error loading places:", err); return { data: [] }; }),
      API.get(tripsEndpoint).catch(err => { console.error("Error loading trips:", err); return { data: [] }; }),
      API.get("/companions/hub/").catch(err => { console.error("Error loading companions:", err); return { data: [] }; })
    ])
      .then(([meRes, userRes, placesRes, tripsRes, companionsRes]) => {
        if (!userRes || !userRes.data) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(userRes.data);
        setPlaces(placesRes.data || []);
        setCompanions(companionsRes.data || []);

        // 🚀 SINCRONIZACIÓN DE PRIVACIDAD CON EL BACKEND
        setIsProfilePrivate(userRes.data.is_private || false);

        if (tripsRes && Array.isArray(tripsRes.data)) {
          setTrips(tripsRes.data);
        } else if (tripsRes && Array.isArray(tripsRes.data?.results)) {
          setTrips(tripsRes.data.results);
        } else {
          setTrips([]);
        }

        if (meRes.data?.id && meRes.data.id === userRes.data.id) {
          setIsMe(true);
        }

        if (userRes.data.is_friend) {
          setIsCompanion(true);
        }
      })
      .catch((err) => console.error("Critical Profile Error:", err))
      .finally(() => setLoading(false));

  }, [id]);

  const handleInvite = async () => {
    if (!user?.id) return;
    try {
      await API.post(`/companions/invite/${user.id}/`);
      setInviteSent(true);
    } catch (err) {
      console.error("Error al enviar invitación:", err.response?.data || err);
    }
  };

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    return path.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
  };

  if (loading) return <p className="loading">Cargando pasaporte digital...</p>;

  if (!user) {
    return (
      <div className="passport-profile passport-error-view">
        <h2>🔒 Acceso Restringido o Perfil Inexistente</h2>
        <p>No tienes permisos para ver el pasaporte de este viajero.</p>
        <button className="logout-desktop spacing-top-btn" onClick={() => navigate("/")}>
          Volver al Inicio
        </button>
      </div>
    );
  }

  const myPlaces = places.filter(place => place.created_by === user.id);
  const myLikes = places.filter(place => place.likes?.includes(user.id));
  
  const myTrips = trips
    .filter(trip => trip.owner === user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalAcceptedCompanions = companions.length;

  return (
    <div className="passport-profile">

      {/* TARJETA PASAPORTE PRINCIPAL */}
      <div className="passport-card">
        <div className="passport-topbar">
          <span>🪪 PASAPORTE DIGITAL</span>
          <span className="passport-status">ACTIVO</span>
        </div>

        <div className="passport-main">
          <div className="profile-avatar">
            {user.avatar ? <img src={getMediaUrl(user.avatar)} alt="avatar" /> : "👤"}
          </div>

          <div className="passport-info">
            <h1>{user.username}</h1>

            {!isMe && (
              <button
                className="add-btn"
                onClick={handleInvite}
                disabled={inviteSent || isCompanion}
              >
                {isCompanion ? "Ya son compañeros ✓" : inviteSent ? "Solicitud enviada ✓" : "Agregar compañero"}
              </button>
            )}

            <p className="passport-email">{user.email}</p>
            <p className="passport-bio">{user.bio || "Explorer without limits"}</p>

            {/* =========================================================================
               🚀 INTERRUPTOR RECONFIGURADO: CHECKBOX DE PRIVACIDAD INVERTIDO REACTIVO
               ========================================================================= */}
            {isMe && (
              <div className="profile-privacy-toggle-zone">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isProfilePrivate}
                    onChange={async (e) => {
                      const valorFuturo = e.target.checked;
                      setIsProfilePrivate(valorFuturo);
                      
                      try {
                        await API.patch("/me/", { is_private: valorFuturo });
                      } catch (err) {
                        console.error("Error al guardar la privacidad:", err);
                        setIsProfilePrivate(!valorFuturo); // Fallback reversión instantánea
                      }
                    }}
                  />
                  <span className="checkbox-text">
                    {isProfilePrivate 
                      ? "🔒 Perfil Privado (Solo compañeros aceptados ven tus bitácoras)" 
                      : "🪪 Hacer mi perfil Privado"}
                  </span>
                </label>
              </div>
            )}

            <div className="passport-meta">
              <div>
                <span>ESTADO</span>
                <strong>{isMe ? "Propietario" : "Viajero"}</strong>
              </div>
              <div>
                <span>ID</span>
                <strong>#{user.id}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="passport-chip">
          <span>PASSPORT ID</span>
          <strong>TRVL-{user.id}</strong>
        </div>
      </div>

      {/* REJILLA DE ESTADÍSTICAS (WIDGETS INTERACTIVOS) */}
      <div className="passport-stats">
        <div className="passport-widget" onClick={() => navigate("/trips")}>
          <h2>{myTrips.length}</h2>
          <p>✈️ Viajes</p>
        </div>

        <div className="passport-widget">
          <h2>{myPlaces.length}</h2>
          <p>📍 Lugares</p>
        </div>

        <div className="passport-widget">
          <h2>{myLikes.length}</h2>
          <p>❤️ Likes</p>
        </div>

        {/* 🚀 WIDGET INTERACTIVO EXCLUSIVO DEL DUEÑO HACIA EL HUB */}
        <div 
          className={`passport-widget ${isMe ? "widget-interactive" : ""}`}
          onClick={() => isMe && navigate("/companions-hub")}
        >
          <h2>{totalAcceptedCompanions}</h2>
          <p>{isMe ? "🤝 Gestionar Círculo" : "🤝 Compañeros"}</p>
        </div>
      </div>

      {/* SELLOS DE VIAJE / INSIGNIAS */}
      <div className="passport-card">
        <h3>🛂 Insignias de viaje</h3>
        <div className="travel-stamps">
          {myPlaces.length > 0 ? (
            myPlaces.slice(0, 6).map(place => (
              <div key={place.id} className="travel-stamp">
                {place.country}
              </div>
            ))
          ) : (
            <p className="empty-stamps-text">Sin sellos de viaje de momento</p>
          )}
        </div>
      </div>

      {/* VIAJES RECIENTES */}
      <div className="passport-card">
        <div className="passport-header">
          <h3>✈️ Viajes Recientes</h3>
          {isMe && (
            <button className="profile-add-trip-btn" onClick={() => navigate("/trips/create")}>
              Añadir viaje
            </button>
          )}
        </div>

        <div className="profile-grid">
          {myTrips.length > 0 ? (
            myTrips.map(trip => (
              <div key={trip.id} className="profile-place" onClick={() => navigate(`/trips/${trip.id}`)}>
                <p className="profile-trip-title">{trip.title}</p>
                <small className="profile-trip-meta">{trip.destination || "Destino libre"}</small>
              </div>
            ))
          ) : (
            <p className="empty-stamps-text">No has registrado itinerarios recientes.</p>
          )}
        </div>
      </div>

    </div>
  );
}
