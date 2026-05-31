export const getMediaUrl = (path) => {
  if (!path) return "/default-place.jpg";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  let clean = path.replace(/^\/+/, "");
  clean = clean.replace(/^media\/media\//, "media/");

  return `http://127.0.0.1:8000/${clean}`;
};
