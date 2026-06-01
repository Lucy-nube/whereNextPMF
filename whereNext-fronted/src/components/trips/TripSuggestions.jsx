import { useEffect, useState } from "react";
import API from "../../services/api";
import { getMediaUrl } from "../../utils/media";
import "../../styles/tripsuggestion.css";



export default function TripSuggestions({ mood, onSelectDestination }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mood) return;
    const fetchSuggestions = async () => {
      setLoading(true);

      try {
        const moodMap = {
          CITY: "city",
          NATURE: "nature",
          BEACH: "beach",
          MUSEUM: "museum",
          FOOD: "food",
        };

        const category = moodMap[mood] || mood.toLowerCase();

        const res = await API.get("/places/", {
          params: { category }
        });

        const clean = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        setSuggestions(clean.slice(0, 6));

      } catch (err) {
        console.error("Error cargando sugerencias:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [mood]);

  return (
    <div className="trip-suggestions-container">

      <h3 className="ts-title">
        ✨ Sugerencias para tu aventura
      </h3>

      {loading && (
        <p className="ts-loading">
          Buscando lugares mágicos...
        </p>
      )}

      {!loading && suggestions.length === 0 && (
        <p className="ts-empty">
          No hay sugerencias para este mood todavía.
        </p>
      )}

      <div className="ts-grid">

        {suggestions.map((place) => (
          <div
            key={place.id}
            className="ts-card"
            onClick={() =>
              onSelectDestination({
                destination: place.name,
                image: getMediaUrl(place.image_url || place.image)
              })


            }
          >

            <img
              src={getMediaUrl(place.image_url || place.image, "/default-place.jpg")}
              onError={(e) => (e.currentTarget.src = "/default-place.jpg")}
              alt={place.name}
              className="ts-image"
            />


            <div className="ts-info">
              <h4>{place.name}</h4>
              <p>{place.category}</p>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
