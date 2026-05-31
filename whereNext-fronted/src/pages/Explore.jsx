import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/explore.css";

export default function Explore() {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

  const navigate = useNavigate();

  // =========================================================
  // FETCH PLACES
  // =========================================================
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await API.get("places/");
        const data = res.data || [];
        setPlaces(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error al cargar los lugares:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // =========================================================
  // DEBOUNCE SEARCH (UX PRO)
  // =========================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // =========================================================
  // BOOLEAN SAFE CHECK
  // =========================================================
  const checkTrue = (value) => {
    if (value === true) return true;
    if (typeof value === "string") {
      return value.toLowerCase() === "true" || value === "1";
    }
    if (typeof value === "number") {
      return value === 1;
    }
    return false;
  };

  // =========================================================
  // MAIN FILTER ENGINE
  // =========================================================
  useEffect(() => {
    const query = debouncedQuery.trim().toLowerCase();

    // =========================
    // FILTER PLACES
    // =========================
    const filteredPlaces = places.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const desc = p.description?.toLowerCase() || "";

      const matchesText =
        !query || name.includes(query) || desc.includes(query);

      const matchesCategory =
        activeFilter === "ALL" || p.category === activeFilter;

      const isOfficial = checkTrue(p.is_official);

      const matchesSource =
        sourceFilter === "ALL"
          ? true
          : sourceFilter === "OFFICIAL"
          ? isOfficial
          : !isOfficial;

      return matchesText && matchesCategory && matchesSource;
    });

    setFiltered(filteredPlaces);

  }, [places, debouncedQuery, activeFilter, sourceFilter]);

  useEffect(() => {
  const fetchUsers = async () => {
    if (!debouncedQuery.trim()) {
      setFilteredUsers([]);
      return;
    }

    try {
      const res = await API.get(`/users/search/?search=${debouncedQuery}`);
      setFilteredUsers(res.data || []);
    } catch (err) {
      console.error("Error buscando usuarios:", err);
    }
  };

  fetchUsers();
}, [debouncedQuery]);


  // =========================================================
  // MEDIA SAFE URL
  // =========================================================
  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `http://127.0.0.1:8000${cleanPath}`;
  };

  // =========================================================
  // LOADING STATE
  // =========================================================
  if (loading) {
    return (
      <div className="td-loading-state">
        <p>⏳ Buscando destinos increíbles en WhereNext...</p>
      </div>
    );
  }

  return (
    <div className="explore-page">

      {/* HEADER */}
      <div className="explore-header">
        <h1>Explora lugares sin multitudes</h1>
        <p>Descubre sitios tranquilos subidos por nuestra comunidad global</p>

        <div className="explore-search-input-wrapper">
          <input
            type="text"
            className="explore-search-bar-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar lugares o viajeros..."
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

          {/* USERS DROPDOWN */}
          {searchQuery && filteredUsers.length > 0 && (
            <div className="explore-user-dropdown">
              {filteredUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  className="explore-user-item"
                  onClick={() => navigate(`/users/${userItem.id}`)}
                >
                  <img
                    src={getMediaUrl(userItem.avatar)}
                    alt="avatar"
                  />
                  <span>@{userItem.username}</span>
                </div>
              ))}
            </div>
          )}

          {searchQuery && filteredUsers.length === 0 && (
            <div className="explore-user-dropdown">
              <div className="explore-user-item" style={{ opacity: 0.6 }}>
                No se encontraron usuarios
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-container">
        <div className="filters">
          <button className={activeFilter === "ALL" ? "active" : ""} onClick={() => setActiveFilter("ALL")}>🌍 Todos</button>
          <button className={activeFilter === "NATURE" ? "active" : ""} onClick={() => setActiveFilter("NATURE")}>🌿 Naturaleza</button>
          <button className={activeFilter === "BEACH" ? "active" : ""} onClick={() => setActiveFilter("BEACH")}>🏖️ Playa</button>
          <button className={activeFilter === "CITY" ? "active" : ""} onClick={() => setActiveFilter("CITY")}>🏙️ Ciudad</button>
        </div>

        <div className="filters verification-filters">
          <button className={sourceFilter === "ALL" ? "active" : ""} onClick={() => setSourceFilter("ALL")}>👥 Todo</button>
          <button className={sourceFilter === "OFFICIAL" ? "active" : ""} onClick={() => setSourceFilter("OFFICIAL")}>⭐ Oficiales</button>
          <button className={sourceFilter === "TRAVELER" ? "active" : ""} onClick={() => setSourceFilter("TRAVELER")}>🎒 Viajeros</button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid">
        {filtered.length === 0 ? (
          <p className="td-empty-gallery-msg">
            No se encontraron destinos con la búsqueda o filtros seleccionados.
          </p>
        ) : (
          filtered.map((place) => {
            const isOfficial = checkTrue(place.is_official);

            const creator = place.owner || place.created_by;
            const creatorId = creator?.id || place.owner_id;
            const creatorName = creator?.username || "Viajero";
            const creatorAvatar =
              creator?.avatar || creator?.profile?.avatar || place.owner_avatar;

            return (
              <div
                key={place.id}
                className="card"
                onClick={() => navigate(`/places/${place.id}`)}
              >
                <span className={isOfficial ? "official-badge-tag variant-official" : "official-badge-tag variant-traveler"}>
                  {isOfficial ? "✓ Oficial" : "🎒 Viajero"}
                </span>

                <div className="card-image">
                  <img
                    src={getMediaUrl(place.image_url || place.image, "/default-place.jpg")}
                    alt={place.name}
                  />
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