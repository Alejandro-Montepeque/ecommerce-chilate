import { api } from "@/lib/api";
import type { SiteContent } from "@/types";

export const contentApi = {
  list: () => api.get<SiteContent[]>("/content"),
  update: (key: string, data: { valueEs?: string; valueEn?: string }) =>
    api.put<SiteContent>(`/content/${key}`, data),
};
