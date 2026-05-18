import API from "./api";

const tripService = {
  getAll: async () => {
    const response = await API.get("/trips/");
    return response.data;
  },

  getById: async (id) => {
    const response = await API.get(`/trips/${id}/`);
    return response.data;
  },

  addPlaceToTrip: async (placeId) => {
    const response = await API.post("/trips/add_place/", { place_id: placeId });
    return response.data;
  },
};

export default tripService;
