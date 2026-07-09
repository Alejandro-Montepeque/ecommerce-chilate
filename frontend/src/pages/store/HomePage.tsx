import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { localized } from "@/i18n";
import { useActiveBanners } from "@/features/banners/banners.queries";
import { useSiteContent } from "@/features/content/content.queries";
import {
  usePublishedProducts,
  useCategories,
} from "@/features/products/products.queries";
import { ProductCard } from "@/features/products/ProductCard";
import { DiscountBanner } from "@/features/discounts/DiscountBanner";
import {
  Button,
  EmptyState,
  RefreshIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/ui";
import { useSeo } from "@/lib/seo";

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: banners = [] } = useActiveBanners();
  const { data: content = [] } = useSiteContent();
  const { data: products = [], isError: productsError } =
    usePublishedProducts();
  const { data: categories = [] } = useCategories();

  const byKey = (key: string) => content.find((c) => c.key === key);
  const hero = byKey("hero_title");
  const heroSub = byKey("hero_subtitle");
  const featured = products.slice(0, 6);

  // El título/descripción para SEO usan el hero editable; si no hay, textos base.
  useSeo({
    title: hero ? localized(hero, "value", lang) : t("seo.homeTitle"),
    description: heroSub
      ? localized(heroSub, "value", lang)
      : t("seo.homeDesc"),
  });

  return (
    <div className="space-y-16">
      <DiscountBanner />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-8 py-16 text-white sm:px-14 sm:py-24">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            Chilate · SV
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {hero ? localized(hero, "value", lang) : "Chilate"}
          </h1>
          <p className="mt-4 text-lg text-brand-50">
            {heroSub ? localized(heroSub, "value", lang) : ""}
          </p>
          <Link to="/tienda" className="mt-8 inline-block">
            <Button variant="inverted">{t("home.shopNow")} →</Button>
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-72 w-72 rounded-full bg-white/5" />
      </section>

      {/* Beneficios */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Benefit
          icon={<TruckIcon className="h-6 w-6" />}
          title={t("benefits.shippingTitle")}
          text={t("benefits.shippingText")}
        />
        <Benefit
          icon={<ShieldIcon className="h-6 w-6" />}
          title={t("benefits.secureTitle")}
          text={t("benefits.secureText")}
        />
        <Benefit
          icon={<RefreshIcon className="h-6 w-6" />}
          title={t("benefits.returnsTitle")}
          text={t("benefits.returnsText")}
        />
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900">
            {t("home.categories")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to="/tienda"
                className={`group relative overflow-hidden rounded-2xl p-8 text-white shadow-card transition-transform hover:-translate-y-0.5 ${categoryColor(i)}`}
              >
                <span className="text-xl font-semibold">
                  {localized(c, "name", lang)}
                </span>
                <span className="mt-1 block text-sm text-white/80">
                  {t("home.viewAll")} →
                </span>
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Banners */}
      {banners.length > 0 && (
        <section className="grid gap-5 md:grid-cols-2">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-card"
            >
              <h2 className="text-xl font-semibold text-zinc-900">
                {localized(banner, "title", lang)}
              </h2>
              <p className="mt-2 text-zinc-500">
                {localized(banner, "subtitle", lang)}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Destacados */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {t("home.featured")}
          </h2>
          <Link
            to="/tienda"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {t("home.viewAll")} →
          </Link>
        </div>
        {productsError ? (
          <EmptyState>{t("common.error")}</EmptyState>
        ) : featured.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500">
            {t("home.emptyFeatured")}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="rounded-3xl border border-zinc-200 bg-zinc-900 px-8 py-14 text-center text-white">
        <h2 className="text-3xl font-semibold tracking-tight">
          {t("home.ctaTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-zinc-300">
          {t("home.ctaText")}
        </p>
        <Link to="/tienda" className="mt-6 inline-block">
          <Button className="bg-brand-600 hover:bg-brand-700">
            {t("home.shopNow")} →
          </Button>
        </Link>
      </section>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-card">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="font-medium text-zinc-900">{title}</p>
        <p className="text-sm text-zinc-500">{text}</p>
      </div>
    </div>
  );
}

// Colores rotativos para las tarjetas de categoría (rosa · salvia · taupe).
function categoryColor(i: number) {
  const colors = [
    "bg-gradient-to-br from-brand-500 to-brand-700",
    "bg-gradient-to-br from-sage-400 to-sage-600",
    "bg-gradient-to-br from-zinc-600 to-zinc-800",
  ];
  return colors[i % colors.length];
}
