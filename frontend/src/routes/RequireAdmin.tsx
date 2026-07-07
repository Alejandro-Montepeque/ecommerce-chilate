import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Protege rutas exclusivas de ADMIN (ej. gestión de usuarios).
// Un usuario de mantenimiento se rebota al panel. La seguridad real la
// impone el backend; esto es solo experiencia de usuario.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Cargando...</div>;
  if (user?.role !== "ADMIN") return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
