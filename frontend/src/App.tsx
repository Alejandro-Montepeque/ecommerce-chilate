import { Navigate, useLocation, useRoutes } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes/config";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const element = useRoutes(routes);

  // Cambio de contraseña obligatorio: mientras el usuario tenga una temporal,
  // se le fuerza a /cambiar-contrasena antes de usar el resto del sitio.
  if (user?.mustChangePassword && location.pathname !== "/cambiar-contrasena") {
    return <Navigate to="/cambiar-contrasena" replace />;
  }

  return element;
}
