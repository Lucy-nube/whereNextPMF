import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Profile.css"; // Comparte tus variables base translúcidas

export default function CompanionsHub() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga las relaciones autorizadas del hub
  const fetchConnections = async () => {
    try {
      const res = await API.get("/companions/hub/");
      setFriends(res.data);
    } catch (err) {
      console.error("Error reading relationship directory indices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // 🗑️ ACCIÓN CRUD: Eliminar amigo por completo de la base de datos
  const handleDeleteFriend = async (rowId, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a @${name} de tus amigos?`)) return;
    try {
      await API.delete(`/companions/hub/${rowId}/`);
      // Filtramos usando la propiedad de ID de la fila relacional enviada por Django
      setFriends((prev) => prev.filter((f) => f.companion_row_id !== rowId));
    } catch (err) {
      console.error("Error al eliminar compañero:", err);
    }
  };

  // 🚫 ACCIÓN PRIVACIDAD: Cambiar el estado a DECLINED para bloquear al usuario
  const handleBlockFriend = async (rowId, name) => {
    if (!window.confirm(`¿Seguro que deseas bloquear a @${name}? Ya no verás sus bitácoras.`)) return;
    try {
      await API.patch(`/companions/hub/${rowId}/`, { action: "BLOCK" });
      setFriends((prev) => prev.filter((f) => f.companion_row_id !== rowId));
    } catch (err) {
      console.error("Error al bloquear compañero:", err);
    }
  };

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    return path.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <p>⏳ Cargando lista de compañeros...</p>
      </div>
    );
  }

  return (
    <div className="passport-profile">
      
      {/* TARJETA DE CABECERA CONTROL DE MANDO */}
      <div className="passport-card">
        <div className="passport-topbar">
          <span>👥 CENTRAL DE PRIVACIDAD</span>
          <span className="passport-status">SEGURA</span>
        </div>
        
        <h3>Centro de Gestión Social</h3>
        <p className="passport-bio">Administra tus conexiones activas en WhereNext, elimina cuentas o bloquea accesos de forma definitiva.</p>
        
        <button className="profile-add-trip-btn" onClick={() => navigate("/profile")}>
          ← Volver a mi Perfil
        </button>
      </div>

      {/* LISTADO DE TARJETAS DE CONEXIONES REDISEÑADO */}
      <div className="passport-card">
        <h3>🤝 Tus conexiones activas ({friends.length})</h3>
        
        <div className="hub-friends-list">
          {friends.length === 0 ? (
            <p className="empty-stamps-text">Aún no tienes compañeros agregados en tu círculo.</p>
          ) : (
            friends.map((f) => (
              <div key={f.id} className="hub-friend-row">
                
                {/* LADO IZQUIERDO: INFORMACIÓN INTEGRADA */}
                <div className="hub-friend-profile">
                  <img 
                    src={getMediaUrl(f.avatar)} 
                    className="hub-friend-avatar" 
                    alt="avatar" 
                  />
                  <div>
                    <strong className="hub-friend-name">@{f.username}</strong>
                    <p className="hub-friend-bio">{f.bio || "Viajero de WhereNext"}</p>
                  </div>
                </div>

                {/* LADO DERECHO: PANEL DE ACCIONES EXCLUSIVAS */}
                <div className="hub-friend-actions">
                  <button 
                    type="button"
                    className="hub-btn-action hub-btn-delete" 
                    onClick={() => handleDeleteFriend(f.companion_row_id, f.username)}
                  >
                    🗑️ Eliminar
                  </button>
                  <button 
                    type="button"
                    className="hub-btn-action hub-btn-block" 
                    onClick={() => handleBlockFriend(f.companion_row_id, f.username)}
                  >
                    🚫 Bloquear
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
