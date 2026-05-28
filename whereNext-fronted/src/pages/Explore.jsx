import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/explore.css";

export default function Explore() {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // 🚀 ESTADO CORRECTO PARA USUARIOS ENCONTRADOS
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  // FILTERS & SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

  const navigate = useNavigate();

  // =========================================================
  // FETCH PLACES FROM OPEN CATALOG
  // =========================================================
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

  // =========================================================
  // HELPER FUNCTION: STRICT BOOLEAN SANITIZER
  // =========================================================
  const checkTrue = (value) => {
    if (value === true || value === 1 || value === "1") return true;
    if (typeof value === "string" && value.toLowerCase() === "true") return true;
    return false;
  };

  // =========================================================
  // FILTER ENGINE + BUSCADOR DE USUARIOS
  // =========================================================
  useEffect(() => {
    let result = [...places];
    const query = searchQuery.trim().toLowerCase();

    // 1. TEXT SEARCH FILTER (Para lugares)
    if (query !== "") {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // 2. CATEGORY MOOD FILTER
    if (activeFilter !== "ALL") {
      result = result.filter((p) => p.category === activeFilter);
    }

    // 3. SOURCE FILTER
    if (sourceFilter === "OFFICIAL") {
      result = result.filter((p) => checkTrue(p.is_official));
    } else if (sourceFilter === "TRAVELER") {
      result = result.filter((p) => !checkTrue(p.is_official));
    }

    setFiltered(result);

    // =========================================================
    // 🚀 BUSCADOR DE USUARIOS BASADO EN LOS CREADORES DE LUGARES
    // =========================================================
    if (query !== "") {
      const userMap = new Map();

      places.forEach((p) => {
        const creator = p.owner || p.created_by;
        if (creator && creator.username) {
          const usernameLower = creator.username.toLowerCase();
          if (usernameLower.includes(query)) {
            userMap.set(creator.id, creator);
          }
        }
      });

      setFilteredUsers(Array.from(userMap.values()));
    } else {
      setFilteredUsers([]);
    }

  }, [places, searchQuery, activeFilter, sourceFilter]);

  // =========================================================
  // MEDIA URL EXTRA-SAFE HANDLER
  // =========================================================
  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `http://127.0.0.1:8000${cleanPath}`;
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

      {/* HEADER WITH SEARCH INPUT BLOCK */}
      <div className="explore-header">
        <h1>Explora lugares sin multitudes</h1>
        <p>Descubre sitios tranquilos subidos por nuestra comunidad global</p>

        <div className="explore-search-input-wrapper">
          <input
            type="text"
            className="explore-search-bar-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar rincones, playas o el perfil de un viajero..."
          />

          {searchQuery && (
            <button
              type="button"
              className="explore-search-clear-trigger"
              onClick={() => {
                setSearchQuery("");
                setFilteredUsers([]);
              }}
            >
              ✕
            </button>
          )}

          {/* 🔽 DROPDOWN DE USUARIOS — AHORA SÍ DEBAJO DEL SEARCH */}
          {searchQuery && filteredUsers.length > 0 && (
            <div className="explore-user-dropdown">
              {filteredUsers.map((userItem) => {
                const avatar = userItem.avatar || userItem.profile?.avatar;
                return (
                  <div
                    key={userItem.id}
                    className="explore-user-item"
                    onClick={() => navigate(`/users/${userItem.id}`)}
                  >
                    <img
                      src={getMediaUrl(avatar, "/default-avatar.png")}
                      alt="avatar"
                    />
                    <span>@{userItem.username}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FILTERS PANEL CONTROLS */}
      <div className="filters-container">
        <div className="filters">
          <button type="button" className={activeFilter === "ALL" ? "active" : ""} onClick={() => setActiveFilter("ALL")}>🌍 Todos</button>
          <button type="button" className={activeFilter === "NATURE" ? "active" : ""} onClick={() => setActiveFilter("NATURE")}>🌿 Naturaleza</button>
          <button type="button" className={activeFilter === "BEACH" ? "active" : ""} onClick={() => setActiveFilter("BEACH")}>🏖️ Playa</button>
          <button type="button" className={activeFilter === "CITY" ? "active" : ""} onClick={() => setActiveFilter("CITY")}>🏙️ Ciudad</button>
        </div>

        <div className="filters verification-filters">
          <button type="button" className={sourceFilter === "ALL" ? "active" : ""} onClick={() => setSourceFilter("ALL")}>👥 Todo el contenido</button>
          <button type="button" className={sourceFilter === "OFFICIAL" ? "active" : ""} onClick={() => setSourceFilter("OFFICIAL")}>⭐ Oficiales WhereNext</button>
          <button type="button" className={sourceFilter === "TRAVELER" ? "active" : ""} onClick={() => setSourceFilter("TRAVELER")}>🎒 De viajeros</button>
        </div>
      </div>

      {/* CARD GRID CONTAINER */}
      <div className="grid">
        {filtered.length === 0 ? (
          <p className="td-empty-gallery-msg">No se encontraron destinos con la búsqueda o filtros seleccionados.</p>
        ) : (
          filtered.map((place) => {
            const isOfficial = checkTrue(place.is_official);

            const creator = place.owner || place.created_by;
            const creatorId = creator?.id || place.owner_id;
            const creatorName = creator?.username || "Viajero";
            const creatorAvatar = creator?.avatar || creator?.profile?.avatar || place.owner_avatar;

            return (
              <div key={place.id} className="card" onClick={() => navigate(`/places/${place.id}`)}>

                <span className={isOfficial ? "official-badge-tag variant-official" : "official-badge-tag variant-traveler"}>
                  {isOfficial ? "✓ Oficial" : "🎒 Viajero"}
                </span>

                <div className="card-image">
                  <img src={getMediaUrl(place.image_url || place.image, "/default-place.jpg")} alt={place.name} />
                </div>

                <div className="card-content">
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>

                  <div
                    className="place-owner-mini owner-link-active"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (creatorId) navigate(`/users/${creatorId}`);
                    }}
                  >
                    <img
                      src={getMediaUrl(creatorAvatar, "/default-avatar.png")}
                      alt="owner"
                      className="place-owner-avatar"
                    />
                    <span>@{creatorName}</span>
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
