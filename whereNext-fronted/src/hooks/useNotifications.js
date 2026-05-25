import { useEffect, useState } from "react";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      const res = await fetch(
        `http://localhost:8000/api/notifications/?user=${userId}`
      );
      const data = await res.json();
      setNotifications(data);
    }, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  return notifications;
}