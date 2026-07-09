import { Suspense, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { can, ROLE_LABELS } from "@/features/auth/permissions";
import { Logo, Spinner } from "@/components/ui";

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-brand-50 text-brand-700"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  const sidebar = (
    <div className="flex h-full flex-col p-4">
      <Link
        to="/"
        className="mb-6 flex items-center gap-2 px-1"
        onClick={close}
      >
        <Logo showName={false} />
        <span className="font-extrabold text-zinc-900">Admin</span>
      </Link>

      <nav className="flex flex-col gap-1" onClick={close}>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-brand-700"
        >
          <HomeIcon />
          Ir al inicio
        </Link>
        <div className="my-1 border-t border-zinc-200" />
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
            <NavLink to="/admin/descuentos" className={linkClass}>
              Descuentos
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
        {can.audit(user?.role) && (
          <NavLink to="/admin/auditoria" className={linkClass}>
            Auditoría
          </NavLink>
        )}
      </nav>

      <div className="mt-auto rounded-2xl bg-zinc-50 p-3">
        <p className="truncate text-sm font-semibold text-zinc-800">
          {user?.email}
        </p>
        <span className="mt-1 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700">
          {user ? ROLE_LABELS[user.role] : ""}
        </span>
        <button
          onClick={signOut}
          className="mt-3 block text-sm font-semibold text-red-600 hover:text-red-700"
        >
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Barra superior (móvil/tablet) */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <Logo showName={false} />
          <span className="font-extrabold text-zinc-900">Admin</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          <MenuIcon />
        </button>
      </div>

      <div className="lg:flex">
        {/* Backdrop del drawer (móvil) */}
        {open && (
          <div
            onClick={close}
            className="fixed inset-0 z-30 bg-zinc-900/40 lg:hidden"
            aria-hidden
          />
        )}

        {/* Sidebar: estática en escritorio, drawer deslizable en móvil */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-zinc-200 bg-white shadow-card transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {sidebar}
        </aside>

        <main className="min-w-0 flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-4xl">
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
