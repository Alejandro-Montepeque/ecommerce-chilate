import { api } from "@/lib/api";
import type { Category, Product } from "@/types";

export interface VariantInput {
  size?: string;
  color?: string;
  colorHex?: string;
  stock: number;
}

export interface ImageInput {
  url: string;
  altEs?: string;
  altEn?: string;
}

export interface ProductInput {
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  priceUsd: number;
  isPublished?: boolean;
  categoryId?: string;
  subcategory?: "HOMBRE" | "MUJER" | "UNISEX";
  variants?: VariantInput[];
  images?: ImageInput[];
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

export const categoriesApi = {
  list: () => api.get<Category[]>("/categories"),
};
