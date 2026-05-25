import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/Feed.css";

export default function Feed() {

  const [trips, setTrips] = useState([]);

  useEffect(() => {

    API.get("feed/")
      .then(res => setTrips(res.data));

  }, []);

  return (

    <div className="feed-container">

      {trips.map(trip => (

        <div key={trip.id} className="feed-card">

          {/* HEADER USER */}
          <div className="feed-user">

            <img
              src={trip.owner.avatar || "https://via.placeholder.com/40"}
              className="feed-avatar"
            />

            <div>

              <strong>
                {trip.owner.username}
              </strong>

              <p className="feed-meta">
                {trip.created_at}
              </p>

            </div>

          </div>

          {/* CONTENT */}
          <div className="feed-content">

            <h3>{trip.title}</h3>

            <p>{trip.description}</p>

          </div>

          {/* ACTIONS */}
          <div className="feed-actions">

            <button>
              👤 Ver perfil
            </button>

            <button>
              🤝 Añadir compañero
            </button>

          </div>

        </div>

      ))}

    </div>

  );
}