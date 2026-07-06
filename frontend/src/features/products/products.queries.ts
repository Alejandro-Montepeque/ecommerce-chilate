import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi, type ProductInput } from "./products.api";

// Claves de query centralizadas (evita strings mágicos y facilita invalidación).
export const productKeys = {
  all: ["products"] as const,
  published: () => [...productKeys.all, "published"] as const,
  admin: () => [...productKeys.all, "admin"] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
};

export function usePublishedProducts() {
  return useQuery({
    queryKey: productKeys.published(),
    queryFn: productsApi.listPublished,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: productKeys.admin(),
    queryFn: productsApi.listAll,
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductInput }) =>
      productsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}
