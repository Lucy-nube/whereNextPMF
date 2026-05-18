import API from "./api";

export async function login(username, password) {
  const response = await API.post("token/", {
    username,
    password,
  });

  const { access, refresh } = response.data;

  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);

  return response.data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export const getMe = () => {
  return API.get("me/");
};
