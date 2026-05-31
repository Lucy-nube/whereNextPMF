import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext"; 
import "../styles/trips.css"

export default function Trips() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Destructure the logged-in traveler node metrics
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CARGA DEL CATÁLOGO PERSONAL (CON FILTRADO DE SEGURIDAD PROTEGIDO)
  // =========================================================

  useEffect(() => {
    const fetchUserTrips = async () => {
      if (!user?.id) return;
      try {
        const res = await API.get("trips/"); 
        
        // Frontend security boundary verification pass
        const completelyMyTrips = (res.data || []).filter(
        (trip) => trip.owner?.id === user.id
        ); 

        
        setTrips(completelyMyTrips);
      } catch (err) {
        console.error("Error al sincronizar tu bitácora de viajes privada:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrips();
  }, [user?.id]);


  if (loading) {
    return (
      <div className="td-loading-state">
        <p>⏳ Abriendo pasaporte y cargando tus itinerarios digitales protegidos...</p>
      </div>
    );
  }

  return (
    <div className="trip-details-view">
      
      {/* CABECERA GENERAL DEL PASAPORTE */}
      <div className="td-header">
        <div className="header-info">
          <h1>✈️ Tus Bitácoras Privadas</h1>
          <p className="td-description">
            Gestiona tus aventuras personales de forma totalmente aislada y protegida contra filtraciones de la comunidad.
          </p>
        </div>
        
        <div className="td-actions-container">
          <button 
            type="button"
             className="td-primary-btn"
            onClick={() => navigate("/trips/create")}
          >
            ➕ Nueva Aventura
          </button>
        </div>
      </div>

      {/* REJILLA EN CAPAS DIGITALES */}
      <div className="profile-grid">
        {trips.length === 0 ? (
          <div className="td-meta-card text-center-variant">
            <p className="td-empty-gallery-msg">No tienes viajes registrados en tu pasaporte digital todavía.</p>
            <button 
              type="button"
              className="td-back-btn spacing-top-btn" 
              onClick={() => navigate("/trips/create")}
            >
              Comienza tu primer itinerario
            </button>
          </div>
        ) : (
          trips.map((trip) => (
            <div 
              key={trip.id} 
              className="td-meta-card widget-interactive" 
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              
              <div className="profile-place">
                <div className="td-dates-row">
                  <span className="td-date-val">
                    {trip.start_date || "Fecha libre"} — {trip.end_date || "Abierto"}
                  </span>
                  
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

                <div className="td-visibility-row spacing-top-utility">
                  {trip.mood && <span className="td-mood-highlight">🏙️ Mood: {trip.mood}</span>}
                  {trip.trip_type && (
                    <span className="td-mood-highlight">
                      {trip.trip_type === "solo" && "🌙 Solo"}
                      {trip.trip_type === "couple" && "💞 En pareja"}
                      {trip.trip_type === "group" && "👥 En grupo"}
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
