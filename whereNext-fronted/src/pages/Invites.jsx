import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/invites.css";

export default function Invites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInvites = async () => {
    try {
      // Obtener mi usuario
      const me = await API.get("me/");
      const myId = me.data.id;

      // Obtener todas las invitaciones
      const res = await API.get("trip-invites/");

      // Filtrar solo las invitaciones recibidas
      const received = res.data.filter((i) => i.to_user.id === myId);

      setInvites(received);
    } catch (err) {
      console.error("Error cargando invites:", err);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (id) => {
    await API.post(`trip-invites/${id}/accept/`);
    loadInvites();
  };

  const declineInvite = async (id) => {
    await API.post(`trip-invites/${id}/decline/`);
    loadInvites();
  };

  useEffect(() => {
    loadInvites();
  }, []);

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
              <strong>{inv.place.name}</strong>
            </p>

            <div className="invite-actions">
              <button onClick={() => acceptInvite(inv.id)} className="invite-accept">
                Aceptar
              </button>
              <button onClick={() => declineInvite(inv.id)} className="invite-decline">
                Rechazar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
