import { useEffect, useState } from "react";
import placeService from "../services/placeService";
import { getMediaUrl } from "../utils/media";
import { useNavigate } from "react-router-dom";
import "../styles/favorites.css";

export default function Favorites() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchFavorites() {
            try {
                const res = await placeService.getFavorites();
                setPlaces(res.data);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchFavorites();
    }, []);

    if (loading) return <p className="loading-text">Cargando favoritos...</p>;

    return (
        <div className="explore-page">
            <h1 className="explore-title">📌 Mis lugares guardados</h1>

            {places.length === 0 ? (
                <p className="no-comments-fallback">Aún no has guardado lugares.</p>
            ) : (
                <div className="explore-grid">
                    {places.map((place) => (
                        <div
                            key={place.id}
                            className="explore-card"
                            onClick={() => navigate(`/places/${place.id}`)}
                        >
                            <img
                                src={getMediaUrl(place.image_url, "/default-place.jpg")}
                                alt={place.name}
                                className="explore-card-image"
                            />

                            <div className="explore-card-info">
                                <h3>{place.name}</h3>
                                <p className="explore-card-country">📍 {place.country}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
