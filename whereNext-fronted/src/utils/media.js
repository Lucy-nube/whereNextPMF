export const getMediaUrl = (path) => {
  if (!path) return null;

  if (path.startsWith("http")) return path;

  return `${BASE_URL}/${path.replace(/^\/+/, "")}`;
};