import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/features/wishlist/wishlist.queries";
import { ProductCard } from "@/features/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function WishlistPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: products = [], isLoading } = useWishlist();

  if (!user)
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-card">
        <p className="text-zinc-500">{t("wishlist.loginRequired")}</p>
        <Link to="/login" className="mt-4 inline-block">
          <Button>{t("nav.login")}</Button>
        </Link>
      </div>
    );

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-900">
        {t("wishlist.title")}
      </h1>
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center text-zinc-500">
          {t("wishlist.empty")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
