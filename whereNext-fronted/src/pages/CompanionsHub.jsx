import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "/src/styles/companionsHub.css";

export default function companionsHub() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // 🚀 ESTADO DEL MODAL DE AVISOS PREMIUM
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    text: "",
    onConfirm: null,
  });

  const fetchConnections = async () => {
    try {
      setLoading(true);

      // 🔥 RUTA CORRECTA
      const res = await API.get("companions/hub/");

      setFriends(res.data || []);
    } catch (err) {
      console.error("Error al cargar el directorio social:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // 🗑️ DISPARADOR CRUD DELETE
  const openDeleteModal = (rowId, username) => {
    setModalConfig({
      isOpen: true,
      title: "⚠️ ¿Eliminar compañero?",
      text: `Estás a punto de remover a @${username} de tu círculo de amigos. Perderás el acceso directo a sus bitácoras privadas.`,
      onConfirm: () => executeDeleteFriend(rowId),
    });
  };

  const executeDeleteFriend = async (rowId) => {
    setActionId(rowId);
    closeCustomModal();
    try {
      // 🔥 RUTA CORRECTA
      await API.delete(`companions/hub/${rowId}/`);

      setFriends((prev) => prev.filter((f) => f.companion_row_id !== rowId));
    } catch (err) {
      console.error("Error al eliminar fila:", err);
    } finally {
      setActionId(null);
    }
  };

  // 🚫 DISPARADOR CRUD BLOCK
  const openBlockModal = (rowId, username) => {
    setModalConfig({
      isOpen: true,
      title: "🚫 ¿Bloquear explorador?",
      text: `¿Seguro que deseas bloquear a @${username}? Esta acción restringirá de forma permanente el envío de mensajes y comentarios mudos.`,
      onConfirm: () => executeBlockFriend(rowId),
    });
  };

  const executeBlockFriend = async (rowId) => {
    setActionId(rowId);
    closeCustomModal();
    try {
      // 🔥 RUTA CORRECTA
      await API.patch(`companions/hub/${rowId}/`, { action: "BLOCK" });

      setFriends((prev) => prev.filter((f) => f.companion_row_id !== rowId));
    } catch (err) {
      console.error("Error al transmitir bloqueo:", err);
    } finally {
      setActionId(null);
    }
  };

  const closeCustomModal = () => {
    setModalConfig({ isOpen: false, title: "", text: "", onConfirm: null });
  };

  const handleSendMessage = (friendId) => {
    navigate(`/chats/${friendId}`);
  };

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    return path.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
  };

  if (loading) {
    return (
      <div className="hub-centered-container">
        <div className="hub-spinner"></div>
        <p className="hub-loading-text">Sincronizando coordenadas de tu círculo social...</p>
      </div>
    );
  }

  return (
    <div className="hub-layout-view">
      
      {/* HEADER PANEL */}
      <div className="hub-glass-card hub-header-card">
        <div className="hub-topbar-badge">
          <span>👥 CENTRAL SOCIAL</span>
          <span className="hub-status-indicator">SEGURA</span>
        </div>
        
        <h1>Centro de Gestión Social</h1>
        <p className="hub-subtitle">
          Administra tus conexiones activas en WhereNext. Puedes chatear, revocar accesos de amistad o bloquear cuentas de forma permanente.
        </p>
        
        <button type="button" className="hub-btn-back" onClick={() => navigate("/profile")}>
          ← Volver a mi Perfil
        </button>
      </div>

      {/* REJILLA DE AMIGOS */}
      <div className="hub-glass-card hub-list-card">
        <div className="hub-list-header">
          <h3>🤝 Tus compañeros aprobados ({friends.length})</h3>
        </div>

        <div className="hub-directory-stack">
          {friends.length === 0 ? (
            <div className="hub-empty-state">
              <span className="hub-empty-icon">🎒</span>
              <p>Tu círculo de viaje está vacío de momento.</p>
              <button type="button" className="hub-btn-action hub-btn-message" onClick={() => navigate("/explore")}>
                Explorar Viajeros
              </button>
            </div>
          ) : (
            friends.map((f) => (
              <div key={f.id} className="hub-user-row">
                
                <div className="hub-user-profile">
                  <div className="hub-avatar-wrapper">
                    <img src={getMediaUrl(f.avatar)} className="hub-user-avatar" alt="avatar" />
                  </div>
                  <div className="hub-user-metadata">
                    <strong className="hub-user-username">@{f.username}</strong>
                    <p className="hub-user-bio">{f.bio || "Explorador listo para conectar en WhereNext"}</p>
                  </div>
                </div>

                <div className="hub-action-control-bar">
                  <button 
                    type="button" 
                    className="hub-btn-action hub-btn-message"
                    disabled={actionId === f.companion_row_id} 
                    onClick={() => handleSendMessage(f.id)}
                  >
                    💬 Mensaje
                  </button>
                  
                  <button 
                    type="button" 
                    className="hub-btn-action hub-btn-delete"
                    disabled={actionId === f.companion_row_id} 
                    onClick={() => openDeleteModal(f.companion_row_id, f.username)}
                  >
                    🗑️ Eliminar
                  </button>
                  
                  <button 
                    type="button" 
                    className="hub-btn-action hub-btn-block"
                    disabled={actionId === f.companion_row_id} 
                    onClick={() => openBlockModal(f.companion_row_id, f.username)}
                  >
                    🚫 Bloquear
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalConfig.isOpen && (
        <div className="td-modal-overlay">
          <div className="td-modal-card">
            <h3>{modalConfig.title}</h3>
            <p className="td-modal-text">{modalConfig.text}</p>
            <div className="td-modal-actions">
              <button type="button" className="td-modal-btn-confirm" onClick={modalConfig.onConfirm}>
                Confirmar
              </button>
              <button type="button" className="td-modal-btn-cancel" onClick={closeCustomModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
