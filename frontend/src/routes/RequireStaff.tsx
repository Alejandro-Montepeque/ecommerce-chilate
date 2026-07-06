import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Protege /admin. La seguridad real la impone el backend (guards + JWT);
// esto es solo experiencia de usuario.
export function RequireStaff({ children }: { children: ReactNode }) {
  const { user, isStaff, loading } = useAuth();
  if (loading) return <div className="p-8">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/" replace />;
  return <>{children}</>;
}
