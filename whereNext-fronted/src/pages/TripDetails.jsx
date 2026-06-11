import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import TripPhotoUpload from "../components/trips/TripphotoUpload";
import TripSuggestions from "../components/trips/TripSuggestions";
import CompanionsModal from "../components/trips/CompanionsModal";
import { getMediaUrl } from "../utils/media";
import "/src/styles/TripDetails.css";

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

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const refresh = params.get("refresh");


  // FORM STATES
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);

  // SOCIAL STATES
  const [editTripType, setEditTripType] = useState("solo");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);
  const [sentInvites, setSentInvites] = useState([]);


  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2500);
  };



  const fetchInvites = async () => {
    if (!trip?.id) return;
    const res = await API.get(`/invites/trip-invites/?trip=${trip.id}`);
    setSentInvites(res.data || []);
  };



  const getInviteForUser = (userId) => {
    return sentInvites.find(inv => {
      const invited = inv.to_user || inv.invited_user;

      if (!invited) return false;

      // si viene como objeto
      if (typeof invited === "object") return invited.id === userId;

      // si viene como número
      return invited === userId;
    });
  };



  // =========================================================
  // LOAD TRIP DATA
  // =========================================================
  const loadTripData = async () => {
    try {
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
      setEditTripType(data.trip_type || "solo");
      setSelectedFriend(
        data.companions?.[0] ||
        data.co_traveler ||
        null
      );


      const friendsRes = await API.get("companions/");
      setFriends(friendsRes.data || []);

      setError(false);
    } catch (err) {
      console.error("Error cargando viaje:", err);
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
  }, [id, refresh]);

  useEffect(() => {
    if (trip?.id) {
      fetchInvites();
    }
  }, [trip?.id]);
  

  useEffect(() => {
    if (!trip) return;

    // Si ya envié una invitación, NO pisar el estado
    const alreadyInvited = sentInvites.length > 0;
    if (alreadyInvited) return;

    const pending = trip.pending_invites?.[0]?.to_user;

    setSelectedFriend(
      trip.companions?.[0] ||
      trip.co_traveler ||
      pending ||
      null
    );

    if (!isEditing) {
      setEditTripType(trip.trip_type || "solo");
    }
  }, [trip, isEditing, sentInvites]);





  // =========================================================
  // SAVE EDITS
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
        trip_type: editTripType,
        co_traveler: editTripType === "couple" ? selectedFriend : null,
      };

      const res = await API.patch(`/trips/${id}/`, payload);
      setTrip(res.data);
      setIsEditing(false);
      loadTripData();
      showToast("💾 Cambios guardados");
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // DELETE PHOTO
  // =========================================================
  const deletePhoto = async (photoId) => {
    try {
      const response = await API.delete(`/trips/photos/${photoId}/`);

      console.log("RAW RESPONSE:", response);

      setTrip((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p.id !== photoId),
      }));

      showToast("🗑️ Foto eliminada");
    } catch (err) {
      console.error("ERROR FULL:", err);
      console.error("STATUS:", err.response?.status);
      console.error("DATA:", err.response?.data);
    }
  };
  // =========================================================
  // INVITACIONES
  // =========================================================
  const sendInvite = async (userId) => {
    try {
      const res = await API.post("/invites/trip-invites/", {
        trip: trip.id,
        to_user: userId,
      });

      setSentInvites((prev) => [...prev, res.data]);

      return res.data;
    } catch (err) {
      console.error("Error enviando invitación:", err);
      throw err;
    }
  };


  const cancelInvite = async (inviteId) => {
    try {
      await API.delete(`/invites/trip-invites/${inviteId}/`);

      setSentInvites((prev) =>
        prev.filter((inv) => inv.id !== inviteId)
      );
    } catch (err) {
      console.error("Error cancelando invitación:", err);
    }
  };

  // =========================================================
  // DELETE TRIP
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

  if (loading) return <p className="td-loading-state">⏳ Cargando viaje...</p>;

  if (error || !trip) {
    return (
      <div className="td-error-view">
        <h2>✈️ Viaje no encontrado</h2>
        <button className="td-back-btn" onClick={() => navigate("/trips")}>
          Volver
        </button>
      </div>
    );
  }

  const fetchTrip = async (id) => {
    const res = await API.get(`/trips/${id}/`);
    return res.data;
  };

  return (
    <div className="trip-details-view">
      {toastMessage && (
        <div className="td-toast-notification">{toastMessage}</div>
      )}

      <button className="td-back-btn" onClick={() => navigate("/trips")}>
        ← Volver
      </button>

      {/* FORMULARIO */}
      <form className="td-details-form">
        {/* HEADER */}
        <div className="td-header">
          {isEditing ? (
            <div className="td-edit-input-group">
              <input
                value={editTitle || ""}
                onChange={(e) => setEditTitle(e.target.value)}
                className="td-edit-input"
              />
              <textarea
                value={editDescription || ""}
                onChange={(e) => setEditDescription(e.target.value)}
                className="td-edit-input"
              />
            </div>
          ) : (
            <div className="header-info">
              <h1>{trip.title}</h1>
              <p className="td-description">
                {trip.description || "Sin descripción."}
              </p>
            </div>
          )}

          <div className="td-actions-container">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="td-upload-trigger-btn"
                  onClick={handleSaveChanges}
                >
                  💾 Guardar
                </button>
                <button
                  type="button"
                  className="td-back-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="td-upload-trigger-btn btn-edit-variant"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Editar
                </button>
                <button
                  type="button"
                  className="td-back-btn td-delete-btn"
                  onClick={() => setShowDeleteModal(true)}
                >
                  🗑️ Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        {/* META CARD */}
        <div className="td-meta-card">
          {/* DESTINO */}
          <div className="td-meta-item">
            <label>DESTINO</label>
            {isEditing ? (
              <input
                className="td-edit-input"
                value={editDestination || ""}
                onChange={(e) => setEditDestination(e.target.value)}
              />
            ) : (
              <strong className="td-destination-highlight">
                {trip.destination
                  ? `📍 ${trip.destination}`
                  : "🚫 Ninguno seleccionado"}
              </strong>
            )}
          </div>

          {/* MOOD */}
          <div className="td-meta-item">
            <label>MOOD</label>
            {isEditing ? (
              <select
                className="td-edit-input"
                value={editMood}
                onChange={(e) => setEditMood(e.target.value)}
              >
                <option value="CITY">🏙️ Ciudad</option>
                <option value="NATURE">🌿 Naturaleza</option>
                <option value="BEACH">🏖️ Playa</option>
                <option value="MUSEUM">🏛️ Museo</option>
                <option value="FOOD">🍜 Gastronomía</option>
              </select>
            ) : (
              <strong className="td-mood-highlight">{trip.mood}</strong>
            )}
          </div>

          {/* TYPE */}
          <div className="td-meta-item">
            <label>TIPO</label>
            {isEditing ? (
              <select
                className="td-edit-input"
                value={editTripType}
                onChange={(e) => setEditTripType(e.target.value)}
              >
                <option value="solo">🌙 Solo</option>
                <option value="couple">💞 Pareja</option>
              </select>
            ) : (
              <strong className="td-mood-highlight">
                {trip.trip_type?.toLowerCase() === "solo" && "🌙 Solo"}
                {trip.trip_type?.toLowerCase() === "couple" && "💞 Pareja"}

              </strong>
            )}
          </div>

          {/* COMPAÑEROS */}
          {isEditing ? (
            <div className="td-companions-section">
              <h3>👥 Compañer@ del viaje</h3>

              {editTripType?.toLowerCase() === "solo" && (
                <p className="td-empty-msg">Este viaje es individual.</p>
              )}

              {editTripType?.toLowerCase() === "couple" && (
                <div className="td-meta-item td-couple-select">
                  <label>COMPAÑERO DE VIAJE</label>

                  {selectedFriend ? (
                    <div className="td-selected-friend">
                      <span>@{selectedFriend.username}</span>

                      {(() => {
                        const invite = getInviteForUser(selectedFriend.id);

                        // compañero ya aceptado
                        if (trip?.companions?.some(c => c.id === selectedFriend.id)) {
                          return (
                            <span className="invite-accepted">
                              💞 Compañero confirmado
                            </span>
                          );
                        }

                        // invitación pendiente
                        if (invite?.status === "PENDING") {
                          return (
                            <button
                              type="button"
                              className="invite-btn sent"
                              onClick={async () => {
                                await cancelInvite(invite.id);
                                await fetchInvites();
                              }}
                            >
                              ✓ Invitación enviada (Cancelar)
                            </button>
                          );
                        }

                        // aceptada (por si companions aún no se ha actualizado)
                        if (invite?.status === "ACCEPTED") {
                          return (
                            <span className="invite-accepted">
                              💞 Compañero confirmado
                            </span>
                          );
                        }

                        // rechazada o inexistente
                        return (
                          <button
                            type="button"
                            className="invite-btn"
                            onClick={async () => {
                              await sendInvite(selectedFriend.id);
                              await fetchInvites();
                            }}
                          >
                            Enviar invitación
                          </button>
                        );
                      })()}

                      <button
                        type="button"
                        className="td-remove-friend-btn"
                        onClick={() => setSelectedFriend(null)}
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="td-upload-trigger-btn"
                      onClick={() => setShowCompanionsModal(true)}
                    >
                      👤 Elegir compañero
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ⭐ MODO VISTA */
            <div className="td-companions-section">
              <h3>👥 Compañer@ del viaje</h3>

              {trip.trip_type === "solo" && (
                <p className="td-empty-msg">Este viaje es individual.</p>
              )}

              {trip.trip_type === "couple" && (
                <>
                  {trip.companions?.length > 0 ? (
                    <p className="td-mood-highlight">
                      👤 @{trip.companions[0].username}
                    </p>
                  ) : trip.pending_invites?.length > 0 ? (
                    <p className="td-mood-highlight">
                      ⏳ Invitación pendiente para @{trip.pending_invites[0].to_user.username}
                    </p>
                  ) : (
                    <p className="td-empty-msg">Sin compañero seleccionado.</p>
                  )}
                </>
              )}
            </div>

          )}

          {/* DATES */}
          <div className="td-dates-row">
            <div className="td-meta-item">
              <label>INICIO</label>
              {isEditing ? (
                <input
                  type="date"
                  className="td-edit-input"
                  value={editStartDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditStartDate(value);

                    if (editEndDate && value > editEndDate) {
                      showToast("⚠️ La fecha de inicio no puede ser mayor que la de fin");
                    }
                  }}
                />
              ) : (
                <span className="td-date-val">
                  {trip.start_date || "No definido"}
                </span>
              )}
            </div>

            <div className="td-meta-item">
              <label>FIN</label>
              {isEditing ? (
                <input
                  type="date"
                  className="td-edit-input"
                  value={editEndDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditEndDate(value);

                    if (editStartDate && value < editStartDate) {
                      showToast("⚠️ La fecha de fin no puede ser anterior a la de inicio");
                    }
                  }}
                />
              ) : (
                <span className="td-date-val">
                  {trip.end_date || "No definido"}
                </span>
              )}
            </div>
          </div>

          {/* PRIVACY */}
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
                    showToast(value ? "🌍 Público" : "🔒 Privado");
                  } catch (err) {
                    console.error(err);
                  }
                }}
              />
              <span className="checkbox-text">
                {editIsPublic ? "🌍 Público" : "🔒 Privado"}
              </span>
            </label>
          </div>
        </div>

        {/* SUGERENCIAS */}
        {trip?.id && isEditing && (
          <TripSuggestions
            mood={editMood}
            onSelectDestination={(place) => {
              setEditDestination(place.destination);
              setSelectedImage(place.image);
              setTrip((prev) => ({ ...prev, destination: place.destination }));
              showToast("📍 Destino actualizado");
            }}
          />

        )}
      </form>

      {/* GALERÍA */}
      <div className="td-gallery-section">
        <h3>📷 Galería multimedia</h3>

        <div className="td-photo-grid">
          {trip.photos?.length ? (
            trip.photos
              .filter((p) => p && p.image)
              .map((p) => {
                console.log("PHOTO:", p);
                console.log("IMAGE:", p.image);
                console.log("FINAL URL:", (p.image));
                console.log("TRIP PHOTOS RAW:", trip.photos);

                return (
                  <div key={p.id} className="td-photo-item">
                    <img
                      src={getMediaUrl(p.image)}
                      className="td-gallery-image"
                      alt="Recuerdo"
                    />

                    <button
                      type="button"
                      className="td-photo-delete-btn"
                      onClick={() => setPhotoToDelete(p.id)}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
          ) : (
            <p className="td-empty-gallery-msg">Aún no hay fotos.</p>
          )}
        </div>

        <button
          type="button"
          className="td-upload-trigger-btn2"
          onClick={() => {
            if (!trip || !trip.id) {
              showToast("⏳ Cargando viaje...");
              return;
            }
            setShowUpload(true);
          }}
        >
          📸 Subir foto
        </button>
      </div>

      {/* PUBLICAR AVENTURA */}
      {trip.is_public && !trip.is_published && !isEditing && (
        <div className="td-publish-wrapper">
          <button
            type="button"
            className="td-publish-btn"
            onClick={async () => {
              try {
                await API.patch(`/trips/${trip.id}/`, { is_published: true });
                setTrip((prev) => ({ ...prev, is_published: true }));
                showToast("🚀 Aventura publicada en el feed");
                navigate("/home");
              } catch (err) {
                console.error(err);
                showToast("❌ No se pudo publicar la aventura");
              }
            }}
          >
            🚀 Publicar aventura
          </button>
        </div>
      )}

      {/* MODALES */}
      {showCompanionsModal && (
        <CompanionsModal
          friends={friends}
          onClose={() => setShowCompanionsModal(false)}
          onSelect={async (f) => {
            try {
              const invite = await sendInvite(f.id);

              setSelectedFriend(f);

              setSentInvites((prev) => [...prev, invite]); // 🔥 CLAVE


              showToast(`📨 Invitación enviada a @${f.username}`);

              setShowCompanionsModal(false);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

      {showUpload && trip?.id && (
        <TripPhotoUpload
          tripId={trip.id}
          currentPhotos={trip.photos || []}
          onUploaded={(newPhoto) => {
            setTrip((prev) => ({
              ...prev,
              photos: [...(prev.photos || []), newPhoto].filter(Boolean),
            }));
            setShowUpload(false);
          }}
        />
      )}

      {showDeleteModal && (
        <div className="td-modal-overlay">
          <div className="td-modal-card">
            <h3>⚠️ ¿Eliminar aventura?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="td-modal-actions">
              <button
                className="td-modal-btn-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                className="td-modal-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {photoToDelete && (
        <div className="td-modal-overlay">
          <div className="td-modal-card">
            <h3>🗑️ ¿Eliminar esta foto?</h3>
            <p>Esta acción no se puede deshacer.</p>

            <div className="td-modal-actions">
              <button
                className="td-modal-btn-confirm"
                onClick={() => {
                  deletePhoto(photoToDelete);
                  setPhotoToDelete(null);
                }}
              >
                Sí, eliminar
              </button>

              <button
                className="td-modal-btn-cancel"
                onClick={() => setPhotoToDelete(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
