import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Invites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  // ============================
  // USUARIO ACTUAL
  // ============================
  const loadCurrentUser = async () => {
    try {
      const res = await API.get("/users/me/");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Error cargando usuario:", err);
    }
  };

  // ============================
  // INVITACIONES
  // ============================
  const loadInvites = async () => {
    try {
      const res = await API.get("/invites/trip-invites/");
      setInvites(res.data);
    } catch (err) {
      console.error("Error cargando invitaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // ACCIONES
  // ============================
  const acceptInvite = async (invite) => {
    try {
      const res = await API.post(`/invites/trip-invites/${invite.id}/accept/`);
      const { invite: updatedInvite, trip } = res.data;

      // 1. Actualizar la invitación en pantalla
      setInvites(prev =>
        prev.map(i => (i.id === updatedInvite.id ? updatedInvite : i))
      );

      // 2. Redirigir al viaje actualizado
      navigate(`/trips/${trip.id}?refresh=${Date.now()}`);

    } catch (err) {
      console.error("Error aceptando:", err);
    }
  };


  const declineInvite = async (id) => {
    try {
      await API.post(`/invites/trip-invites/${id}/decline/`);
      loadInvites();
    } catch (err) {
      console.error("Error rechazando:", err);
    }
  };

  const cancelInvite = async (id) => {
    try {
      await API.post(`/invites/trip-invites/${id}/cancel/`);
      loadInvites();
    } catch (err) {
      console.error("Error cancelando:", err);
    }
  };

  // ============================
  // BORRAR TODAS LAS INVITACIONES (VISUAL)
  // ============================
  const deleteAllFromSection = (ids) => {
    setInvites((prev) => prev.filter((inv) => !ids.includes(inv.id)));
  };

  // ============================
  // INIT
  // ============================
  useEffect(() => {
    loadCurrentUser();
    loadInvites();
  }, []);

  if (!currentUser) return <p>Cargando usuario...</p>;
  if (loading) return <p>Cargando invitaciones...</p>;

  // ============================
  // FILTROS
  // ============================
  const sent = invites.filter((i) => i.from_user.id === currentUser.id);
  const received = invites.filter((i) => i.to_user.id === currentUser.id);

  const sentPending = sent.filter((i) => i.status === "PENDING");
  const sentAccepted = sent.filter((i) => i.status === "ACCEPTED");
  const sentDeclined = sent.filter((i) => i.status === "DECLINED");

  const receivedPending = received.filter((i) => i.status === "PENDING");
  const receivedAccepted = received.filter((i) => i.status === "ACCEPTED");
  const receivedDeclined = received.filter((i) => i.status === "DECLINED");

  return (
    <div className="invites-container">

      <h1>✉️ Invitaciones</h1>

      {/* =========================
          RECIBIDAS PENDIENTES
      ========================= */}
      <section>
        <div className="section-header">
          <h2>📥 Recibidas (pendientes)</h2>

          <button className="clear-btn"
            onClick={() =>
              deleteAllFromSection(receivedPending.map((i) => i.id))
            }
          >
            🗑️ Borrar todas
          </button>
        </div>

        {receivedPending.length === 0 && (
          <p>No tienes invitaciones pendientes.</p>
        )}

        {receivedPending.map((inv) => (
          <div key={inv.id} className="invite-card">
            <p>
              <strong>{inv.from_user.username}</strong> te invitó a{" "}
              <strong>{inv.trip.title}</strong>
            </p>

            <button onClick={() => acceptInvite(inv)}>Aceptar</button>
            <button onClick={() => declineInvite(inv.id)}>Rechazar</button>
          </div>
        ))}
      </section>

      {/* =========================
          ENVIADAS PENDIENTES
      ========================= */}
      <section>
        <div className="section-header">
          <h2>📤 Enviadas (pendientes)</h2>

          <button className="clear-btn"
            onClick={() =>
              deleteAllFromSection(sentPending.map((i) => i.id))
            }
          >
            🗑️ Borrar todas
          </button>
        </div>

        {sentPending.length === 0 && (
          <p>No has enviado invitaciones pendientes.</p>
        )}

        {sentPending.map((inv) => (
          <div key={inv.id} className="invite-card">
            <p>
              Invitaste a <strong>{inv.to_user.username}</strong> a{" "}
              <strong>{inv.trip.title}</strong>
            </p>

            <button onClick={() => cancelInvite(inv.id)}>
              Cancelar
            </button>
          </div>
        ))}
      </section>

      {/* =========================
          ACEPTADAS
      ========================= */}
      <section>
        <div className="section-header">
          <h2>✔ Aceptadas</h2>

          <button className="clear-btn"
            onClick={() =>
              deleteAllFromSection([
                ...sentAccepted.map((i) => i.id),
                ...receivedAccepted.map((i) => i.id),
              ])
            }
          >
            🗑️ Borrar todas
          </button>
        </div>

        {sentAccepted.map((inv) => (
          <div key={inv.id} className="invite-card accepted">
            <p>
              <strong>{inv.to_user.username}</strong> aceptó tu invitación a{" "}
              <strong>{inv.trip.title}</strong>
            </p>
          </div>
        ))}

        {receivedAccepted.map((inv) => (
          <div key={inv.id} className="invite-card accepted">
            <p>
              Aceptaste la invitación de{" "}
              <strong>{inv.from_user.username}</strong> a{" "}
              <strong>{inv.trip.title}</strong>
            </p>

            {/* ⭐ BOTÓN PARA IR AL VIAJE ⭐ */}
            <button
              className="td-primary-btn"
              onClick={() => navigate(`/trips/${inv.trip.id}`)}
            >
              Ver viaje
            </button>
          </div>
        ))}
      </section>

      {/* =========================
          RECHAZADAS
      ========================= */}
      <section>
        <div className="section-header">
          <h2>❌ Rechazadas</h2>

          <button className="clear-btn"
            onClick={() =>
              deleteAllFromSection([
                ...sentDeclined.map((i) => i.id),
                ...receivedDeclined.map((i) => i.id),
              ])
            }
          >
            🗑️ Borrar todas
          </button>
        </div>

        {sentDeclined.map((inv) => (
          <div key={inv.id} className="invite-card declined">
            <p>
              <strong>{inv.to_user.username}</strong> rechazó tu invitación a{" "}
              <strong>{inv.trip.title}</strong>
            </p>
          </div>
        ))}

        {receivedDeclined.map((inv) => (
          <div key={inv.id} className="invite-card declined">
            <p>
              Rechazaste la invitación de{" "}
              <strong>{inv.from_user.username}</strong> a{" "}
              <strong>{inv.trip.title}</strong>
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}