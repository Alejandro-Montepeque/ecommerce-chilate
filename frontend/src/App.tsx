import { Routes, Route } from "react-router-dom";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RequireStaff } from "@/routes/RequireStaff";
import { RequireAdmin } from "@/routes/RequireAdmin";
import { RequireRole } from "@/routes/RequireRole";
import HomePage from "@/pages/store/HomePage";
import ShopPage from "@/pages/store/ShopPage";
import CartPage from "@/pages/store/CartPage";
import CheckoutPage from "@/pages/store/CheckoutPage";
import ThankYouPage from "@/pages/store/ThankYouPage";
import LoginPage from "@/pages/store/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ProductsAdminPage from "@/pages/admin/ProductsAdminPage";
import ProductFormPage from "@/pages/admin/ProductFormPage";
import CatalogsAdminPage from "@/pages/admin/CatalogsAdminPage";
import BannersAdminPage from "@/pages/admin/BannersAdminPage";
import ContentAdminPage from "@/pages/admin/ContentAdminPage";
import UsersAdminPage from "@/pages/admin/UsersAdminPage";

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tienda" element={<ShopPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido-confirmado" element={<ThankYouPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireStaff>
            <AdminLayout />
          </RequireStaff>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="productos"
          element={
            <RequireRole roles={["ADMIN", "CATALOG"]}>
              <ProductsAdminPage />
            </RequireRole>
          }
        />
        <Route
          path="productos/nuevo"
          element={
            <RequireRole roles={["ADMIN", "CATALOG"]}>
              <ProductFormPage />
            </RequireRole>
          }
        />
        <Route
          path="productos/:id/editar"
          element={
            <RequireRole roles={["ADMIN", "CATALOG"]}>
              <ProductFormPage />
            </RequireRole>
          }
        />
        <Route
          path="catalogos"
          element={
            <RequireRole roles={["ADMIN", "CATALOG"]}>
              <CatalogsAdminPage />
            </RequireRole>
          }
        />
        <Route
          path="banners"
          element={
            <RequireRole roles={["ADMIN", "MAINTENANCE"]}>
              <BannersAdminPage />
            </RequireRole>
          }
        />
        <Route
          path="contenido"
          element={
            <RequireRole roles={["ADMIN", "MAINTENANCE"]}>
              <ContentAdminPage />
            </RequireRole>
          }
        />
        <Route
          path="usuarios"
          element={
            <RequireAdmin>
              <UsersAdminPage />
            </RequireAdmin>
          }
        />
      </Route>
    </Routes>
  );
}
