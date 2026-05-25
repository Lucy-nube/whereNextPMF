import { useEffect, useState } from "react";
import API from "../../services/api";

export default function TripSuggestions({ tripId, onSelectDestination }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId || tripId === "undefined") {
      setLoading(false);
      return;
    }

    API.get(`/trips/${tripId}/suggestions/`)
      .then(res => {
        const placesList = res.data?.suggested_places || (Array.isArray(res.data) ? res.data : []);
        setSuggestions(placesList);
      })
      .catch(err => console.error("Error al obtener sugerencias:", err))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) return <p style={{ opacity: 0.5, fontSize: "14px" }}>⏳ Buscando lugares relajantes compatibles...</p>;

  return (
    <div className="trip-suggestions-box" style={{ marginTop: "24px" }}>
      <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#38bdf8", marginBottom: "4px" }}>
        🌿 Lugares tranquilos recomendados para tu viaje
      </h3>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "0 0 16px 0" }}>
        💡 Haz clic sobre cualquier fila para establecerla como destino de tu itinerario automáticamente.
      </p>

      {suggestions.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", fontStyle: "italic" }}>
          No hay sugerencias automáticas de momento. Asegúrate de tener lugares subidos en Explore que coincidan con el mood de tu viaje.
        </p>
      ) : (
        <ul className="suggestions-list" style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          {suggestions.map((place) => (
            <li 
              key={place.id} 
              // 🚀 CAPTURA DEL EVENTO CLIC: Llama al callback del componente padre deteniendo la propagación nativa
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectDestination) {
                  onSelectDestination(place.name);
                }
              }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "14px 18px",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer", /* 👈 Fuerza el cursor interactivo */
                transition: "all 0.2s ease",
                pointerEvents: "auto" /* Asegura que la fila reciba impactos del mouse */
              }}
              // Micro-animación interactiva en caliente para acompañar tus estilos oscuros
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.background = "rgba(56, 189, 248, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
            >
              {/* 🔒 Protegemos las etiquetas interiores para que no intercepten el clic del contenedor padre */}
              <div style={{ pointerEvents: "none" }}>
                <span style={{ fontWeight: "700", color: "#ffffff", display: "block", fontSize: "15px" }}>📍 {place.name}</span>
                {place.country && <small style={{ color: "rgba(255,255,255,0.5)" }}>{place.country}</small>}
              </div>
              
              <span className="badge" style={{ background: "rgba(52, 211, 153, 0.12)", color: "#34d399", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", pointerEvents: "none" }}>
                Paz Score: {place.quiet_score || "Tranquilo"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
