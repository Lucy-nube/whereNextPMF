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
    formData.append("trip", tripId);
    formData.append("image", image);
    formData.append("caption", caption);

    try {
      await API.post(`/trips/${tripId}/photos/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setImage(null);
      setCaption("");
      if (onUploaded) onUploaded();
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
        <p className="tpu-subtitle">Sube una fotografía de tu destino para completar tu bitácora.</p>

        {/* INPUT MULTIMEDIA INTERACTIVO */}
        <div className="tpu-file-group">
          <label htmlFor="tpu-file-input" className="tpu-file-label">
            {image ? `📎 Cargado: ${image.name.substring(0, 20)}...` : "📁 Seleccionar archivo multimedia"}
          </label>
          <input
            id="tpu-file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])} // 🚀 Corregido a files[0] para capturar el archivo binario
            style={{ display: "none" }} // 🔒 Esto elimina el texto feo en francés nativo del navegador
          />
        </div>

        {/* PIE DE FOTO INTERACTIVO */}
        <div className="tpu-input-group">
          <input
            className="td-edit-input" // Reutiliza tus inputs oscuros de trip details
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escribe un pie de foto o recuerdo..."
          />
        </div>

        <button 
          type="submit" 
          className="td-upload-trigger-btn" 
          disabled={isUploading || !image}
          style={{ width: "100%", justifyContent: "center", marginTop: "12px" }}
        >
          {isUploading ? "Subiendo captura..." : "🚀 Publicar en Galería"}
        </button>
      </form>
    </div>
  );
}
