import { useEffect, useState } from "react";
import { getTrips } from "../services/tripService";

export const useTrips = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTrips();
        setTrips(data);
      } catch (e) {
        console.log("GET trips error:", e);
      }
    };

    load();
  }, []);

  return { trips };
};