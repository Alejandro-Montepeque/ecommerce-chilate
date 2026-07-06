import { useTranslation } from "react-i18next";
import { localized } from "@/i18n";
import { useActiveBanners } from "@/features/banners/banners.queries";
import { useSiteContent } from "@/features/content/content.queries";
import type { SiteContent } from "@/types";

export default function HomePage() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const { data: banners = [] } = useActiveBanners();
  const { data: content = [] } = useSiteContent();

  const byKey = (key: string): SiteContent | undefined =>
    content.find((c) => c.key === key);
  const hero = byKey("hero_title");
  const heroSub = byKey("hero_subtitle");

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold">
          {hero ? localized(hero, "value", lang) : ""}
        </h1>
        <p className="mt-3 text-gray-600">
          {heroSub ? localized(heroSub, "value", lang) : ""}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {banners.map((banner) => (
          <div key={banner.id} className="rounded-lg border bg-gray-50 p-6">
            <h2 className="text-xl font-semibold">
              {localized(banner, "title", lang)}
            </h2>
            <p className="text-gray-600">
              {localized(banner, "subtitle", lang)}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
