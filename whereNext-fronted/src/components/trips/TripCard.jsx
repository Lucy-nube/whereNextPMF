import "../../styles/trips.css";

function TripCard({ trip, onDelete, onUpdate }) {
  return (
    <div className="trip-card">

      <img
        className="trip-image"
        src={getRandomTravelImage(trip.destination)}
        alt={trip.title}
      />

      <h2>{trip.title}</h2>
      <p>{trip.destination}</p>

      <button onClick={() => {
      onDelete(trip.id);
      setNotification("Viaje eliminado");
      }}>
      Eliminar
      </button>

    </div>
  );
}

export default TripCard;