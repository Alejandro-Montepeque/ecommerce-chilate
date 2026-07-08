import { api } from "@/lib/api";
import type { Role, User } from "@/types";

export interface CreateUserInput {
  email: string;
  fullName?: string;
  role: Role;
}

export const usersApi = {
  list: () => api.get<User[]>("/users"),
  create: (data: CreateUserInput) => api.post<User>("/users", data),
  setRole: (id: string, role: Role) =>
    api.patch<User>(`/users/${id}/role`, { role }),
  resetPassword: (id: string) =>
    api.post<{ ok: boolean }>(`/users/${id}/reset-password`, {}),
};
