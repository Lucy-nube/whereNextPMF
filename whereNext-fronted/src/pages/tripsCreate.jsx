import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import TripSuggestions from "../components/trips/TripSuggestions";
import "../styles/TripCreate.css";

export default function TripCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");

  const [mood, setMood] = useState("CITY");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tripType, setTripType] = useState("solo");

  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  // =========================================================
  // FIX: Convertir URL absoluta → ruta relativa
  // =========================================================
  const toRelativePath = (url) => {
    if (!url) return null;
    return url.replace("http://127.0.0.1:8000", "");
  };

  // =========================================================
  // CARGAR VIAJE EN MODO EDICIÓN
  // =========================================================
  useEffect(() => {
    if (!isEditing) return;

    API.get(`/trips/${id}/`)
      .then((res) => {
        const t = res.data;

        setTitle(t.title || "");
        setDescription(t.description || "");
        setDestination(t.destination || "");
        setMood(t.mood || "CITY");
        setStartDate(t.start_date || "");
        setEndDate(t.end_date || "");
        setIsPublic(t.is_public || false);
        setTripType(t.trip_type || "solo");

        if (t.photos?.length > 0) {
          setSelectedImageUrl(t.photos[0].image);
        }
      })
      .catch((err) => console.error("Error cargando viaje:", err));
  }, [isEditing, id]);

  // =========================================================
  // SELECCIÓN DE SUGERENCIA
  // =========================================================
  const handleSelectSuggestion = (placeName, placeImage) => {
    setDestination(placeName);
    setSelectedImageUrl(placeImage);
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    setLoading(true);

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
        invited_companions: selectedFriends,

        photos: [],


      };

      if (isEditing) {
        await API.put(`/trips/${id}/`, payload);
      } else {
        await API.post("/trips/", payload);
      }

      navigate("/trips");
    } catch (err) {
      console.error("Error al guardar viaje:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // MEDIA FORMATTER
  // =========================================================
  const getMediaUrl = (path) => {
    if (!path) return "/default-place.jpg";

    // Si ya es absoluta → no tocar
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Normalizar: quitar slashes iniciales
    let clean = path.replace(/^\/+/, "");

    // Arreglar duplicados tipo media/media/
    clean = clean.replace(/^media\/media\//, "media/");

    return `http://127.0.0.1:8000/${clean}`;
  };

  return (
    <div className="trip-details-view">

      {/* HEADER */}
      <div className="td-header">
        <div className="header-info">
          <h1>
            {isEditing ? "✏️ Editar Aventura" : "🚀 Planificar Aventura"}
          </h1>

          <p className="td-description">
            {isEditing
              ? "Refina tu historia de viaje."
              : "Crea tu próxima experiencia y guárdala en tu pasaporte digital."}
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="td-meta-card">

        {/* TITLE */}
        <div className="td-meta-item">
          <label>TÍTULO</label>
          <input
            type="text"
            className="td-edit-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Summer in Bali"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div className="td-meta-item">
          <label>DESCRIPCIÓN</label>
          <textarea
            className="td-edit-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuenta tu historia..."
          />
        </div>

        {/* DESTINATION */}
        <div className="td-meta-item">
          <label>DESTINO</label>
          <input
            type="text"
            className="td-edit-input"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="París, Tokio..."
          />
        </div>

        <div className="td-meta-item">
          <label>¿Hacer público?</label>
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span className="checkbox-text">
              {isPublic ? "🌍 Público" : "🔒 Privado"}
            </span>
          </label>
        </div>


        {/* MOOD */}
        <div className="td-meta-item">
          <label>MOOD</label>
          <select
            className="td-edit-input select-mood-variant"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            <option value="CITY">🏙️ Ciudad</option>
            <option value="NATURE">🌿 Naturaleza</option>
            <option value="BEACH">🏖️ Playa</option>
            <option value="MUSEUM">🏛️ Museo</option>
            <option value="FOOD">🍜 Gastronomía</option>
          </select>
        </div>

        {/* 🖼️ PREVIEW DE IMAGEN (CORRECTO AQUÍ) */}
        {selectedImageUrl && (
          <div className="td-preview-wrapper">
            <img
              src={getMediaUrl(selectedImageUrl)}
              alt="preview"
              className="td-preview-image"
            />
          </div>
        )}

        {/* 🌍 SUGGESTIONS (FUERA DEL SUBMIT, UX CORRECTO) */}
        <TripSuggestions
          mood={mood}
          onSelectDestination={handleSelectSuggestion}
        />

        {/* 🚀 SUBMIT */}
        <div className="td-publish-wrapper">
          <button
            type="submit"
            className="td-publish-btn"
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : isEditing
                ? "💾 Guardar Cambios"
                : "🚀 Crear Viaje"}
          </button>
        </div>

      </form>
    </div>
  );
}
