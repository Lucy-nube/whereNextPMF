const BASE_URL = "https://wherenextpmf.onrender.com";

export const getMediaUrl = (path) => {
  if (!path) return "/default-avatar.png";

  // Si ya es una URL completa (Cloudinary), devuélvela tal cual
  if (path.startsWith("http")) return path;

  // Si es una ruta relativa (solo pasará con datos antiguos)
  let clean = path.replace(/^\/+/, "");
  clean = clean.replace(/^media\/media\//, "media/");

  return `${BASE_URL}/${clean}`;
};
