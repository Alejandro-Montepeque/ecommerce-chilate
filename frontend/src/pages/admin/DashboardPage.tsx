import { useAdminProducts } from "@/features/products/products.queries";
import { useAdminBanners } from "@/features/banners/banners.queries";

export default function DashboardPage() {
  const { data: products = [] } = useAdminProducts();
  const { data: banners = [] } = useAdminBanners();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel</h1>
      <div className="grid gap-4 sm:grid-cols-2 max-w-md">
        <Stat label="Productos" value={products.length} />
        <Stat label="Banners" value={banners.length} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-6">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-gray-500">{label}</p>
    </div>
  );
}
