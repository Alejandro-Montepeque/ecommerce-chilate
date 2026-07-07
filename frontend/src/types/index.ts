export type Role = "CUSTOMER" | "MAINTENANCE" | "CATALOG" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName?: string | null;
  role: Role;
}

export interface Category {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
  sortOrder: number;
}

export interface Size {
  id: string;
  label: string;
  sortOrder: number;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  colorHex?: string | null;
  priceOverrideUsd?: string | null;
  stock: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altEs?: string | null;
  altEn?: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  priceUsd: string; // Prisma Decimal llega como string
  isPublished: boolean;
  categoryId?: string | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface Banner {
  id: string;
  titleEs?: string | null;
  titleEn?: string | null;
  subtitleEs?: string | null;
  subtitleEn?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface SiteContent {
  key: string;
  valueEs?: string | null;
  valueEn?: string | null;
}
