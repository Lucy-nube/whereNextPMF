export const getMediaUrl = (path) => {
  const fallback = "/default-avatar.png";

  if (!path) return fallback;

  // URLs completas
  if (typeof path === "string" && path.startsWith("http")) {
    return path;
  }

  // media local (Render / Django)
  if (typeof path === "string" && path.startsWith("/media/")) {
    return `https://wherenextpmf.onrender.com${path}`;
  }

  return fallback;
};