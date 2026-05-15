import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Notification from "./components/Notification";
import TripForm from "./components/TripForm";
import TripCard from "./components/TripCard";
import { useTrips } from "./hooks/useTrips";


function App() {
  // 🔐 Token (sincrónizado correctamente)
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  // 🔎 UI state
  const [notification, setNotification] = useState("");
  const [search, setSearch] = useState("");

  // 🧠 Trips hook (depende del token)
  const {
    trips,
    createTrip,
    deleteTrip,
    updateTrip,
  } = useTrips(token);

  // 🔔 Notificaciones
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  // 🔒 Si no hay login → Auth
  if (!token) {
    return <Auth setToken={setToken} />;
  }

  return (
    <div className="app-container">

      {/* NAVBAR */}
      <Navbar setToken={setToken} />

      {/* SEARCH */}
      <input
        className="search-input"
        placeholder="🔎 Buscar viajes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* NOTIFICACIONES */}
      {notification && (
        <Notification message={notification} />
      )}

      {/* FORMULARIO */}
      <TripForm
        onCreate={async (trip) => {
          await createTrip(trip);
          showNotification("✔ Viaje creado correctamente");
        }}
      />

      {/* LISTA */}
      <div className="trip-grid">

        {trips
          .filter((t) => {
            const title = (t.title ?? "").toLowerCase();
            const destination = (t.destination ?? "").toLowerCase();
            const query = search.toLowerCase();

            return (
              title.includes(query) ||
              destination.includes(query)
            );
          })
          .map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={async () => {
                await deleteTrip(trip.id);
                showNotification("🗑 Viaje eliminado");
              }}
              onUpdate={updateTrip}
            />
          ))}

      </div>

    </div>
  );
}

export default App;