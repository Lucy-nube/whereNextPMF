import { Link } from "react-router-dom";
import "../../styles/explore.css";


export default function PlaceCard({ place }) {
  return (
    <div className="place-card">
      <img
        src={place.image}
        alt={place.name}
        className="place-image"
      />

      <div className="place-info">
        <h3>{place.name}</h3>
        <p>{place.country}</p>

        <span className="badge">
          Multitud: {place.crowd_level}
        </span>

        <Link to={`/places/${place.id}`} className="details-btn">
          Ver detalles
        </Link>
      </div>
    </div>
  );
}
