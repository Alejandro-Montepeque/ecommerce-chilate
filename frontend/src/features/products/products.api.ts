import { api } from "@/lib/api";
import type { Product } from "@/types";

export interface ProductInput {
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  priceUsd: number;
  isPublished?: boolean;
  categoryId?: string;
}

export const productsApi = {
  listPublished: () => api.get<Product[]>("/products"),
  listAll: () => api.get<Product[]>("/products/admin/all"),
  getBySlug: (slug: string) => api.get<Product>(`/products/${slug}`),
  create: (data: ProductInput) => api.post<Product>("/products", data),
  update: (id: string, data: ProductInput) =>
    api.put<Product>(`/products/${id}`, data),
  remove: (id: string) => api.del<void>(`/products/${id}`),
};
