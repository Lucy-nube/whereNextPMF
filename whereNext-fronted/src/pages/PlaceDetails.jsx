import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import placeService from "../services/placeService";
import tripService from "../services/tripService";
import { useAuth } from "../context/AuthContext";
import API from "../services/api"; // Para llamadas directas si tus servicios no cubren likes/comments
import Loading from "../components/common/Loading";
import "../styles/PlaceDetails.css"; 

export default function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // ESTADOS DEL APARTADO INTERACTIVO
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  useEffect(() => {
    async function fetchPlaceData() {
      try {
        const data = await placeService.getById(id);
        setPlace(data);
        
        // Inicializamos los contadores basados en tu JSON del backend
        setLikesCount(data.likes?.length || 0);
        setHasLiked(data.likes?.includes(currentUser?.id) || false);
        setComments(data.comments || []);
        setRating(data.average_rating || 0);
        setUserRating(data.user_rating || 0);
      } catch (error) {
        console.error("Error fetching place data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchPlaceData();
  }, [id, currentUser?.id]);

  // =========================================================
  // INTERACCIÓN: DAR/QUITAR ME GUSTA (LIKE SYSTEM)
  // =========================================================
  const handleToggleLike = async () => {
    try {
      await API.post(`places/${id}/like/`);
      setHasLiked(!hasLiked);
      setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Error al conmutar el me gusta:", error);
    }
  };

  // =========================================================
  // INTERACCIÓN: REGISTRAR CALIFICACIÓN (RATING SYSTEM)
  // =========================================================
  const handleRatePlace = async (stars) => {
    try {
      const res = await API.post(`places/${id}/rate/`, { rating: stars });
      setUserRating(stars);
      if (res.data?.average_rating) {
        setRating(res.data.average_rating);
      }
    } catch (error) {
      console.error("Error al enviar calificación:", error);
    }
  };

  // =========================================================
  // INTERACCIÓN: PUBLICAR COMENTARIO (COMMENTS ENGINE)
  // =========================================================
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await API.post(`places/${id}/comments/`, { text: newComment });
      
      // Inyectamos el comentario al vuelo en la lista para UX instantánea
      const freshlyCreatedComment = {
        id: res.data?.id || Date.now(),
        text: newComment,
        created_at: new Date().toISOString(),
        user: {
          id: currentUser?.id,
          username: currentUser?.username || "Tú",
          avatar: currentUser?.avatar || null
        }
      };

      setComments(prev => [freshlyCreatedComment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error al publicar comentario:", error);
    }
  };

  const handleAddToTrip = async () => {
    try {
      await tripService.addPlaceToTrip(place.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Error adding place:", error);
    }
  };

  if (loading) return <Loading />;

  if (!place) {
    return (
      <div className="place-details-page">
        <div className="place-info-card">
          <p className="no-comments-fallback">No se encontró este lugar en el catálogo de WhereNext.</p>
          <button type="button" className="comment-submit-btn" onClick={() => navigate("/explore")}>
            Volver a Explorar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="place-details-page">
      
      {/* PANORAMICA BANNER HERO */}
      <div className="place-header">
        <img 
          src={getMediaUrl(place.image || place.image_url, "/default-place.jpg")} 
          alt={place.name} 
          className="place-header-image" 
        />
        <div className="place-header-overlay">
          <h1>{place.name}</h1>
          <div className="place-location-wrapper">
            📍 <span className="place-country">{place.country || "Destino"}</span>
          </div>
        </div>
      </div>

      {/* METADATOS Y ACCIONES PRINCIPALES */}
      <div className="place-info-card">
        <p className="place-description-text">{place.description}</p>
        
        <div className="place-tags-deck">
          <span className="place-badge-category">Multitud: {place.crowd_level || "Baja"}</span>
          {place.category && (
            <span className="place-badge-category">Entorno: {place.category}</span>
          )}
          <span className="place-badge-category">⭐ Promedio: {Number(rating).toFixed(1)} / 5</span>
        </div>

        {/* REJILLA DE ENLACES INTERACTIVOS (LIKES & RATINGS) */}
        <div className="comment-form-container">
          <button 
            type="button" 
            className={`comment-submit-btn ${hasLiked ? "btn-friend" : ""}`}
            onClick={handleToggleLike}
          >
            {hasLiked ? "❤️ Te gusta" : "🤍 Dar Me Gusta"} ({likesCount})
          </button>

          <button 
            type="button" 
            className="comment-submit-btn" 
            onClick={handleAddToTrip}
          >
            {added ? "Añadido ✓" : "✈️ Añadir a mi viaje"}
          </button>
        </div>

        {/* SELECTOR DE ESTRELLAS DE CALIFICACIÓN */}
        <div className="comment-user-meta">
          <span className="comment-author-name">Tu calificación:</span>
          <div className="place-tags-deck">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="place-badge-category"
                onClick={() => handleRatePlace(star)}
              >
                {star <= userRating ? "★" : "☆"} {star}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BLOQUE DE CRÍTICAS Y COMENTARIOS */}
      <div className="comments-section">
        <h3>💬 Conversación y Consejos de Viajeros</h3>

        {/* FORMULARIO DE ENVÍO */}
        <form onSubmit={handlePostComment} className="comment-form-container">
          <textarea
            className="comment-input-field"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Comparte un consejo sobre este destino, transporte, mejor hora para ir..."
            required
          />
          <button type="submit" className="comment-submit-btn">
            Publicar
          </button>
        </form>

        {/* LISTADO DE TARJETAS DE COMENTARIOS */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments-fallback">Aún no hay consejos para este rincón. ¡Sé el primero en escribir!</p>
          ) : (
            comments.map((comment) => {
              const author = comment.user || {};
              const authorName = author.username || "Viajero";
              const avatar = author.avatar || author.profile?.avatar;

              return (
                <div key={comment.id} className="comment-card">
                  <div className="comment-avatar-wrapper">
                    <img 
                      src={getMediaUrl(avatar, "/default-avatar.png")} 
                      alt="avatar" 
                    />
                  </div>
                  <div className="comment-content-block">
                    <div className="comment-user-meta">
                      <span className="comment-author-name">@{authorName}</span>
                      <span className="comment-date-subtext">
                        {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : "Reciente"}
                      </span>
                    </div>
                    <p className="comment-body-text">{comment.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
