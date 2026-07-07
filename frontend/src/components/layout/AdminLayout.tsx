import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { can, ROLE_LABELS } from "@/features/auth/permissions";
import { Logo } from "@/components/ui/Logo";

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-50 text-brand-700"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="flex w-60 flex-col border-r border-zinc-200 bg-white p-4">
        <Link to="/" className="mb-6 flex items-center gap-2 px-1">
          <Logo showName={false} />
          <span className="font-semibold text-zinc-900">Admin</span>
        </Link>

        <nav className="flex flex-col gap-1">
          <NavLink to="/admin" end className={linkClass}>
            {t("admin.dashboard")}
          </NavLink>
          {can.products(user?.role) && (
            <>
              <NavLink to="/admin/productos" className={linkClass}>
                {t("admin.products")}
              </NavLink>
              <NavLink to="/admin/catalogos" className={linkClass}>
                Catálogos
              </NavLink>
            </>
          )}
          {can.content(user?.role) && (
            <>
              <NavLink to="/admin/banners" className={linkClass}>
                {t("admin.banners")}
              </NavLink>
              <NavLink to="/admin/contenido" className={linkClass}>
                {t("admin.content")}
              </NavLink>
            </>
          )}
          {can.users(user?.role) && (
            <NavLink to="/admin/usuarios" className={linkClass}>
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="mt-auto rounded-lg bg-zinc-50 p-3">
          <p className="truncate text-sm font-medium text-zinc-800">
            {user?.email}
          </p>
          <span className="mt-1 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">
            {user ? ROLE_LABELS[user.role] : ""}
          </span>
          <button
            onClick={signOut}
            className="mt-3 block text-sm text-red-600 hover:text-red-700"
          >
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
