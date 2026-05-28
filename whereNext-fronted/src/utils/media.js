export function getMediaUrl(path) {
  if (!path) return "https://flaticon.com"; // fallback
  if (path.startsWith("http")) return path; // ya es URL completa
  return `http://127.0.0.1:8000${path}`; // convierte /media/... en URL completa
}
