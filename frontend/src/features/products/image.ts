const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const GCS_PREFIX = "https://storage.googleapis.com/";

// Resuelve la URL de una imagen para mostrarla siempre vía el proxy del backend.
// - URLs públicas de GCS (guardadas antes del proxy) -> se reescriben al proxy.
// - URLs del proxy o base64 -> se devuelven tal cual.
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith(GCS_PREFIX)) {
    const rest = url.slice(GCS_PREFIX.length); // <bucket>/<objectPath>
    const slash = rest.indexOf("/");
    const objectPath = slash >= 0 ? rest.slice(slash + 1) : rest;
    return `${API_BASE}/uploads/file/${objectPath}`;
  }
  return url;
}
