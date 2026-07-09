import { lazy, type ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RequireStaff } from "@/routes/RequireStaff";
import { RequireAdmin } from "@/routes/RequireAdmin";
import { RequireRole } from "@/routes/RequireRole";
import type { Role } from "@/types";

// Carga diferida (code splitting): cada página es su propio chunk. Así el
// cliente de la tienda no descarga el panel admin, y viceversa.
const HomePage = lazy(() => import("@/pages/store/HomePage"));
const ShopPage = lazy(() => import("@/pages/store/ShopPage"));
const CartPage = lazy(() => import("@/pages/store/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/store/CheckoutPage"));
const ThankYouPage = lazy(() => import("@/pages/store/ThankYouPage"));
const WishlistPage = lazy(() => import("@/pages/store/WishlistPage"));
const LoginPage = lazy(() => import("@/pages/store/LoginPage"));
const ChangePasswordPage = lazy(
  () => import("@/pages/store/ChangePasswordPage"),
);
const NotFoundPage = lazy(() => import("@/pages/store/NotFoundPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const ProductsAdminPage = lazy(() => import("@/pages/admin/ProductsAdminPage"));
const ProductFormPage = lazy(() => import("@/pages/admin/ProductFormPage"));
const CatalogsAdminPage = lazy(() => import("@/pages/admin/CatalogsAdminPage"));
const DiscountsAdminPage = lazy(
  () => import("@/pages/admin/DiscountsAdminPage"),
);
const BannersAdminPage = lazy(() => import("@/pages/admin/BannersAdminPage"));
const ContentAdminPage = lazy(() => import("@/pages/admin/ContentAdminPage"));
const UsersAdminPage = lazy(() => import("@/pages/admin/UsersAdminPage"));
const AuditAdminPage = lazy(() => import("@/pages/admin/AuditAdminPage"));

// Envuelve un elemento con el guard de roles (evita repetir <RequireRole> en
// cada ruta del panel). La seguridad real la impone el backend.
const roled = (roles: Role[], element: ReactNode): ReactNode => (
  <RequireRole roles={roles}>{element}</RequireRole>
);

// Definición declarativa de todas las rutas. Ver de un vistazo qué existe,
// qué layout usa y qué roles la protegen.
export const routes: RouteObject[] = [
  {
    element: <StoreLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "tienda", element: <ShopPage /> },
      { path: "carrito", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "pedido-confirmado", element: <ThankYouPage /> },
      { path: "favoritos", element: <WishlistPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "cambiar-contrasena", element: <ChangePasswordPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "admin",
    element: (
      <RequireStaff>
        <AdminLayout />
      </RequireStaff>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "productos",
        element: roled(["ADMIN", "CATALOG"], <ProductsAdminPage />),
      },
      {
        path: "productos/nuevo",
        element: roled(["ADMIN", "CATALOG"], <ProductFormPage />),
      },
      {
        path: "productos/:id/editar",
        element: roled(["ADMIN", "CATALOG"], <ProductFormPage />),
      },
      {
        path: "catalogos",
        element: roled(["ADMIN", "CATALOG"], <CatalogsAdminPage />),
      },
      {
        path: "descuentos",
        element: roled(["ADMIN", "CATALOG"], <DiscountsAdminPage />),
      },
      {
        path: "banners",
        element: roled(["ADMIN", "MAINTENANCE"], <BannersAdminPage />),
      },
      {
        path: "contenido",
        element: roled(["ADMIN", "MAINTENANCE"], <ContentAdminPage />),
      },
      {
        path: "usuarios",
        element: (
          <RequireAdmin>
            <UsersAdminPage />
          </RequireAdmin>
        ),
      },
      {
        path: "auditoria",
        element: (
          <RequireAdmin>
            <AuditAdminPage />
          </RequireAdmin>
        ),
      },
    ],
  },
];
