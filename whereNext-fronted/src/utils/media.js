export const getMediaUrl = (path) => {
  if (!path) return "/default-avatar.png";

  // Si ya es URL completa (Cloudinary o cualquier otra)
  if (path.startsWith("http")) return path;

  // Si es una imagen vieja de Render
  if (path.startsWith("/media/")) {
    return `https://wherenextpmf.onrender.com${path}`;
  }

  // Si no es URL completa, ni /media/, devuélvela tal cual
  return path;
};
