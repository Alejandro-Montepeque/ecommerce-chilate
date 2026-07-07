import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannersApi, type BannerInput } from "./banners.api";

export const bannerKeys = {
  all: ["banners"] as const,
  active: () => [...bannerKeys.all, "active"] as const,
  admin: () => [...bannerKeys.all, "admin"] as const,
};

export function useActiveBanners() {
  return useQuery({
    queryKey: bannerKeys.active(),
    queryFn: bannersApi.listActive,
  });
}

export function useAdminBanners(enabled = true) {
  return useQuery({
    queryKey: bannerKeys.admin(),
    queryFn: bannersApi.listAll,
    enabled,
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BannerInput) => bannersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bannerKeys.all }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bannerKeys.all }),
  });
}
