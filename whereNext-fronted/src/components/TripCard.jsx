function TripCard({
  trip,
  deleteTrip,
  toggleFavorite,
  editingId,
  setEditingId,
  editTitle,
  setEditTitle,
  updateTrip,
  getTripImage,
}) {

  return (
    <div className="trip-card">

      <img
        src={getTripImage(
          trip.destination
        )}
        alt={trip.destination}
        className="trip-image"
      />

      <h2>{trip.title}</h2>

      <button
        className="favorite-btn"
        onClick={() =>
          toggleFavorite(trip)
        }
      >
        {trip.is_favorite
          ? "❤️"
          : "🤍"}
      </button>

      <p>📍 {trip.destination}</p>

      <p className="trip-date">

        📅{" "}

        {new Date(
          trip.start_date
        ).toLocaleDateString(
          "es-ES",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )}

        {" → "}

        {new Date(
          trip.end_date
        ).toLocaleDateString(
          "es-ES",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )}

      </p>

      <p className="trip-description">
        {trip.description}
      </p>

      <div className="buttons">

        <button
          onClick={() =>
            deleteTrip(trip.id)
          }
        >
          Eliminar
        </button>

        <button
          onClick={() => {
            setEditingId(trip.id);

            setEditTitle(trip.title);
          }}
        >
          Editar
        </button>

      </div>

      {editingId === trip.id && (

        <div>

          <input
            value={editTitle}
            onChange={(e) =>
              setEditTitle(
                e.target.value
              )
            }
          />

          <button
            onClick={() =>
              updateTrip(trip)
            }
          >
            Guardar
          </button>

        </div>
      )}

    </div>
  );
}

export default TripCard;