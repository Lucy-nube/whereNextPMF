const BASE_URL = "https://wherenextpmf.onrender.com";

import defaultAvatar from "../assets/default-avatar.png";

export const getMediaUrl = (path, fallback = defaultAvatar) => {
  if (!path) return fallback;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${BASE_URL}${cleanPath}`;
};