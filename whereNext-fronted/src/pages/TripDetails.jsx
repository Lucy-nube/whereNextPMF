import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import TripPhotoUpload from "../components/trips/TripPhotoUpload";
import TripSuggestions from "../components/trips/TripSuggestions";
import "/src/styles/TripDetails.css"; // 🚀 Forzamos la carga absoluta desde la raíz

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ESTADOS DEL FORMULARIO DE EDICIÓN
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  
  // ESTADOS SOCIALES DE AMIGOS ADAPTADOS
  const [tripType, setTripType] = useState("solo");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState([]);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // =========================================================
  // CARGA DE DATOS UNIFICADA (ITINERARIO + HUB DE AMIGOS)
  // =========================================================
  const loadTripData = async () => {
    try {
      // 1. Solicitamos los metadatos de la bitácora actual
      const res = await API.get(`/trips/${id}/`);
      const data = res.data;

      setTrip(data);
      setEditTitle(data.title || "");
      setEditDescription(data.description || "");
      setEditDestination(data.destination || "");
      setEditMood(data.mood || "CITY");
      setEditStartDate(data.start_date || "");
      setEditEndDate(data.end_date || "");
      setEditIsPublic(data.is_public || false);
      setTripType(data.trip_type || "solo");
      setSelectedFriend(data.co_traveler || null);

      // 2. Solicitamos tu lista de amigos ACCEPTED desde el endpoint real de usuarios
      const friendsRes = await API.get("/users/companions/hub/");
      setFriends(friendsRes.data || []);

      setError(false);
    } catch (err) {
      console.error("Error cargando el pasaporte del viaje:", err);
      setTrip(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }
    loadTripData();
  }, [id]);

  const handleUpdateDestination = async (newDestination) => {
    try {
      await API.patch(`/trips/${id}/`, { destination: newDestination });
      setTrip((prev) => ({ ...prev, destination: newDestination }));
      setEditDestination(newDestination);
      showToast("📍 Destino fijado con éxito");
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // ACCIÓN CRUD: GUARDAR CAMBIOS DE EDICIÓN
  // =========================================================
  const handleSaveChanges = async () => {
    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        destination: editDestination,
        mood: editMood,
        start_date: editStartDate || null,
        end_date: editEndDate || null,
        is_public: editIsPublic,
        trip_type: tripType,
        co_traveler: tripType === "couple" ? selectedFriend : null
      };

      const res = await API.patch(`/trips/${id}/`, payload);
      setTrip(res.data);
      setIsEditing(false);
      loadTripData();
      showToast("💾 Cambios guardados correctamente");
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // ACCIÓN CRUD: ELIMINAR ITINERARIO PERMANENTE
  // =========================================================
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await API.delete(`/trips/${id}/`);
      navigate("/trips");
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  if (loading) return <p className="td-loading-state">⏳ Cargando pasaporte digital...</p>;

  if (error || !trip) {
    return (
      <div className="td-error-view">
        <h2>✈️ Viaje no encontrado</h2>
        <button className="td-back-btn" onClick={() => navigate("/trips")}>
          Volver a mis viajes
        </button>
      </div>
    );
  }

  return (
    <div className="trip-details-view">

      {/* TOAST FLOTANTE INYECTADO */}
      {toastMessage && (
        <div className="td-toast-notification">
          {toastMessage}
        </div>
      )}

      <button className="td-back-btn" onClick={() => navigate("/trips")}>
        ← Volver
      </button>

      {/* CABECERA PRINCIPAL */}
      <div className="td-header">
        {isEditing ? (
          <div className="td-edit-input-group">
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="td-edit-input" placeholder="Título" />
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="td-edit-input" placeholder="Descripción" />
          </div>
        ) : (
          <div className="header-info">
            <h1>{trip.title}</h1>
            <p className="td-description">{trip.description || "Sin descripción disponible."}</p>
          </div>
        )}

        <div className="td-actions-container">
          {isEditing ? (
            <>
              <button className="td-upload-trigger-btn" onClick={handleSaveChanges}>💾 Guardar</button>
              <button className="td-back-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
            </>
          ) : (
            <>
              <button type="button" className="td-upload-trigger-btn btn-edit-variant" onClick={() => setIsEditing(true)}>✏️ Editar</button>
              <button className="td-back-btn td-delete-btn" onClick={() => setShowDeleteModal(true)}>🗑️ Eliminar</button>
            </>
          )}
        </div>
      </div>

      {/* TARJETA PASAPORTE DE METADATOS COMPACTA */}
      <div className="td-meta-card">
        <div className="td-meta-item">
          <label>DESTINO FIJADO</label>
          {isEditing ? (
            <input className="td-edit-input" value={editDestination} onChange={(e) => setEditDestination(e.target.value)} placeholder="Ej: Seúl" />
          ) : (
            <strong className="td-destination-highlight">
              {trip.destination ? `📍 ${trip.destination}` : "🚫 Ninguno seleccionado. ¡Elige una sugerencia abajo!"}
            </strong>
          )}
        </div>

        <div className="td-meta-item">
          <label>MOOD DEL VIAJE</label>
          {isEditing ? (
            <select className="td-edit-input select-mood-variant" value={editMood} onChange={(e) => setEditMood(e.target.value)}>
              <option value="CITY">🏙️ Ciudad</option>
              <option value="NATURE">🌿 Naturaleza</option>
              <option value="BEACH">🏖️ Playa</option>
              <option value="MUSEUM">🏛️ Museo</option>
              <option value="FOOD">🍜 Gastronomía</option>
            </select>
          ) : (
            <strong className="td-mood-highlight">{trip.mood || "No definido"}</strong>
          )}
        </div>

        {/* SELECTOR: TIPO DE VIAJE */}
        <div className="td-meta-item">
          <label>TIPO DE VIAJE</label>
          {isEditing ? (
            <select className="td-edit-input select-mood-variant" value={tripType} onChange={(e) => setTripType(e.target.value)}>
              <option value="solo">🌙 Viaje sola</option>
              <option value="couple">💞 Viaje para dos</option>
              <option value="group">👥 Viaje en grupo</option>
            </select>
          ) : (
            <strong className="td-mood-highlight">
              {tripType === "solo" && "🌙 Viaje sola"}
              {tripType === "couple" && "💞 Viaje para dos"}
              {tripType === "group" && "👥 Viaje en grupo"}
            </strong>
          )}
        </div>

        {/* CHIPS DE COMPAÑEROS ACTIVOS */}
        {tripType === "couple" && (
          <div className="td-meta-item">
            <label>COMPAÑERO DE AVENTURA</label>
            {isEditing ? (
              <div className="td-couple-chips-container">
                {friends.length === 0 ? (
                  <p className="td-empty-gallery-msg">Necesitas compañeros aceptados en tu hub para seleccionarlos.</p>
                ) : (
                  friends.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={selectedFriend == f.id ? "td-friend-chip active" : "td-friend-chip"}
                      onClick={() => setSelectedFriend(f.id)}
                    >
                      @{f.username}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <strong className="td-destination-highlight">
                {trip?.co_traveler_username ? `✉️ Conectado con @${trip.co_traveler_username}` : "💞 Buscando acompañante... (Pulsa Editar para fijarlo)"}
              </strong>
            )}
          </div>
        )}
                {/* REJILLA DE FECHAS */}
        <div className="td-dates-row">
          <div className="td-meta-item">
            <label>FECHA INICIO</label>
            {isEditing ? (
              <input 
                type="date" 
                className="td-edit-input" 
                value={editStartDate} 
                onChange={(e) => setEditStartDate(e.target.value)} 
              />
            ) : (
              <span className="td-date-val">{trip.start_date || "No definido"}</span>
            )}
          </div>
          
          <div className="td-meta-item">
            <label>FECHA FIN</label>
            {isEditing ? (
              <input 
                type="date" 
                className="td-edit-input" 
                value={editEndDate} 
                onChange={(e) => setEditEndDate(e.target.value)} 
              />
            ) : (
              <span className="td-date-val">{trip.end_date || "No definido"}</span>
            )}
          </div>
        </div>

        {/* PRIVACIDAD */}
        <div className="td-visibility-row">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={editIsPublic}
              onChange={async (e) => {
                const value = e.target.checked;
                try {
                  await API.patch(`/trips/${id}/`, { is_public: value });
                  setTrip((prev) => ({ ...prev, is_public: value }));
                  setEditIsPublic(value);
                  showToast(value ? "🌍 Itinerario configurado como Público" : "🔒 Itinerario configurado como Privado");
                } catch (err) {
                  console.error(err);
                }
              }}
            />
            <span className="checkbox-text">
              {editIsPublic ? "🌍 Público para la comunidad" : "🔒 Privado (solo tú y amigos)"}
            </span>
          </label>
        </div>

        {/* BOTÓN PUBLICAR AVENTURA */}
        {!isEditing && !trip.is_published && (
          <div className="td-publish-wrapper">
            <button
              type="button"
              className="td-publish-btn"
              onClick={async () => {
                try {
                  await API.patch(`/trips/${id}/`, { is_published: true });
                  setTrip((prev) => ({ ...prev, is_published: true }));
                  showToast("🚀 Aventura publicada en el feed");
                  setTimeout(() => navigate("/"), 800);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              🚀 Publicar Aventura
            </button>
          </div>
        )}
      </div>

      {/* SUGERENCIAS INTEGRADAS */}
      {trip.id && (
        <TripSuggestions 
          tripId={trip.id} 
          onSelectDestination={handleUpdateDestination} 
        />
      )}

      {/* GALERÍA MULTIMEDIA */}
      <div className="td-gallery-section">
        <h3>📷 Galería multimedia</h3>
        <div className="td-photo-grid">
          {trip.photos?.length ? (
            trip.photos.map((p) => (
              <img
                key={p.id}
                src={p.image.startsWith("http") ? p.image : `http://127.0.0.1:8000${p.image}`}
                className="td-gallery-image"
                alt="Recuerdo"
              />
            ))
          ) : (
            <p className="td-empty-gallery-msg">Una vez allí no olvides inmortalizar este destino.</p>
          )}
        </div>
        <button type="button" className="td-upload-trigger-btn" onClick={() => setShowUpload(true)}>
          📸 Subir foto de recuerdo
        </button>
      </div>

      {showUpload && trip.id && (
        <TripPhotoUpload 
          tripId={trip.id} 
          onUploaded={() => { loadTripData(); setShowUpload(false); }} 
        />
      )}

      {/* MODAL ELIMINAR REPARADO */}
      {showDeleteModal && (
        <div className="td-modal-overlay">
          <div className="td-modal-card">
            <h3>⚠️ ¿Archivar aventura?</h3>
            <p className="td-modal-text">Estás a punto de borrar tu pasaporte de viaje de forma permanente. Esta acción no se puede deshacer.</p>
            <div className="td-modal-actions">
              <button type="button" className="td-modal-btn-confirm" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Archivando..." : "Sí, eliminar"}
              </button>
              <button type="button" className="td-modal-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

