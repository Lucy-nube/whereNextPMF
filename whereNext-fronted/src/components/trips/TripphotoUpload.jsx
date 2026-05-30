import { useState } from "react";
import API from "../../services/api";
import "../../styles/TripDetails.css"

export default function TripPhotoUpload({ tripId, onUploaded }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Por favor, selecciona una imagen primero.");
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

    } catch (err) {
      console.error("Error al subir la fotografía:", err);
      alert("Hubo un fallo al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="tpu-container">
      <form className="tpu-form" onSubmit={handleSubmit}>
        <h3>📸 Añadir recuerdo al pasaporte</h3>

        <div className="tpu-file-group">
          <label htmlFor="tpu-file-input" className="tpu-file-label">
            {image ? `📎 Cargado: ${image.name.substring(0, 20)}...` : "📁 Seleccionar archivo multimedia"}
          </label>
          <input
            id="tpu-file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            style={{ display: "none" }}
          />
        </div>

        <input
          className="td-edit-input"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Escribe un pie de foto o recuerdo..."
        />

        <button 
          type="submit" 
          className="td-upload-trigger-btn"
          disabled={isUploading || !image}
        >
          {isUploading ? "Subiendo captura..." : "🚀 Publicar en Galería"}
        </button>
      </form>
    </div>
  );
}
