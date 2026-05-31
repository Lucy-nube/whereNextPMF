import { useState } from "react";
import API from "../../services/api";
import "../../styles/TripDetails.css";

export default function TripPhotoUpload({ tripId, onUploaded, currentPhotos = [] }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentPhotos.length >= 5) {
      showToast("📸 Solo puedes subir hasta 5 fotos por viaje.");
      return;
    }

    if (!image) {
      showToast("Selecciona una imagen primero.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    try {
      const res = await API.post(`/trips/${tripId}/photos/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setImage(null);
      setCaption("");

      if (onUploaded) onUploaded(res.data);

      showToast("📸 Foto subida correctamente");

    } catch (err) {
      console.error("Error al subir la fotografía:", err);
      showToast("❌ Hubo un fallo al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* OVERLAY */}
      <div className="tpu-overlay"></div>

      {/* MODAL */}
      <div className="tpu-container">

        {/* TOAST */}
        {toastMessage && (
          <div className="td-toast-notification">
            {toastMessage}
          </div>
        )}

        <form className="tpu-form" onSubmit={handleSubmit}>
          <h3>📸 Añadir recuerdo al pasaporte</h3>

          {/* LÍMITE */}
          {currentPhotos.length >= 5 && (
            <p className="limit-warning">
              📸 Límite alcanzado: solo puedes subir 5 fotos por viaje.
            </p>
          )}

          {/* INPUT FILE */}
          <div className="tpu-file-group">
            <label htmlFor="tpu-file-input" className="tpu-file-label">
              {image
                ? `📎 Cargado: ${image.name.substring(0, 20)}...`
                : "📁 Seleccionar archivo multimedia"}
            </label>

            <input
              id="tpu-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImage(file);
                setPreviewUrl(URL.createObjectURL(file));
              }}
              style={{ display: "none" }}
            />
          </div>

          {/* CAPTION */}
          <input
            className="td-edit-input"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escribe un pie de foto o recuerdo..."
          />

          {/* PREVIEW */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              className="tpu-preview-image"
            />
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            className="td-upload-trigger-btn"
            disabled={!image || isUploading || currentPhotos.length >= 5}
          >
            {!image
              ? "Selecciona una imagen…"
              : isUploading
                ? "Subiendo captura..."
                : "🚀 Publicar en Galería"}
          </button>

        </form>
      </div>
    </>
  );
}
