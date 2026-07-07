import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const TOKEN_KEY = "chilate_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Instancia central de axios.
const http = axios.create({ baseURL: BASE_URL });

// Interceptor de request: adjunta el token JWT.
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de response: normaliza el mensaje de error del backend.
http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const data = error.response?.data;
    const raw = data?.message;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : (raw ?? error.message ?? "Error de red");
    // Si expira la sesión, limpiamos el token.
    if (error.response?.status === 401) tokenStore.clear();
    return Promise.reject(new Error(message));
  },
);

// Interfaz estable usada por toda la app (no cambia al usar axios).
export const api = {
  get: <T>(path: string) => http.get<T>(path).then((r) => r.data),
  post: <T>(path: string, body?: unknown) =>
    http.post<T>(path, body).then((r) => r.data),
  put: <T>(path: string, body?: unknown) =>
    http.put<T>(path, body).then((r) => r.data),
  patch: <T>(path: string, body?: unknown) =>
    http.patch<T>(path, body).then((r) => r.data),
  del: <T>(path: string) => http.delete<T>(path).then((r) => r.data),
};
