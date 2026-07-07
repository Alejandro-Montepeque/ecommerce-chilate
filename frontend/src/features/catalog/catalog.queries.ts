import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sizesApi, colorsApi, categoriesAdminApi } from "./catalog.api";

export const catalogKeys = {
  sizes: ["sizes"] as const,
  colors: ["colors"] as const,
  categories: ["categories"] as const,
};

// --- Tallas ---
export function useSizes() {
  return useQuery({ queryKey: catalogKeys.sizes, queryFn: sizesApi.list });
}
export function useCreateSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label: string) => sizesApi.create(label),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.sizes }),
  });
}
export function useDeleteSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sizesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.sizes }),
  });
}

// --- Colores ---
export function useColors() {
  return useQuery({ queryKey: catalogKeys.colors, queryFn: colorsApi.list });
}
export function useCreateColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, hex }: { name: string; hex: string }) =>
      colorsApi.create(name, hex),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.colors }),
  });
}
export function useDeleteColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => colorsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.colors }),
  });
}

// --- Categorías ---
export function useCategoriesAdmin() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: categoriesAdminApi.list,
  });
}
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { slug: string; nameEs: string; nameEn: string }) =>
      categoriesAdminApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories }),
  });
}
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesAdminApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories }),
  });
}
