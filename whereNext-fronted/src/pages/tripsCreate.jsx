import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function TripCreate() {
  const navigate = useNavigate();

  // ESTADOS DEL FORMULARIO BASE
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [mood, setMood] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // ESTADOS DE RELACIONES SINCRONIZADOS
  const [tripType, setTripType] = useState("solo");
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  // 🚀 NUEVOS ESTADOS: Para las sugerencias en tiempo real basadas en el mood
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // 1. Carga inicial del Hub de amigos para el selector de acompañantes
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await API.get("/companions/hub/");
        setFriends(res.data || []);
      } catch (err) {
        console.error("Error al cargar compañeros:", err);
      }
    };
    fetchFriends();
  }, []);

  // 🚀 2. MOTOR DE SUGERENCIAS AL VUELO: Escucha los cambios de la variable 'mood'
  useEffect(() => {
    if (!mood) {
      setSuggestions([]);
      return;
    }

    const fetchMoodSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        // Golpeamos el endpoint de lugares filtrando por la categoría/mood seleccionada
        const res = await API.get(`places/?category=${mood}`);
        // Nos quedamos con un máximo de 3 sugerencias para no saturar el formulario
        setSuggestions(res.data ? res.data.slice(0, 3) : []);
      } catch (err) {
        console.error("Error cargando sugerencias de destinos:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchMoodSuggestions();
  }, [mood]);

  // 🚀 ACCIÓN INTERACTIVA: Si pulsan una sugerencia, rellena el campo Destino automáticamente
  const handleSelectSuggestion = (placeName, placeCountry) => {
    setDestination(`${placeName}, ${placeCountry}`);
  };

  const handleToggleFriend = (friendId) => {
    if (tripType === "couple") {
      setSelectedFriends([friendId]);
    } else {
      setSelectedFriends((prev) =>
        prev.includes(friendId)
          ? prev.filter((id) => id !== friendId)
          : [...prev, friendId]
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        destination,
        mood,
        start_date: startDate || null,
        end_date: endDate || null,
        is_public: isPublic,
        trip_type: tripType,
        co_travelers: tripType !== "solo" ? selectedFriends : []
      };

      const res = await API.post("/trips/", payload);
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      console.error("Error al crear itinerario:", err.response?.data || err);
    }
  };

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    return path.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
  };

  return (
    <div className="create-trip-container">
      
      <div className="create-trip-header">
        <h1>✈️ Nueva Bitácora</h1>
        <p>Registra tu próximo destino en tu pasaporte digital de WhereNext</p>
      </div>

      <form className="create-trip-card" onSubmit={handleSubmit}>
        <div className="create-trip-content">
          
          <div className="form-group">
            <label className="form-label">Título del viaje *</label>
            <input 
              placeholder="Ej: Aventura de Verano en Seúl" 
              required 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea 
              placeholder="¿Qué buscas o qué planeas en este viaje?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destino</label>
            <input 
              placeholder="¿A dónde quieres ir? (O elige una sugerencia abajo)" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          {/* COLUMNAS COMPACTAS DE SELECCIÓN */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mood del viaje</label>
              <select 
                required
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                <option value="">Selecciona un mood...</option>
                <option value="CITY">🏙️ Ciudad</option>
                <option value="NATURE">🌿 Naturaleza</option>
                <option value="BEACH">🏖️ Playa</option>
                <option value="MUSEUM">🏛️ Museo</option>
                <option value="FOOD">🍜 Gastronomía</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de viaje</label>
              <select 
                value={tripType} 
                onChange={(e) => {
                  setTripType(e.target.value);
                  setSelectedFriends([]); 
                }}
              >
                <option value="solo">🌙 Viaje sola</option>
                <option value="couple">💞 Viaje para dos</option>
                <option value="group">👥 Viaje en grupo</option>
              </select>
            </div>
          </div>

          {/* 🚀 NUEVA SECCIÓN DE SUGERENCIAS AL VUELO COINCIDENTES */}
          {mood && (
            <div className="form-group suggestions-box-wrapper">
              <label className="form-label">✨ Destinos sugeridos para mood {mood}</label>
              
              {loadingSuggestions ? (
                <p className="create-trip-empty-msg">Buscando rincones idóneos...</p>
              ) : suggestions.length === 0 ? (
                <p className="create-trip-empty-msg">No hay lugares registrados en Explore con este mood todavía.</p>
              ) : (
                <div className="create-trip-suggestions-grid">
                  {suggestions.map((p) => (
                    <div 
                      key={p.id} 
                      className="create-trip-suggestion-item"
                      onClick={() => handleSelectSuggestion(p.name, p.country)}
                    >
                      <img src={getMediaUrl(p.image_url || p.image)} alt={p.name} className="suggestion-item-img" />
                      <div className="suggestion-item-info">
                        <strong>{p.name}</strong>
                        <span>📍 {p.country}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN INTERACTIVA SELECCIÓN AMIGOS */}
          {tripType !== "solo" && (
            <div className="form-group">
              <label className="form-label">
                {tripType === "couple" ? "Elegir compañero de aventura" : "Elegir compañeros de grupo"}
              </label>
              <div className="create-trip-chips-container">
                {friends.length === 0 ? (
                  <p className="create-trip-empty-msg">Necesitas compañeros aceptados en tu hub para seleccionarlos.</p>
                ) : (
                  friends.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={selectedFriends.includes(f.id) ? "create-trip-friend-chip active" : "create-trip-friend-chip"}
                      onClick={() => handleToggleFriend(f.id)}
                    >
                      @{f.username}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha de inicio</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de fin</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group checkbox-wrapper-block">
            <label className="checkbox-container">
              <input 
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="checkbox-text">Hacer este viaje público</span>
            </label>
          </div>

          <button type="submit" className="submit-trip-btn">Crear viaje</button>
        </div>
      </form>
    </div>
  );
}
