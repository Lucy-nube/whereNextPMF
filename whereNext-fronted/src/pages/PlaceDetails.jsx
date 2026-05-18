import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import placeService from "../services/placeService";
import tripService from "../services/tripService";
import Loading from "../components/common/Loading";
import "../styles/explore.css"; // reutilizamos estilos base

export default function PlaceDetails() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchPlace() {
      try {
        const data = await placeService.getById(id);
        setPlace(data);
      } catch (error) {
        console.error("Error fetching place:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlace();
  }, [id]);

  const handleAddToTrip = async () => {
    try {
      await tripService.addPlaceToTrip(place.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Error adding place:", error);
    }
  };

  if (loading) return <Loading />;

  if (!place) return <p>No se encontró este lugar.</p>;

  return (
    <div className="place-details-container">
      <img src={place.image} alt={place.name} className="place-details-image" />

      <div className="place-details-info">
        <h1>{place.name}</h1>
        <h3 className="place-country">{place.country}</h3>

        <p className="place-description">{place.description}</p>

        <span className="badge">Multitud: {place.crowd_level}</span>

        <button className="add-btn" onClick={handleAddToTrip}>
          {added ? "Añadido ✓" : "Añadir a mi viaje"}
        </button>
      </div>
    </div>
  );
}
