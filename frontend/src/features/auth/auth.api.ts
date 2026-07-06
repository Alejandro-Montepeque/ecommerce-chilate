import { api } from "@/lib/api";
import type { User } from "@/types";

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Servicio de autenticación. Aísla las llamadas HTTP del resto de la app.
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  register: (email: string, password: string, fullName?: string) =>
    api.post<AuthResponse>("/auth/register", { email, password, fullName }),
  me: () => api.get<User>("/auth/me"),
};
