export const getMediaUrl = (path) => {
  if (!path) return "/default-avatar.png";

  if (typeof path !== "string") return "/default-avatar.png";

  // Si ya es URL completa (Cloudinary o externa)
  if (path.startsWith("http")) return path;

  // Si por alguna razón llega una ruta local vieja (legacy Django)
  const clean = path.replace(/^\/+/, "");

  return `https://wherenextpmf.onrender.com/${clean}`;
};