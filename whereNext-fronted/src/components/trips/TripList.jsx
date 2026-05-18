import TripCard from "./TripCard";
import "../../styles/trips.css";


function TripList({ trips, onDelete, onUpdate }) {
    if (trips.length === 0) {
  return <p>No tienes viajes todavía ✈️</p>;
 }
  return (
    <div className="trip-grid">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default TripList;