export const getMediaUrl = (path) => {
  if (!path) return "/default-avatar.png";

  // Si ya es una URL completa (Cloudinary o cualquier otra)
  if (path.startsWith("http")) return path;

  // Si es una ruta relativa de Cloudinary
  if (path.startsWith("image/upload")) {
    return `https://res.cloudinary.com/dgk4a9xnk/${path}`;
  }

  // Si por alguna razón viene algo raro, fallback
  return path;
};
