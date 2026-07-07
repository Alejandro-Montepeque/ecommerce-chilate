import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "./content.api";
import { resolveImageUrl } from "@/features/products/image";

export const contentKeys = {
  all: ["content"] as const,
};

// Clave de contenido donde se guarda la URL del logo de la tienda.
export const LOGO_KEY = "logo_url";

export function useSiteContent() {
  return useQuery({ queryKey: contentKeys.all, queryFn: contentApi.list });
}

// URL del logo lista para mostrar (o null si no se ha configurado).
export function useLogoUrl(): string | null {
  const { data = [] } = useSiteContent();
  const row = data.find((c) => c.key === LOGO_KEY);
  return row?.valueEs ? resolveImageUrl(row.valueEs) : null;
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
