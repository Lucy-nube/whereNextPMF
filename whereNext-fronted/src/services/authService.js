import API from "./api";

export async function login(username, password) {
  try {
    const response = await API.post("token/", {
      username,
      password,
    });

    const { access, refresh } = response.data;

    // Guardar tokens
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    return response.data;
  } catch (err) {
    throw err.response?.data || { detail: "Error al iniciar sesión" };
  }
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}
