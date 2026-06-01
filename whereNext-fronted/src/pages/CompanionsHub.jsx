import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getMediaUrl } from "../utils/media";
import { useAuth } from "../context/AuthContext";
import "/src/styles/companionsHub.css";

export default function CompanionsHub() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const { user: currentUser } = useAuth();


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

      const res = await API.get("companions/hub/");

      setFriends(res.data.friends || []);
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
      await API.delete(`companions/${rowId}/remove/`);

      setFriends((prev) => prev.filter((f) => f.id !== rowId));
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
      //   RUTA CORRECTA
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

  const handleSendMessage = async (friendId) => {
    try {
      const token = localStorage.getItem("access");

      const res = await API.post(
        `/chats/start/${friendId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const roomId = res.data.room_id;
      navigate(`/chats/${roomId}`);

    } catch (err) {
      if (err.response?.status === 403) {
        showToast("Debes ser compañero para enviar mensajes 🤝");
        return;
      }
      console.error("Error launching chat thread context:", err);
    }
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



            friends.map((f) => {
              const friendObj =
                f.user?.id === currentUser.id ? f.companion : f.user;

              return (
                <div key={f.id} className="hub-user-row">

                  <div className="hub-user-profile">
                    <div className="hub-avatar-wrapper">
                      <img
                        src={getMediaUrl(friendObj.avatar)}
                        className="hub-user-avatar"
                        alt="avatar"
                      />
                    </div>

                    <div className="hub-user-metadata">
                      <strong className="hub-user-username">@{friendObj.username}</strong>
                      <p className="hub-user-bio">
                        {friendObj.bio || "Explorador listo para conectar en WhereNext"}
                      </p>
                    </div>
                  </div>

                  <div className="hub-action-control-bar">
                    <button
                      type="button"
                      className="hub-btn-action hub-btn-message"
                      disabled={actionId === f.id}
                      onClick={() => handleSendMessage(friendObj.id)}
                    >
                      💬 Mensaje
                    </button>

                    <button
                      type="button"
                      className="hub-btn-action hub-btn-delete"
                      disabled={actionId === f.id}
                      onClick={() => openDeleteModal(f.id, friendObj.username)}
                    >
                      🗑️ Eliminar
                    </button>

                    <button
                      type="button"
                      className="hub-btn-action hub-btn-block"
                      disabled={actionId === f.companion_row_id}
                      onClick={() => openBlockModal(f.companion_row_id, friendObj.username)}
                    >
                      🚫 Bloquear
                    </button>
                  </div>

                </div>
              );
            })

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
