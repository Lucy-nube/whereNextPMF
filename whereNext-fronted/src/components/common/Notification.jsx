import { useEffect, useState } from "react";
import API from "../services/api";
import useModal from "../hooks/useModal";
import CustomModal from "../components/common/CustomModal";
import "../styles/notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { modalConfig, openModal, closeModal } = useModal();

  const loadNotifications = async () => {
    try {
      const res = await API.get("social/notifications/");
      console.log("🔍 Notificaciones crudas:", res.data);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`social/notifications/${id}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error marcando como leída:", err);
    }
  };

  const handleMarkAllConfirm = () => {
    openModal({
      title: "🔔 ¿Marcar todo como leído?",
      text: "Esta acción no se puede deshacer.",
      confirmText: "Sí, marcar todas",
      onConfirm: async () => {
        try {
          await API.post("social/notifications/read_all/");
          setNotifications([]);
          closeModal();
        } catch (err) {
          console.error("Error marcando todas:", err);
        }
      },
    });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading)
    return (
      <p className="notif-loading">
        ⏳ Sincronizando brújula y casillero de alertas...
      </p>
    );

  return (
    <div className="notif-page">
      <div className="notif-header">
        <h2>🔔 Tus Notificaciones Recientes</h2>
        {notifications.length > 0 && (
          <button
            type="button"
            className="notif-markall"
            onClick={handleMarkAllConfirm}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notif-empty-box">
          <span className="notif-empty-icon">🏖️</span>
          <p className="notif-empty">
            Tu bitácora de alertas está limpia de momento. ¡Rumbo libre!
          </p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => {
            const type = String(n.notification_type || "").toUpperCase();

            return (
              <div key={n.id} className="notif-item">
                <div className="notif-info">
                  {/* ❤️ LIKE */}
                  {type === "LIKE" && (
                    <p>
                      ❤️ <strong>@{n.from_user?.username}</strong> le dio me gusta a tu
                      viaje <em>"{n.trip_title}"</em>
                    </p>
                  )}

                  {/* 💬 COMMENT */}
                  {type === "COMMENT" && (
                    <p>
                      💬 <strong>@{n.from_user?.username}</strong> comentó: "
                      {n.text_preview}" en tu viaje{" "}
                      <em>"{n.trip_title}"</em>
                    </p>
                  )}

                  {/* 👥 FRIEND REQUEST */}
                  {type === "FRIEND_REQUEST" && (
                    <p>
                      👥 <strong>@{n.from_user?.username}</strong> quiere ser tu
                      compañer@
                    </p>
                  )}

                  {/* 🤝 FRIEND REQUEST ACCEPTED */}
                  {type === "FRIEND_REQUEST_ACCEPTED" && (
                    <p>
                      🤝 <strong>@{n.from_user?.username}</strong> aceptó tu solicitud de
                      amistad
                    </p>
                  )}

                  {/* 🚫 FRIEND REQUEST REJECTED */}
                  {type === "FRIEND_REQUEST_REJECTED" && (
                    <p>
                      🚫 <strong>@{n.from_user?.username}</strong> rechazó tu solicitud de
                      amistad
                    </p>
                  )}

                  {/* ✈️ TRIP INVITE */}
                  {type === "TRIP_INVITE" && (
                    <p>
                      ✈️ <strong>@{n.from_user?.username}</strong> te invitó a un viaje
                    </p>
                  )}

                  {/* ✅ INVITE ACCEPTED */}
                  {type === "INVITE_ACCEPTED" && (
                    <p>
                      ✅ <strong>@{n.from_user?.username}</strong> aceptó tu invitación al
                      viaje
                    </p>
                  )}

                  {/* ❌ INVITE DECLINED */}
                  {type === "INVITE_DECLINED" && (
                    <p>
                      ❌ <strong>@{n.from_user?.username}</strong> rechazó tu invitación
                      al viaje
                    </p>
                  )}

                  {/* 🔔 FALLBACK */}
                  {![
                    "LIKE",
                    "COMMENT",
                    "FRIEND_REQUEST",
                    "FRIEND_REQUEST_ACCEPTED",
                    "FRIEND_REQUEST_REJECTED",
                    "TRIP_INVITE",
                    "INVITE_ACCEPTED",
                    "INVITE_DECLINED",
                  ].includes(type) && (
                    <p>🔔 {n.text_preview || "Nueva alerta recibida"}</p>
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
