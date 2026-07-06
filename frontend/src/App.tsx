import { Routes, Route } from "react-router-dom";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RequireStaff } from "@/routes/RequireStaff";
import HomePage from "@/pages/store/HomePage";
import ShopPage from "@/pages/store/ShopPage";
import CartPage from "@/pages/store/CartPage";
import CheckoutPage from "@/pages/store/CheckoutPage";
import LoginPage from "@/pages/store/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ProductsAdminPage from "@/pages/admin/ProductsAdminPage";
import BannersAdminPage from "@/pages/admin/BannersAdminPage";
import ContentAdminPage from "@/pages/admin/ContentAdminPage";

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tienda" element={<ShopPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
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
        <Route path="productos" element={<ProductsAdminPage />} />
        <Route path="banners" element={<BannersAdminPage />} />
        <Route path="contenido" element={<ContentAdminPage />} />
      </Route>
    </Routes>
  );
}
