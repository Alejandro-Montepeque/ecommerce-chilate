import { useAuth } from "@/context/AuthContext";
import { can } from "@/features/auth/permissions";
import { useAdminProducts } from "@/features/products/products.queries";
import { useAdminBanners } from "@/features/banners/banners.queries";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;
  const showProducts = can.products(role);
  const showContent = can.content(role);

  const { data: products = [] } = useAdminProducts(showProducts);
  const { data: banners = [] } = useAdminBanners(showContent);
  const published = products.filter((p) => p.isPublished).length;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        Panel
      </h1>
      <p className="mb-8 text-zinc-500">Resumen de tu tienda</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {showProducts && (
          <>
            <Stat label="Productos" value={products.length} />
            <Stat label="Publicados" value={published} accent />
          </>
        )}
        {showContent && <Stat label="Banners" value={banners.length} />}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-card ${
        accent ? "border-brand-200 bg-brand-50" : "border-zinc-200 bg-white"
      }`}
    >
      <p
        className={`text-3xl font-semibold ${accent ? "text-brand-700" : "text-zinc-900"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}
