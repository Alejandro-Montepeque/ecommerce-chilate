import { Suspense, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/features/cart/useCart";
import { useSiteContent } from "@/features/content/content.queries";
import { Logo, Spinner } from "@/components/ui";
import { localized } from "@/i18n";

export function StoreLayout() {
  const { t, i18n } = useTranslation();
  const { user, isStaff, signOut } = useAuth();
  const itemCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const { data: content = [] } = useSiteContent();
  const [menuOpen, setMenuOpen] = useState(false);

  // Valores del footer editables desde el panel (con respaldo por si faltan).
  const footerVal = (key: string, fallback: string) => {
    const row = content.find((c) => c.key === key);
    const v = row ? localized(row, "value", i18n.language) : "";
    return v || fallback;
  };

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === "es" ? "en" : "es");

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? "text-brand-700" : "text-zinc-600 hover:text-brand-700"
    }`;

  // Enlaces del menú (se reutilizan en escritorio y móvil).
  const links = (
    <>
      <NavLink
        to="/"
        end
        className={navLink}
        onClick={() => setMenuOpen(false)}
      >
        {t("nav.home")}
      </NavLink>
      <NavLink
        to="/tienda"
        className={navLink}
        onClick={() => setMenuOpen(false)}
      >
        {t("nav.shop")}
      </NavLink>
      {isStaff && (
        <NavLink
          to="/admin"
          className={navLink}
          onClick={() => setMenuOpen(false)}
        >
          {t("nav.admin")}
        </NavLink>
      )}
      {user && (
        <NavLink
          to="/favoritos"
          className={navLink}
          onClick={() => setMenuOpen(false)}
        >
          {t("nav.wishlist")}
        </NavLink>
      )}
      {user ? (
        <button
          onClick={() => {
            setMenuOpen(false);
            signOut();
          }}
          className="text-left text-sm font-semibold text-zinc-600 transition-colors hover:text-brand-700"
        >
          {t("nav.logout")}
        </button>
      ) : (
        <NavLink
          to="/login"
          className={navLink}
          onClick={() => setMenuOpen(false)}
        >
          {t("nav.login")}
        </NavLink>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-center text-xs font-semibold text-white">
        {t("announcement")}
      </div>

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-50/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          {/* Navegación de escritorio */}
          <div className="hidden items-center gap-7 md:flex">{links}</div>

          {/* Controles siempre visibles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleLang}
              className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-bold text-zinc-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {i18n.language === "es" ? "EN" : "ES"}
            </button>

            <Link
              to="/carrito"
              className="relative rounded-full p-2 text-zinc-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              aria-label={t("nav.cart")}
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Hamburguesa (solo móvil/tablet) */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-brand-50 hover:text-brand-700 md:hidden"
              aria-label="Menú"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>

        {/* Panel de navegación móvil */}
        {menuOpen && (
          <div className="animate-fade-in border-t border-zinc-200 bg-zinc-50 md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5">
              {links}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-zinc-500">
              {footerVal("footer_tagline", t("footer.tagline"))}
            </p>
          </div>
          <FooterCol
            title={footerVal("footer_shop_title", t("footer.shopCol"))}
          >
            <li>
              <Link
                to="/tienda"
                className="transition-colors hover:text-brand-700"
              >
                {t("nav.shop")}
              </Link>
            </li>
            <li>
              <Link
                to="/carrito"
                className="transition-colors hover:text-brand-700"
              >
                {t("nav.cart")}
              </Link>
            </li>
          </FooterCol>
          <FooterCol
            title={footerVal("footer_help_title", t("footer.helpCol"))}
          >
            <li>{footerVal("footer_help_shipping", t("footer.shipping"))}</li>
            <li>{footerVal("footer_help_returns", t("footer.returns"))}</li>
            <li>{footerVal("footer_help_contact", t("footer.contact"))}</li>
          </FooterCol>
          <FooterCol
            title={footerVal("footer_contact_title", t("footer.contact"))}
          >
            <li>{footerVal("footer_email", "hola@chilate.com")}</li>
            {footerVal("footer_phone", "") && (
              <li>{footerVal("footer_phone", "")}</li>
            )}
            <li>{footerVal("footer_location", "San Salvador, SV")}</li>
          </FooterCol>
        </div>
        <div className="border-t border-zinc-100">
          <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-zinc-400 sm:text-left">
            © {new Date().getFullYear()} Chilate ·{" "}
            {footerVal("footer_rights", t("footer.rights"))} · Hecho en El
            Salvador
          </p>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-zinc-900">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-zinc-500">{children}</ul>
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

function CloseIcon() {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
