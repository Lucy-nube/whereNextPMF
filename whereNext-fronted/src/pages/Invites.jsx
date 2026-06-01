import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/invites.css";

export default function Invites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // =========================
  // CARGAR INVITACIONES
  // =========================
  const loadInvites = async () => {
    try {
      const res = await API.get("invites/trip-invites/");

      // ✔ backend ya filtra por usuario (to_user)
      setInvites(res.data);
    } catch (err) {
      console.error("Error cargando invites:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ACEPTAR INVITACIÓN
  // =========================
  const acceptInvite = async (invite) => {
    try {
      await API.post(`invites/trip-invites/${invite.id}/accept/`);

      navigate(`/trips/${invite.trip.id}`);

    } catch (err) {
      console.error("Error aceptando invitación:", err);
    }
  };

  // =========================
  // RECHAZAR INVITACIÓN
  // =========================
  const declineInvite = async (id) => {
    try {
      await API.post(`invites/trip-invites/${id}/decline/`);

      // refrescar lista
      loadInvites();

      // (opcional) refrescar notificaciones globales
      // await fetchNotifications();
    } catch (err) {
      console.error("Error rechazando invitación:", err);
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    loadInvites();
  }, []);

  // =========================
  // UI
  // =========================
  if (loading) return <p>Cargando invitaciones...</p>;

  return (
    <div className="invites-page">
      <h2>✈️ Invitaciones recibidas</h2>

      {invites.length === 0 ? (
        <p>No tienes invitaciones.</p>
      ) : (
        invites.map((inv) => (
          <div key={inv.id} className="invite-item">
            <p>
              <strong>@{inv.from_user.username}</strong> te invitó a{" "}
              <strong>{inv.trip.title}</strong>
            </p>

            <div className="invite-actions">
              <button
                onClick={() => acceptInvite(inv)}
                className="invite-accept"
              >
                Aceptar
              </button>

              <button
                onClick={() => declineInvite(inv.id)}
                className="invite-decline"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}