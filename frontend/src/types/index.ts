export type Role = "CUSTOMER" | "MAINTENANCE" | "ADMIN";

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
