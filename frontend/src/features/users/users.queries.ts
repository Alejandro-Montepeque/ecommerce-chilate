import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type CreateUserInput } from "./users.api";
import type { Role } from "@/types";

const usersKey = ["users"] as const;

export function useUsers() {
  return useQuery({ queryKey: usersKey, queryFn: usersApi.list });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKey }),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      usersApi.setRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKey }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => usersApi.resetPassword(id),
  });
}
