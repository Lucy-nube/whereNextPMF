import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/explore.css"; 

export default function Explore() {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros paralelos
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, NATURE, BEACH, CITY
  const [sourceFilter, setSourceFilter] = useState("ALL");   // ALL, OFFICIAL, TRAVELER

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await API.get("places/");
        setPlaces(res.data || []);
        setFiltered(res.data || []);
      } catch (err) {
        console.error("Error al cargar los lugares:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // 🚀 LÓGICA DE FILTRADO COMBINADO DE ALTO RENDIMIENTO (Categoría + Verificación)
  useEffect(() => {
    let result = [...places];

    // 1. Filtrar por Categoría (Naturaleza, Playa, Ciudad)
    if (activeFilter !== "ALL") {
      result = result.filter(p => p.category === activeFilter);
    }

    // 2. Filtrar por Tipo de Cuenta (Oficial vs Viajeros comunes)
    if (sourceFilter === "OFFICIAL") {
      result = result.filter(p => p.is_official === true || p.owner?.is_staff === true);
    } else if (sourceFilter === "TRAVELER") {
      result = result.filter(p => p.is_official === false && p.owner?.is_staff === false);
    }

    setFiltered(result);
  }, [activeFilter, sourceFilter, places]);

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    return path.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
  };

  if (loading) {
    return (
      <div className="td-loading-state">
        <p>⏳ Buscando destinos increíbles en WhereNext...</p>
      </div>
    );
  }

  return (
    <div className="explore-page">
      
      {/* CABECERA (Clases semánticas limpias de estilos inline) */}
      <div className="explore-header">
        <h1>Explora lugares sin multitudes</h1>
        <p>Descubre sitios tranquilos subidos por nuestra comunidad global</p>
      </div>

      {/* PANEL DE FILTROS EN REJILLA */}
      <div className="filters-container">
        
        {/* Fila 1: Categorías tradicionales */}
        <div className="filters">
          <button className={activeFilter === "ALL" ? "active" : ""} onClick={() => setActiveFilter("ALL")}>🌍 Todos</button>
          <button className={activeFilter === "NATURE" ? "active" : ""} onClick={() => setActiveFilter("NATURE")}>🌿 Naturaleza</button>
          <button className={activeFilter === "BEACH" ? "active" : ""} onClick={() => setActiveFilter("BEACH")}>🏖️ Playa</button>
          <button className={activeFilter === "CITY" ? "active" : ""} onClick={() => setActiveFilter("CITY")}>🏙️ Ciudad</button>
        </div>

        {/* Fila 2: Control Oficial vs Viajero */}
        <div className="filters verification-filters">
          <button className={sourceFilter === "ALL" ? "active" : ""} onClick={() => setSourceFilter("ALL")}>👥 Todo el contenido</button>
          <button className={sourceFilter === "OFFICIAL" ? "active" : ""} onClick={() => setSourceFilter("OFFICIAL")}>⭐ Oficiales WhereNext</button>
          <button className={sourceFilter === "TRAVELER" ? "active" : ""} onClick={() => setSourceFilter("TRAVELER")}>🎒 De viajeros</button>
        </div>

      </div>

      {/* CUADRÍCULA DE TARJETA DE LUGARES */}
      <div className="grid">
        {filtered.length === 0 ? (
          <p className="td-empty-gallery-msg">No se encontraron destinos con los filtros seleccionados.</p>
        ) : (
          filtered.map((place) => {
            const isOfficial = place.is_official || place.owner?.is_staff;
            
            return (
              <div
                key={place.id}
                className="card"
                onClick={() => navigate(`/places/${place.id}`)}
              >
                {/* 🚀 ETIQUETA DINÁMICA: Muestra Oficial (Azul) o Viajero (Gris) en base al creador */}
                <span className={isOfficial ? "official-badge-tag variant-official" : "official-badge-tag variant-traveler"}>
                  {isOfficial ? "✓ Oficial" : "🎒 Viajero"}
                </span>

                {/* IMAGEN DEL LUGAR */}
                <div className="card-image">
                  <img src={getMediaUrl(place.image_url || place.image)} alt={place.name} />
                </div>

                {/* CONTENIDO DE LA TARJETA */}
                <div className="card-content">
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>

                  {/* 👤 PROPIETARIO VERÍDICO CON AVATAR RECTIFICADO CRONOLÓGICAMENTE */}
                  <div
                    className="place-owner-mini"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se abra la ficha del lugar al pinchar el perfil
                      if (!place.owner) return;
                      navigate(`/users/${place.owner.id}`);
                    }}
                  >
                    <img
                      src={getMediaUrl(place.owner?.avatar)}
                      alt="owner"
                      className="place-owner-avatar"
                    />
                    <span>@{place.owner?.username || "WhereNext"}</span>
                  </div>

                  <span className="badge">{place.category}</span>
                </div>

              </div>
            );
          })
        )}
      </div>
      
    </div>
  );
}
