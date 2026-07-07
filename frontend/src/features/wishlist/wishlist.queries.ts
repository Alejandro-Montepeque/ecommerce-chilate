import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types";

const wishlistApi = {
  list: () => api.get<Product[]>("/wishlist"),
  add: (productId: string) => api.post<void>(`/wishlist/${productId}`),
  remove: (productId: string) => api.del<void>(`/wishlist/${productId}`),
};

const KEY = ["wishlist"] as const;

// Lista de deseos (solo si hay sesión).
export function useWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEY,
    queryFn: wishlistApi.list,
    enabled: Boolean(user),
  });
}

// Conjunto de ids en wishlist para saber si un producto está marcado.
export function useWishlistIds(): Set<string> {
  const { data = [] } = useWishlist();
  return new Set(data.map((p) => p.id));
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      active,
    }: {
      productId: string;
      active: boolean;
    }) => (active ? wishlistApi.remove(productId) : wishlistApi.add(productId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
