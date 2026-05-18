import { useState } from "react";
import "../../styles/trips.css";



function TripForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !destination) return;

    await onCreate({
      title,
      destination,
    });

    setTitle("");
    setDestination("");
  };

  return (
    <form onSubmit={handleSubmit} className="trip-form">

      <input
        type="text"
        placeholder="Título del viaje"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Destino"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      <button type="submit">
        Crear viaje
      </button>

    </form>
  );
}

export default TripForm;