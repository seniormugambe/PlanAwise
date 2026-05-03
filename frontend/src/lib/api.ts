const configuredApiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const currentOrigin =
  typeof window === "undefined" ? "" : window.location.origin.replace(/\/$/, "");

const apiBaseUrl = configuredApiBaseUrl === currentOrigin ? "" : configuredApiBaseUrl;

export const apiUrl = (path: string): string => `${apiBaseUrl}${path}`;
