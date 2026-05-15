import { useEffect, useState } from "react";

import {
  getTrips,
  createTripRequest,
  deleteTripRequest,
  updateTripRequest,
} from "../services/tripService";

export const useTrips = (token) => {

  const [trips, setTrips] = useState([]);

  // =========================
  // CARGAR VIAJES
  // =========================

  useEffect(() => {

    if (!token) return;

    loadTrips();

  }, [token]);

  const loadTrips = async () => {

    try {

      const data = await getTrips(token);

      setTrips(data);

    } catch (error) {

      console.log(error);

    }
  };

  // =========================
  // CREAR
  // =========================

  const createTrip = async (trip) => {

    const newTrip = await createTripRequest(
      trip,
      token
    );

    setTrips((prev) => [...prev, newTrip]);
  };

  // =========================
  // ELIMINAR
  // =========================

  const deleteTrip = async (id) => {

    await deleteTripRequest(id, token);

    setTrips((prev) =>
      prev.filter((trip) => trip.id !== id)
    );
  };

  // =========================
  // ACTUALIZAR
  // =========================

  const updateTrip = async (updatedTrip) => {

    const trip = await updateTripRequest(
      updatedTrip.id,
      updatedTrip,
      token
    );

    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id ? trip : t
      )
    );
  };

  return {
    trips,
    createTrip,
    deleteTrip,
    updateTrip,
  };
};