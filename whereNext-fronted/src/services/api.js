const BASE_URL = "http://127.0.0.1:8000/api";

// 🔐 AUTH
export const login = async (username, password) => {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return res.json();
};

export const register = async (username, password) => {
  const res = await fetch(`${BASE_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return res.json();
};

// ✈️ TRIPS
export const getTrips = async (token) => {
  const res = await fetch(`${BASE_URL}/trips/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");

  return res.json();
};

export const createTrip = async (token, trip) => {
  const res = await fetch(`${BASE_URL}/trips/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(trip),
  });

  return res.json();
};

export const deleteTrip = async (token, id) => {
  return fetch(`${BASE_URL}/trips/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
};

export const updateTrip = async (token, id, data) => {
  const res = await fetch(`${BASE_URL}/trips/${id}/update/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};