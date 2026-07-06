import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded ${isActive ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`;

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r p-4 flex flex-col gap-1">
        <Link to="/" className="text-lg font-bold mb-4">
          Chilate · Admin
        </Link>
        <NavLink to="/admin" end className={linkClass}>
          {t("admin.dashboard")}
        </NavLink>
        <NavLink to="/admin/productos" className={linkClass}>
          {t("admin.products")}
        </NavLink>
        <NavLink to="/admin/banners" className={linkClass}>
          {t("admin.banners")}
        </NavLink>
        <NavLink to="/admin/contenido" className={linkClass}>
          {t("admin.content")}
        </NavLink>
        <div className="mt-auto text-xs text-gray-500">
          {user?.email}
          <br />
          <span className="uppercase font-medium">{user?.role}</span>
          <button onClick={signOut} className="block mt-2 text-red-600">
            {t("nav.logout")}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
