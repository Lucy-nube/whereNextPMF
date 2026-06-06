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
    // Si placeName es un objeto → extraemos su nombre
    if (typeof placeName === "object") {
      setDestination(placeName.name || placeName.title || placeName.destination || "");
      setSelectedImageUrl(placeName.image || placeImage || "");
    } else {
      // Si ya es un string → lo usamos directo
      setDestination(placeName);
      setSelectedImageUrl(placeImage);
    }
  };


  // =========================================================
  // SUBMIT
  // =========================================================
  const [error, setError] = useState(null); // <-- Añadir este estado arriba

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ============================
    // 1. Validación de fechas
    // ============================
    if (new Date(startDate) > new Date(endDate)) {
      setError("La fecha de inicio no puede ser mayor que la fecha de fin");
      return;
    }

    // ============================
    // 2. Normalizar trip_type
    // ============================
    const normalizedTripType = tripType.toUpperCase();

    // ============================
    // 3. Validar co-traveler si es COUPLE
    // ============================
    let invited_companions_clean = selectedFriends || [];

    if (normalizedTripType === "COUPLE") {
      if (!invited_companions_clean.length) {
        setError("Debes seleccionar un acompañante para un viaje en pareja");
        return;
      }
    }

    // ============================
    // 4. Payload limpio
    // ============================
    const payload = {
      title,
      description,
      destination,
      mood,
      start_date: startDate,
      end_date: endDate,
      is_public: isPublic,
      trip_type: normalizedTripType,
      invited_companions: invited_companions_clean
    };

    try {
      setLoading(true);

      if (isEditing) {
        await API.patch(`/trips/${id}/`, payload);
      } else {
        await API.post("/trips/", payload);
      }

      navigate("/trips");

    } catch (err) {
      if (err.response?.data) {
        const backendError = Object.values(err.response.data)[0];
        setError(backendError);
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
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
        {/* START DATE */}
        <div className="td-meta-item">
          <label>FECHA DE INICIO</label>
          <input
            type="date"
            className="td-edit-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        {/* END DATE */}
        <div className="td-meta-item">
          <label>FECHA DE FIN</label>
          <input
            type="date"
            className="td-edit-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
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

        {/* ⭐ ERROR BONITO */}
        {error && (
          <div className="td-error-message">
            {error}
          </div>
        )}

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
