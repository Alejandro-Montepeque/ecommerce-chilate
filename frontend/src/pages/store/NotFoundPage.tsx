import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { useSeo } from "@/lib/seo";

export default function NotFoundPage() {
  const { t } = useTranslation();
  useSeo({ title: t("notFound.title") });

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl font-extrabold tracking-tight text-brand-600">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
        {t("notFound.title")}
      </h1>
      <p className="mt-2 text-zinc-500">{t("notFound.text")}</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>{t("notFound.back")}</Button>
      </Link>
    </div>
  );
}
