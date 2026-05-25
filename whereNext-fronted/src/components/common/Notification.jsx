import { useNotifications } from "./useNotifications";

export default function Notifications({ userId }) {
  const notifications = useNotifications(userId);

  return (
    <div>
      <h3>Notificaciones 🔔</h3>

      {notifications.map((n) => (
        <div key={n.id}>
          {n.text}
        </div>
      ))}
    </div>
  );
}