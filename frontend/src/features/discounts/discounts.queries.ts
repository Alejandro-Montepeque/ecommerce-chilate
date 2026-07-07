import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AdminDiscount {
  id: string;
  productId: string;
  percent: number;
  startsAt: string;
  endsAt: string;
  product?: { nameEs: string };
}

export interface CreateDiscountInput {
  productId: string;
  percent: number;
  startsAt: string;
  endsAt: string;
}

// Info para el banner de la tienda: descuento vigente ("active"), próximo
// ("upcoming") o ninguno ("none"). El banner solo se muestra si hay algo.
export interface DiscountBannerInfo {
  state: "active" | "upcoming" | "none";
  startsAt?: string;
  endsAt?: string;
  percent?: number;
}

const discountsApi = {
  list: () => api.get<AdminDiscount[]>("/discounts"),
  create: (data: CreateDiscountInput) =>
    api.post<AdminDiscount>("/discounts", data),
  remove: (id: string) => api.del<void>(`/discounts/${id}`),
  banner: () => api.get<DiscountBannerInfo>("/discounts/banner"),
};

const KEY = ["discounts"] as const;

// Público: descuento vigente o próximo (para el banner de la tienda).
export function useDiscountBanner() {
  return useQuery({
    queryKey: ["discounts", "banner"],
    queryFn: discountsApi.banner,
    refetchInterval: 60_000, // refresca por si empieza/expira
  });
}

export function useDiscounts() {
  return useQuery({ queryKey: KEY, queryFn: discountsApi.list });
}

export function useCreateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDiscountInput) => discountsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discountsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
