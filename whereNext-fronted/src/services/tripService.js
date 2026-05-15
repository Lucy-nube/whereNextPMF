const API_URL = "http://127.0.0.1:8000/api/trips";

// =========================
// GET TRIPS
// =========================

export const getTrips = async (token) => {

  const response = await fetch(API_URL + "/", {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  return await response.json();
};

// =========================
// CREATE TRIP
// =========================

export const createTripRequest = async (
  trip,
  token
) => {

  const response = await fetch(API_URL + "/", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },

    body: JSON.stringify(trip),
  });

  return await response.json();
};

// =========================
// DELETE TRIP
// =========================

export const deleteTripRequest = async (
  id,
  token
) => {

  await fetch(`${API_URL}/${id}/`, {
    method: "DELETE",

    headers: {
      Authorization: `Token ${token}`,
    },
  });
};

// =========================
// UPDATE TRIP
// =========================

export const updateTripRequest = async (
  id,
  trip,
  token
) => {

  const response = await fetch(
    `${API_URL}/${id}/`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },

      body: JSON.stringify(trip),
    }
  );

  return await response.json();
};