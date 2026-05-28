import { useEffect, useState } from "react";
import API from "../services/api";
import useModal from "../hooks/useModal";
import CustomModal from "../components/common/CustomModal";
import "../styles/notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 HOOK LINKAGE: Injects your premium glassmorphic alert manager natively
  const { modalConfig, openModal, closeModal } = useModal();

  const loadNotifications = async () => {
    try {
      const res = await API.get("social/notifications/");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Aligns character-for-character with your backend single PATCH read handler
      await API.patch(`social/notifications/${id}/`);
      // Update state locally inside the array without triggering a heavy fetch request reload loop
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error marcando como leída:", err);
    }
  };

  // 🚀 TRIGGER PREMIUM ALERT: Replaces native confirmators with your custom layout node
  const handleMarkAllConfirm = () => {
    openModal({
      title: "🔔 ¿Marcar todo como leído?",
      text: "Estás a punto de vaciar por completo tu casillero de alertas de interacciones recientes. Esta acción no se puede deshacer.",
      confirmText: "Sí, marcar todas",
      onConfirm: async () => {
        try {
          // Hits your database clear-all endpoint rules safely
          await API.post("social/notifications/read_all/");
          setNotifications([]);
          closeModal(); // Collapses custom modal layout smoothly upon success
        } catch (err) {
          console.error("Error marcando todas:", err);
        }
      },
    });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) return <p className="notif-loading">⏳ Sincronizando brújula y casillero de alertas...</p>;

  return (
    <div className="notif-page">
      
      {/* HEADER CONTROL CONTAINER */}
      <div className="notif-header">
        <h2>🔔 Tus Notificaciones Recientes</h2>
        {notifications.length > 0 && (
          <button type="button" className="notif-markall" onClick={handleMarkAllConfirm}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* ALERTS MATRIX RENDERING ITERATOR LIST */}
      {notifications.length === 0 ? (
        <div className="notif-empty-box">
          <span className="notif-empty-icon">🏖️</span>
          <p className="notif-empty">Tu bitácora de alertas está limpia de momento. ¡Rumbo libre!</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => {
            const currentType = String(n.type || "").toUpperCase();

            return (
              <div key={n.id} className="notif-item">
                <div className="notif-info">
                  
                  {/* METADATA RENDER ENGINE CONDITIONALS MATCHING YOUR NAVBAR LOOKUPS */}
                  {currentType === "LIKE" && (
                    <p>❤️ <strong>@{n.from_user}</strong> le dio me gusta a tu viaje <em>"{n.trip_title}"</em></p>
                  )}
                  
                  {currentType === "COMMENT" && (
                    <p>💬 <strong>@{n.from_user}</strong> comentó: "{n.text_preview}..." en tu viaje <em>"{n.trip_title}"</em></p>
                  )}
                  
                  {currentType === "COMPANION" && (
                    <p>👥 <strong>@{n.from_user}</strong> te ha enviado una solicitud para conectar compañeros</p>
                  )}

                  {!["LIKE", "COMMENT", "COMPANION"].includes(currentType) && (
                    <p>🔔 {n.text || "Nueva alerta recibida"}</p>
                  )}

                  <small className="notif-time-stamp">
                    Hace un momento • #{n.id}
                  </small>
                </div>

                <button
                  type="button"
                  className="notif-read-btn"
                  onClick={() => markAsRead(n.id)}
                >
                  ✓ Descartar
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
         🚀 PLUG-AND-PLAY TARGET INDEPENDENT: Central alert modal injection layer
         ========================================================================= */}
      <CustomModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        text={modalConfig.text}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
      />

    </div>
  );
}
