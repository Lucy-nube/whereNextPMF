import API from "./api";

const placeService = {
  getAll: async () => {
    const response = await API.get("/places/");
    return response.data;
  },

  getById: async (id) => {
    const response = await API.get(`/places/${id}/`);
    return response.data;
  },
};

export default placeService;
