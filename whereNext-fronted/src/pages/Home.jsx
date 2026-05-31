import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  // FEED ESTADOS
  const [feedTrips, setFeedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // BUSCADOR ESTADOS
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // INTERACCIONES ESTADOS
  const [activeTripComments, setActiveTripComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // MODAL DE REACCIONES (LIKES DIRECTORY)
  const [likesModal, setLikesModal] = useState({ open: false, users: [] });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // =========================================================
  // CARGA DEL FEED CRONOLÓGICO DE BITÁCORAS
  // =========================================================
  const loadFeed = async () => {
    try {
      const res = await API.get("trips/feed/");
      setFeedTrips(res.data || []);
    } catch (err) {
      console.error("Error cargando el feed de bitácoras:", err);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) loadFeed();
  }, []);

  // =========================================================
  // BUSCADOR EN TIEMPO REAL CON DEBOUNCE (ANTI-SPAM)
  // =========================================================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await API.get(
          `/users/search/?search=${searchQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSearchResults(res.data || []);
        setShowDropdown(res.data && res.data.length > 0);

      } catch (err) {
        console.error("Error ejecutando búsqueda en backend:", err);
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);


  // =========================================================
  // MATRIZ SOCIAL: ENVÍO DE RESEÑAS / COMENTARIOS
  // =========================================================
  const handleCommentSubmit = async (e, tripId) => {
    e.preventDefault();
    const text = commentInputs[tripId] || "";
    if (!text.trim()) return;

    try {
      // Sincronizado con mi acción de ViewSet: POST /api/trips/<id>/comment/
      const res = await API.post(`trips/${tripId}/comment/`, { text });

      setFeedTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId
            ? {
              ...trip,
              comments_list: [...(trip.comments_list || []), res.data],
            }
            : trip
        )
      );

      setCommentInputs((prev) => ({ ...prev, [tripId]: "" }));
    } catch (err) {
      console.error("Error al enviar comentario al servidor:", err);
    }
  };

  // =========================================================
  // MATRIZ SOCIAL: CONMUTADOR DE LIKES (POST INTERRUPTOR)
  // =========================================================
  const handleLike = async (tripId) => {
    try {
      // Sincronizado con mi acción de ViewSet: POST /api/trips/<id>/like/
      const res = await API.post(`trips/${tripId}/like/`);

      setFeedTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId
            ? {
              ...trip,
              liked_by_me: res.data.liked,
              likes_count: res.data.total_likes,
            }
            : trip
        )
      );
    } catch (err) {
      console.error("Error al conmutar reacción de like:", err);
    }
  };

  // =========================================================
  // MATRIZ SOCIAL: DESPLEGAR DIRECTORIO DE REACCIONES
  // =========================================================
  const openLikesModal = async (tripId) => {
    try {
      // Sincronizado con mi acción de ViewSet: GET /api/trips/<id>/likes/
      const res = await API.get(`trips/${tripId}/likes/`);
      setLikesModal({ open: true, users: res.data || [] });
    } catch (err) {
      console.error("Error cargando directorio de reacciones:", err);
    }
  };

  // =========================================================
  // FORMATTEADOR MULTIMEDIA EXTRA-SEGURO CONTRA DUPLICADOS
  // =========================================================
  const getMediaUrl = (path, fallback = "https://flaticon.com") => {
    if (!path) return fallback;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `http://127.0.0.1:8000${cleanPath}`;
  };


  if (isInitialLoading) {
    return (
      <div className="home">
        <div className="home-feed">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card feed-trip-card skeleton-card">
              <div className="skeleton-header"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-image"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="loading">
        <p>⏳ Sincronizando brújula y feed de aventuras...</p>
      </div>
    );
  }

  return (
    <div className="home">

      {/* CABECERA + CAJA DE BÚSQUEDA */}
      <div className="home-header">
        <h1>🌿 Muro de Aventuras</h1>
        <p>Encuentra a tus amigos y descubre sus próximas bitácoras de viaje</p>

        <div className="social-search-box">
          <input
            className="social-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim() && searchResults.length > 0) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 250);
            }}
            autoComplete="off"
            placeholder="🔍 Buscar amigos por nombre de usuario..."
          />



          {/* DESPLEGABLE TRANSLÚCIDO DE LA BÚSQUEDA */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((userItem) => (
                <div
                  key={userItem.id}
                  className="search-user-item user-item-interactive"
                  onClick={() => navigate(`/users/${userItem.id}`)}
                >
                  <img
                    src={getMediaUrl(userItem.avatar)}
                    className="search-avatar"
                    alt="Avatar"
                  />
                  <span>@{userItem.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DEL FEED DE TARJETAS */}
      <div className="home-feed-section">
        <h2>Últimas Bitácoras</h2>

        <div className="home-feed">
          {feedTrips.length === 0 ? (
            <p className="empty-feed-text">
              No hay bitácoras públicas de momento. ¡Inmortaliza tu primer viaje!
            </p>
          ) : (
            feedTrips.map((trip) => (
              <div
                key={trip.id}
                className="card feed-trip-card feed-card-animate"
              >

                {/* CABECERA DE LA TARJETA */}
                <div className="feed-card-header">
                  <img
                    src={getMediaUrl(trip.owner?.avatar)}
                    className="feed-avatar feed-avatar-clickable"
                    alt="Avatar"
                    onClick={() => navigate(`/users/${trip.owner.id}`)}
                  />
                  <div>
                    <strong>@{trip.owner?.username || "Viajero"}</strong>
                  </div>
                </div>

                {/* CUERPO TEXTUAL */}
                <h3 className="feed-trip-title">{trip.title}</h3>
                <p className="feed-trip-description">{trip.description}</p>

                {/* CHIPS DE INFORMACIÓN */}
                <div className="feed-tags">
                  {trip.destination && (
                    <span className="feed-destination-highlight">📍 {trip.destination}</span>
                  )}
                  {trip.mood && (
                    <span className="feed-mood-highlight">🌿 {trip.mood}</span>
                  )}
                </div>

                {/* MOSAICO MULTIMEDIA DE RECUERDOS */}
                {Array.isArray(trip.photos) && trip.photos.length > 0 && (
                  trip.photos.length === 1 ? (
                    <div className="feed-photo-single">
                      <img
                        src={getMediaUrl(trip.photos[0].image)}
                        className="feed-gallery-image"
                        alt={`Recuerdo de ${trip.title}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : (
                    <div className="feed-photo-carousel">
                      {trip.photos.map((p) => (
                        <img
                          key={p.id}
                          src={getMediaUrl(p.image)}
                          className="feed-carousel-image"
                          alt={`Recuerdo de ${trip.title}`}
                          loading="lazy"
                          decoding="async"
                        />
                      ))}
                    </div>
                  )
                )}
                {/* DECK DE CONTROL SOCIAL (BOTONES) */}
                <div className="feed-social">
                  <div className="feed-social-buttons">
                    <button
                      type="button"
                      onClick={() => handleLike(trip.id)}
                      className={trip.liked_by_me ? "feed-social-btn active" : "feed-social-btn"}
                    >
                      {trip.liked_by_me ? "❤️ Te gusta" : "🤍 Me gusta"}
                    </button>

                    <button
                      type="button"
                      className="feed-social-btn feed-likes-counter-btn"
                      onClick={() => openLikesModal(trip.id)}
                    >
                      👥 Likes ({trip.likes_count || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTripComments((prev) => ({
                          ...prev,
                          [trip.id]: !prev[trip.id],
                        }))
                      }
                      className="feed-social-btn"
                    >
                      💬 Comentarios ({trip.comments_list?.length || 0})
                    </button>
                  </div>

                  {/* CAJÓN DESPLEGABLE DE RESEÑAS */}
                  {activeTripComments[trip.id] && (
                    <div className="feed-comments-box">
                      <div className="feed-comments-list">
                        {!trip.comments_list || trip.comments_list.length === 0 ? (
                          <p className="feed-no-comments">Nadie ha comentado todavía. ¡Escribe un consejo!</p>
                        ) : (
                          trip.comments_list.map((c) => (
                            <div key={c.id} className="feed-comment">
                              <span className="feed-comment-user">@{c.user?.username || c.username}:</span>
                              <span className="checkbox-text">{c.text}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* INPUT DE PUBLICACIÓN DE COMENTARIOS */}
                      <form onSubmit={(e) => handleCommentSubmit(e, trip.id)} className="feed-comment-form">
                        <input
                          className="feed-comment-input"
                          value={commentInputs[trip.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [trip.id]: e.target.value }))
                          }
                          placeholder="Escribe una opinión sobre esta bitácora..."
                          required
                        />
                        <button type="submit" className="feed-comment-submit-btn">
                          Enviar
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* =========================================================================
         🚀 MODAL PREMIUM DE LIKES (VISUALIZACIÓN DE COMPAÑEROS DE REACCIÓN)
         ========================================================================= */}
      {likesModal.open && (
        <div className="td-modal-overlay">
          <div className="td-modal-card">
            <h3>❤️ Exploradores que reaccionaron</h3>

            <div className="home-likes-users-list">
              {likesModal.users.length === 0 ? (
                <p className="feed-no-comments">No hay reacciones registradas en este tramo.</p>
              ) : (
                likesModal.users.map((u) => (
                  <div
                    key={u.id}
                    className="likes-user-row-item"
                    onClick={() => {
                      setLikesModal({ open: false, users: [] }); // Cierra el modal antes de mover la ruta
                      navigate(`/users/${u.id}`);               // Brinca directo al pasaporte de ese usuario
                    }}
                  >
                    <img src={getMediaUrl(u.avatar)} alt="Avatar" className="likes-modal-row-avatar" />
                    <strong>@{u.username}</strong>
                    <span className="likes-modal-profile-link-indicator">Ver pasaporte →</span>
                  </div>
                ))
              )}
            </div>

            <div className="td-modal-actions">
              <button
                type="button"
                className="td-modal-btn-cancel"
                onClick={() => setLikesModal({ open: false, users: [] })}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
