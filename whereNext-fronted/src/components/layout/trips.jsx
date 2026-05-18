import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import "../../styles/trips.css"; 

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await API.get(`/trips/${id}/`);
        setTrip(response.data);
      } catch (error) {
        console.error("Error cargando el viaje:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) return <p>Cargando viaje...</p>;
  if (!trip) return <p>No se encontró el viaje.</p>;

  return (
    <div className="trip-details-container">
      <h1>{trip.name}</h1>
      <p>{trip.description}</p>

      <h3>Lugares en este viaje</h3>

      {trip.places?.length > 0 ? (
        trip.places.map((place) => (
          <div key={place.id} className="trip-place-card">
            <h4>{place.name}</h4>
            <p>{place.country}</p>
          </div>
        ))
      ) : (
        <p>No hay lugares añadidos todavía.</p>
      )}
    </div>
  );
}
