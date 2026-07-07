import { api } from "@/lib/api";
import type { Category, Color, Size } from "@/types";

export const sizesApi = {
  list: () => api.get<Size[]>("/sizes"),
  create: (label: string) => api.post<Size>("/sizes", { label }),
  remove: (id: string) => api.del<void>(`/sizes/${id}`),
};

export const colorsApi = {
  list: () => api.get<Color[]>("/colors"),
  create: (name: string, hex: string) =>
    api.post<Color>("/colors", { name, hex }),
  remove: (id: string) => api.del<void>(`/colors/${id}`),
};

export const categoriesAdminApi = {
  list: () => api.get<Category[]>("/categories"),
  create: (data: { slug: string; nameEs: string; nameEn: string }) =>
    api.post<Category>("/categories", data),
  remove: (id: string) => api.del<void>(`/categories/${id}`),
};
