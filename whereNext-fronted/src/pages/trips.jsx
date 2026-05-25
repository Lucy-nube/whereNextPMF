import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/trips.css"

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CARGA DEL CATÁLOGO PERSONAL DE BITÁCORAS DE VIAJE
  // =========================================================
  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        // Golpea tu endpoint filtrado de Django que te devuelve tus tramos ordenados
        const res = await API.get("/trips/");
        setTrips(res.data || []);
      } catch (err) {
        console.error("Error al sincronizar tu bitácora de viajes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrips();
  }, []);

  const getMediaUrl = (path, fallback = "https://unsplash.com") => {
    if (!path) return fallback;
    return path.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
  };

  if (loading) {
    return (
      <div className="td-loading-state">
        <p>⏳ Abriendo pasaporte y cargando tus itinerarios digitales...</p>
      </div>
    );
  }

  return (
    <div className="trip-details-view">
      
      {/* CABECERA GENERAL DEL PASAPORTE */}
      <div className="td-header">
        <div className="header-info">
          <h1>✈️ Tus Bitácoras de Viaje</h1>
          <p className="td-description">
            Gestiona tus aventuras planeadas, edita tus sugerencias de lugares o publica tramos para tu feed de amigos.
          </p>
        </div>
        
        {/* BOTÓN REGISTRADOR COMPACTO */}
        <div className="td-actions-container">
          <button 
            type="button"
            className="td-upload-trigger-btn" 
            onClick={() => navigate("/trips/create")}
          >
            ➕ Nueva Aventura
          </button>
        </div>
      </div>

      {/* REJILLA / CUADRÍCULA DE VIAJES */}
      <div className="profile-grid">
        {trips.length === 0 ? (
          <div className="td-meta-card text-center-variant">
            <p className="td-empty-gallery-msg">No tienes viajes registrados en tu pasaporte digital de momento.</p>
            <button 
              type="button"
              className="td-back-btn spacing-top-btn" 
              onClick={() => navigate("/trips/create")}
            >
              Comienza tu primer itinerario
            </button>
          </div>
        ) : (
          trips.map((trip) => {
            // Evaluamos la primera foto del viaje para usarla de portada de la tarjeta
            const coverPhoto = trip.photos && trip.photos.length > 0 ? trip.photos[0].image : null;

            return (
              <div 
                key={trip.id} 
                className="td-meta-card widget-interactive" 
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                
                {/* CONTENIDO TEXTUAL DE LA BITÁCORA */}
                <div className="profile-place">
                  <div className="td-dates-row">
                    <span className="td-date-val">
                      {trip.start_date || "Fecha libre"} — {trip.end_date || "Abierto"}
                    </span>
                    
                    {/* INDICADOR DE PRIVACIDAD / PUBLICACIÓN */}
                    <span className="td-mood-highlight font-small-variant">
                      {trip.is_published ? "🌍 Publicado" : (trip.is_public ? "👥 Público" : "🔒 Privado")}
                    </span>
                  </div>

                  <h3 className="profile-trip-title">{trip.title}</h3>
                  <strong className="td-destination-highlight">
                    {trip.destination ? `📍 ${trip.destination}` : "🚫 Destino sin fijar"}
                  </strong>
                  
                  <p className="td-description line-clamp-variant">
                    {trip.description || "Sin descripción detallada en este tramo."}
                  </p>

                  {/* MINI BARRA DE ESTADÍSTICAS INTEGRADA DE LA TARJETA */}
                  <div className="td-visibility-row spacing-top-utility">
                    {trip.mood && (
                      <span className="td-mood-highlight">🏙️ Mood: {trip.mood}</span>
                    )}
                    {trip.trip_type && (
                      <span className="td-mood-highlight">
                        {trip.trip_type === "solo" && "🌙 Sola"}
                        {trip.trip_type === "couple" && "💞 En pareja"}
                        {trip.trip_type === "group" && "👥 En grupo"}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
