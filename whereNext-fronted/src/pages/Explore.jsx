import { useEffect, useState } from "react";
import placeService from "../services/placeService";
import PlaceCard from "../components/places/PlaceCard";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import "../styles/explore.css";


export default function Explore() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const data = await placeService.getAll();
        setPlaces(data);
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="explore-container">
      <h1 className="explore-title">Lugares tranquilos para viajar</h1>

      {places.length === 0 ? (
        <EmptyState message="No hay lugares disponibles" />
      ) : (
        <div className="places-grid">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
