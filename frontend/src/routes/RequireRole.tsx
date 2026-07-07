import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

// Protege una ruta permitiendo solo los roles indicados.
// La seguridad real la impone el backend; esto es experiencia de usuario.
export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Cargando...</div>;
  if (!user || !roles.includes(user.role))
    return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
