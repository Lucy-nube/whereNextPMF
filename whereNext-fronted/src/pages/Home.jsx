import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  // FEED
  const [feedTrips, setFeedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // BUSCADOR
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // COMENTARIOS
  const [activeTripComments, setActiveTripComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // ============================
  // CARGA DEL FEED
  // ============================
  const loadFeed = async () => {
    try {
      const res = await API.get("/trips/feed/");
      setFeedTrips(res.data);
    } catch (err) {
      console.error("Error cargando el feed de bitácoras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) loadFeed();
  }, []);

  // ============================
  // BUSCADOR
  // ============================
 useEffect(() => {

  if (!searchQuery.trim()) {
    setSearchResults([]);
    setShowDropdown(false);
    return;
  }

  const delay = setTimeout(async () => {

    try {
      const res = await API.get(`/search/?search=${searchQuery}`);

      setSearchResults(res.data);
      setShowDropdown(res.data.length > 0);

    } catch (err) {
      console.error("ERROR SEARCH:", err);
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, 300);

  return () => clearTimeout(delay);

}, [searchQuery]);

  // ============================
  // COMENTARIOS
  // ============================
  const handleCommentSubmit = async (e, tripId) => {
    e.preventDefault();
    const text = commentInputs[tripId] || "";
    if (!text.trim()) return;

    try {
      const res = await API.post(`/trips/${tripId}/comments/`, { text });
      setFeedTrips((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                comments_list: t.comments_list
                  ? [...t.comments_list, res.data]
                  : [res.data],
              }
            : t
        )
      );
      setCommentInputs((prev) => ({ ...prev, [tripId]: "" }));
    } catch (err) {
      console.error("Error al enviar comentario:", err);
    }
  };

  const handleLike = async (tripId) => {

  console.log("CLICK LIKE:", tripId);

  try {

    const res = await API.post(`/trips/${tripId}/like/`);

    console.log("RESPUESTA LIKE:", res.data);

    setFeedTrips((prev) =>
      prev.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              is_liked: res.data.liked,
              total_likes: res.data.total_likes,
            }
          : trip
      )
    );

  } catch (err) {

    console.error(
      "ERROR LIKE:",
      err.response?.data || err
    );

  }
};

  // ============================
  // LOADING
  // ============================
  if (loading) {
    return (
      <div className="loading">
        <p>⏳ Sincronizando brújula y feed de aventuras...</p>
      </div>
    );
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="home">
      {/* HEADER + BUSCADOR */}
      <div className="home-header">
        <h1>🌿 Muro de Aventuras</h1>
        <p>Encuentra a tus amigos y descubre sus próximas bitácoras de viaje</p>

        <div className="social-search-box">
           <input
  className="social-search-input"
  type="text"
  value={searchQuery}
  onChange={(e) => {
    const value = e.target.value;


    setSearchQuery(value);

    // abre dropdown automáticamente mientras escribe
    if (value.trim()) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }}
  onFocus={() => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    }
  }}
  onBlur={() => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 250);
  }}
  autoComplete="off"
  placeholder="🔍 Buscar amigos por nombre de usuario..."
/>

          {showDropdown && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="search-user-item"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <img
                    src={
                      user.avatar
                        ? user.avatar.startsWith("http")
                          ? user.avatar
                          : `http://127.0.0.1:8000${user.avatar}`
                        : "https://flaticon.com"
                    }
                    className="search-avatar"
                    alt="Avatar"
                  />
                  <span>@{user.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FEED */}
      <div className="home-feed-section">
        <h2>Últimas Bitácoras</h2>

        <div className="home-feed">
          {feedTrips.length === 0 ? (
            <p className="empty-feed-text">
              No hay bitácoras públicas de momento. ¡Inmortaliza tu primer viaje!
            </p>
          ) : (
            feedTrips.map((trip) => (
              <div key={trip.id} className="feed-card">
                <div className="feed-card-header">
                 <img
  src={
    trip.owner.avatar
      ? trip.owner.avatar.startsWith("http")
        ? trip.owner.avatar
        : `http://127.0.0.1:8000${trip.owner.avatar}`
      : "https://flaticon.com"
  }
  className="feed-avatar"
  alt="Avatar"
  onClick={() => navigate(`/users/${trip.owner.id}`)}
  style={{ cursor: "pointer" }}
/>
                  <div>
                    <strong>@{trip.owner.username}</strong>
                  </div>
                </div>

                <h3 className="feed-trip-title">{trip.title}</h3>
                <p className="feed-trip-description">{trip.description}</p>

                <div className="feed-tags">
                  {trip.destination && (
                    <span className="feed-destination-highlight">
                      📍 {trip.destination}
                    </span>
                  )}
                  {trip.mood && (
                    <span className="feed-mood-highlight">🌿 {trip.mood}</span>
                  )}
                </div>

                {trip.photos?.length > 0 && (
                  <div className="feed-photo-grid">
                    {trip.photos.map((p) => (
                      <img
                        key={p.id}
                        src={
                          p.image.startsWith("http")
                            ? p.image
                            : `http://127.0.0.1:8000${p.image}`
                        }
                        className="feed-gallery-image"
                        alt="Recuerdo"
                      />
                    ))}
                  </div>
                )}

                <div className="feed-social">
                  <div className="feed-social-buttons">
                    <button
                      onClick={() => handleLike(trip.id)}
                      className={
                        trip.is_liked
                          ? "feed-social-btn active"
                          : "feed-social-btn"
                      }
                    >
                      {trip.is_liked ? "❤️ Te gusta" : "🤍 Me gusta"}
                    </button>

                    <button
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

                  <span className="feed-likes-counter">
                    👥 {trip.total_likes || 0} reacciones
                  </span>
                </div>

                {activeTripComments[trip.id] && (
                  <div className="feed-comments-box">
                    <div className="feed-comments-list">
                      {trip.comments_list?.length > 0 ? (
                        trip.comments_list.map((c) => (
                          <div key={c.id} className="feed-comment">
                            <span className="feed-comment-user">
                              @{c.user.username}:
                            </span>{" "}
                            {c.text}
                          </div>
                        ))
                      ) : (
                        <p className="feed-no-comments">
                          No hay comentarios aún en esta bitácora.
                        </p>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => handleCommentSubmit(e, trip.id)}
                      className="feed-comment-form"
                    >
                      <input
                        className="feed-comment-input"
                        value={commentInputs[trip.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [trip.id]: e.target.value,
                          }))
                        }
                        placeholder="Escribe una respuesta en la bitácora..."
                      />
                      <button type="submit" className="feed-comment-submit-btn">
                        Enviar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
