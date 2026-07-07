import type { Role } from "@/types";

// Permisos por rol (deben coincidir con los guards del backend).
// - ADMIN: todo.
// - CATALOG: solo productos/inventario.
// - MAINTENANCE: banners y contenido de la landing.
export const can = {
  staff: (role?: Role) =>
    role === "ADMIN" || role === "MAINTENANCE" || role === "CATALOG",
  products: (role?: Role) => role === "ADMIN" || role === "CATALOG",
  content: (role?: Role) => role === "ADMIN" || role === "MAINTENANCE",
  users: (role?: Role) => role === "ADMIN",
  orders: (role?: Role) => role === "ADMIN",
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  CATALOG: "Catálogo",
  MAINTENANCE: "Mantenimiento",
  CUSTOMER: "Cliente",
};
