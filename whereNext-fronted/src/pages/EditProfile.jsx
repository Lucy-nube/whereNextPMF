import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getMediaUrl } from "../utils/media";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [bio, setBio] = useState("");
  const { user, setUser } = useAuth();


  // Cargar datos actuales del usuario
  useEffect(() => {
    async function loadUser() {
      const res = await API.get("users/me/");
      setBio(res.data.bio || "");
      setPreview(getMediaUrl(res.data.avatar));
    }
    loadUser();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const formData = new FormData();

    console.log("AVATAR:", avatar);

    formData.append("bio", bio);
    formData.append("avatar", avatar);

    for (let pair of formData.entries()) {
      console.log("FORMDATA ENTRY:", pair[0], pair[1]);
    }

    await API.patch("users/profile/", formData);
  };

  return (
    <div className="edit-profile-page">
      <div className="passport-card edit-profile-card">

        <h1>Editar perfil</h1>

        <div className="avatar-preview">
          <img
            src={preview || "/default-avatar.png"}
            alt="preview"
          />
        </div>

        <label>Foto de perfil</label>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleAvatarChange}
        />


        <label>Biografía</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Cuéntanos algo sobre ti..."
        />

        <button className="btn-primary" onClick={handleSave}>
          Guardar cambios
        </button>

        <button className="btn-secondary" onClick={() => navigate(-1)}>
          Cancelar
        </button>

      </div>
    </div>
  );
}
