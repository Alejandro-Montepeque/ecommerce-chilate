import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/features/cart/useCart";
import { useSiteContent } from "@/features/content/content.queries";
import { Logo } from "@/components/ui/Logo";
import { localized } from "@/i18n";

export function StoreLayout() {
  const { t, i18n } = useTranslation();
  const { user, isStaff, signOut } = useAuth();
  const itemCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const { data: content = [] } = useSiteContent();

  // Valores del footer editables desde el panel (con respaldo por si faltan).
  const footerVal = (key: string, fallback: string) => {
    const row = content.find((c) => c.key === key);
    const v = row ? localized(row, "value", i18n.language) : "";
    return v || fallback;
  };

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === "es" ? "en" : "es");

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors ${isActive ? "text-brand-600 font-medium" : "text-zinc-600 hover:text-zinc-900"}`;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-brand-600 px-4 py-2 text-center text-xs font-medium text-white">
        {t("announcement")}
      </div>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          <div className="flex items-center gap-5">
            <NavLink to="/tienda" className={navLink}>
              {t("nav.shop")}
            </NavLink>
            {isStaff && (
              <NavLink to="/admin" className={navLink}>
                {t("nav.admin")}
              </NavLink>
            )}
            {user ? (
              <button
                onClick={signOut}
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {t("nav.logout")}
              </button>
            ) : (
              <NavLink to="/login" className={navLink}>
                {t("nav.login")}
              </NavLink>
            )}

            <button
              onClick={toggleLang}
              className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
            >
              {i18n.language === "es" ? "EN" : "ES"}
            </button>

            <Link
              to="/carrito"
              className="relative rounded-lg p-2 text-zinc-700 transition-colors hover:bg-zinc-100"
              aria-label={t("nav.cart")}
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-zinc-500">
              {footerVal("footer_tagline", t("footer.tagline"))}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {footerVal("footer_shop_title", t("footer.shopCol"))}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>
                <Link to="/tienda" className="hover:text-zinc-900">
                  {t("nav.shop")}
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="hover:text-zinc-900">
                  {t("nav.cart")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {footerVal("footer_help_title", t("footer.helpCol"))}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>{footerVal("footer_help_shipping", t("footer.shipping"))}</li>
              <li>{footerVal("footer_help_returns", t("footer.returns"))}</li>
              <li>{footerVal("footer_help_contact", t("footer.contact"))}</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {footerVal("footer_contact_title", t("footer.contact"))}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>{footerVal("footer_email", "hola@chilate.com")}</li>
              {footerVal("footer_phone", "") && (
                <li>{footerVal("footer_phone", "")}</li>
              )}
              <li>{footerVal("footer_location", "San Salvador, SV")}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-100">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-zinc-400">
            © {new Date().getFullYear()} Chilate ·{" "}
            {footerVal("footer_rights", t("footer.rights"))}
          </p>
        </div>
      </footer>
    </div>
  );
}

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
