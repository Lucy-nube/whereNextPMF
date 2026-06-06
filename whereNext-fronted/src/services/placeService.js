import API from "./api";

const placeService = {
  getAll: async () => {
    const response = await API.get("places/");
    return response.data;
  },

  getById: async (id) => {
    const response = await API.get(`places/${id}/`);
    return response.data;
  },

  getFavorites() {
    return API.get("places/favorites/");
  },


  favorite(id) {
    return API.post(`places/${id}/favorite/`);
  },

};

export default placeService;
