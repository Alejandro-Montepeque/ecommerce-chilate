import { api } from "@/lib/api";
import type { Banner } from "@/types";

export interface BannerInput {
  titleEs?: string;
  titleEn?: string;
  subtitleEs?: string;
  subtitleEn?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
}

export const bannersApi = {
  listActive: () => api.get<Banner[]>("/banners"),
  listAll: () => api.get<Banner[]>("/banners/admin/all"),
  create: (data: BannerInput) => api.post<Banner>("/banners", data),
  update: (id: string, data: BannerInput) =>
    api.put<Banner>(`/banners/${id}`, data),
  remove: (id: string) => api.del<void>(`/banners/${id}`),
};
