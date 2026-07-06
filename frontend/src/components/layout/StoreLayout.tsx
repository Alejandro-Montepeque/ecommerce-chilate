import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/features/cart/useCart";

export function StoreLayout() {
  const { t, i18n } = useTranslation();
  const { user, isStaff, signOut } = useAuth();
  const itemCount = useCart((s) => s.items.length);

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === "es" ? "en" : "es");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-white z-10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Chilate
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/tienda">{t("nav.shop")}</Link>
            <Link to="/carrito">
              {t("nav.cart")} ({itemCount})
            </Link>
            {isStaff && (
              <Link to="/admin" className="font-medium text-indigo-600">
                {t("nav.admin")}
              </Link>
            )}
            {user ? (
              <button onClick={signOut}>{t("nav.logout")}</button>
            ) : (
              <Link to="/login">{t("nav.login")}</Link>
            )}
            <button onClick={toggleLang} className="border rounded px-2 py-0.5">
              {i18n.language === "es" ? "EN" : "ES"}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        <Outlet />
      </main>

      <footer className="border-t p-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Chilate
      </footer>
    </div>
  );
}
