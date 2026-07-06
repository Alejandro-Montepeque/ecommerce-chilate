import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "./content.api";

export const contentKeys = {
  all: ["content"] as const,
};

export function useSiteContent() {
  return useQuery({ queryKey: contentKeys.all, queryFn: contentApi.list });
}

export function useUpdateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      valueEs,
      valueEn,
    }: {
      key: string;
      valueEs?: string;
      valueEn?: string;
    }) => contentApi.update(key, { valueEs, valueEn }),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.all }),
  });
}
