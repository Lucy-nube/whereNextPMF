function TripForm({
  title,
  setTitle,
  destination,
  setDestination,
  description,
  setDescription,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  createTrip,
}) {

  return (
    <div className="trip-form">

      <input
        placeholder="Título del viaje"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <input
        placeholder="Destino"
        value={destination}
        onChange={(e) =>
          setDestination(e.target.value)
        }
      />

      <textarea
        placeholder="Describe tu viaje..."
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <input
        type="date"
        value={startDate}
        onChange={(e) =>
          setStartDate(e.target.value)
        }
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) =>
          setEndDate(e.target.value)
        }
      />

      <button onClick={createTrip}>
        Crear viaje
      </button>

    </div>
  );
}

export default TripForm;