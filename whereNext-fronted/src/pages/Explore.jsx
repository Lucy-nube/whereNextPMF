import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getMediaUrl } from "../utils/media";
import "../styles/explore.css";

export default function Explore() {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [activeFilter, setActiveFilter] = useState("ALL");

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


      return matchesText && matchesCategory;
    });

    setFiltered(filteredPlaces);

  }, [places, debouncedQuery, activeFilter]);

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
          {debouncedQuery.trim() !== "" && filteredUsers.length > 0 && (
            <div className="explore-user-dropdown">
              {filteredUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  className="explore-user-item"
                  onClick={() => navigate(`/users/${userItem.id}`)}
                >
                  <img
                    src={getMediaUrl(
                      userItem.avatar || userItem.profile?.avatar,
                      "/default-avatar.png"
                    )}
                    alt="avatar"
                  />
                  <span>@{userItem.username}</span>
                </div>
              ))}
            </div>
          )}

          {debouncedQuery.trim() !== "" && filteredUsers.length === 0 && (
            <div className="explore-no-results">
              No se encontraron usuarios
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
      </div>

      {/* GRID */}
      <div className="grid">
        {filtered.length === 0 ? (
          <p className="td-empty-gallery-msg">
            No se encontraron destinos con la búsqueda o filtros seleccionados.
          </p>
        ) : (
          filtered.map((place) => {
            const creatorName = "Oficial";
            const creatorAvatar = "/default-avatar.png";


            return (
              <div
                key={place.id}
                className="card"
                onClick={() => {
                  const isLoggedIn = !!localStorage.getItem("access");
                  if (!isLoggedIn) {
                    navigate("/login");
                    return;
                  }
                  navigate(`/places/${place.id}`);
                }}
              >
                <span className="official-badge-tag variant-official">✓ Oficial</span>

                <div className="card-image">
                  <img
                    src={getMediaUrl(place.image_url, "/default-place.jpg")}
                    alt={place.name}
                  />
                </div>

                <div className="card-content">
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>

                  {/* OWNER */}
                  <div
                    className="place-owner-mini owner-link-active"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (place.owner?.id) navigate(`/users/${place.owner.id}`);
                    }}
                  >
                    <img
                      src={getMediaUrl(
                        place.owner?.avatar || place.owner?.profile?.avatar,
                        "/default-avatar.png"
                      )}
                      alt="owner"
                      className="place-owner-avatar"
                    />
                    <span>@{place.owner?.username}</span>
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