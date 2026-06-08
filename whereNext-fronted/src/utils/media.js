const BASE_URL = "https://wherenextpmf.onrender.com";

export const getMediaUrl = (
  path,
  fallback = "public/default-avatar.png"
) => {
  if (!path) return fallback;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  const clean = path.replace(/^\/+/, "");

  return `${BASE_URL}/${clean}`;
};