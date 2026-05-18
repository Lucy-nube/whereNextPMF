import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/Home.css";

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await API.get("/places/");
        const data = res.data;

        setPlaces(data);
        setFiltered(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const handleFilter = (category) => {
    setActiveFilter(category);

    if (category === "ALL") {
      setFiltered(places);
      return;
    }

    const filteredData = places.filter(
      (p) => p.category === category
    );

    setFiltered(filteredData);
  };

  return (
    <div className="home">

      {/* HEADER */}
      <div className="home-header">
        <h1>Explora lugares sin multitudes</h1>
        <p>Descubre sitios tranquilos cerca de ti</p>
      </div>

      {/* FILTERS */}
      <div className="filters">

        <button
          className={activeFilter === "ALL" ? "active" : ""}
          onClick={() => handleFilter("ALL")}
        >
          🌍 Todos
        </button>

        <button
          className={activeFilter === "NATURE" ? "active" : ""}
          onClick={() => handleFilter("NATURE")}
        >
          🌿 Naturaleza
        </button>

        <button
          className={activeFilter === "BEACH" ? "active" : ""}
          onClick={() => handleFilter("BEACH")}
        >
          🏖 Playa
        </button>

        <button
          className={activeFilter === "CITY" ? "active" : ""}
          onClick={() => handleFilter("CITY")}
        >
          🏙 Ciudad
        </button>

      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="loading">Cargando lugares...</p>
      ) : (
        <div className="grid">

          {filtered.map((place) => (
            <div key={place.id} className="card">

              <div className="card-image">
               <img src={place.image_url} alt={place.name} />
              </div>

              <div className="card-content">
                <h3>{place.name}</h3>
                <p>{place.description}</p>

                <span className="badge">
                  {place.category}
                </span>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}