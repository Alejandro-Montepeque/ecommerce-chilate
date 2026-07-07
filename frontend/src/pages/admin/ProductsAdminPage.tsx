import { Link } from "react-router-dom";
import {
  useAdminProducts,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/products/products.queries";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { alerts } from "@/lib/alerts";
import { resolveImageUrl } from "@/features/products/image";
import type { Product } from "@/types";

export default function ProductsAdminPage() {
  const { data: products = [], isLoading } = useAdminProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  if (isLoading) return <Spinner />;

  const togglePublish = (p: Product) =>
    updateProduct.mutate({
      id: p.id,
      data: {
        slug: p.slug,
        nameEs: p.nameEs,
        nameEn: p.nameEn,
        descriptionEs: p.descriptionEs,
        descriptionEn: p.descriptionEn,
        priceUsd: Number(p.priceUsd),
        isPublished: !p.isPublished,
        categoryId: p.categoryId ?? undefined,
      },
    });

  const stockOf = (p: Product) =>
    (p.variants ?? []).reduce((n, v) => n + v.stock, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Productos
        </h1>
        <Link to="/admin/productos/nuevo">
          <Button>+ Nuevo producto</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card">
        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">
            Aún no hay productos. Crea el primero.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-5 py-3 font-medium">Producto</th>
                <th className="px-5 py-3 font-medium">Precio</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        {p.images?.[0] && (
                          <img
                            src={resolveImageUrl(p.images[0].url)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium text-zinc-900">
                        {p.nameEs}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-600">
                    ${Number(p.priceUsd).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-zinc-600">{stockOf(p)}</td>
                  <td className="px-5 py-3">
                    {p.isPublished ? (
                      <Badge tone="success">Publicado</Badge>
                    ) : (
                      <Badge>Borrador</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/productos/${p.id}/editar`}>
                        <Button size="sm" variant="secondary">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => togglePublish(p)}
                      >
                        {p.isPublished ? "Despublicar" : "Publicar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          const ok = await alerts.confirm(
                            `¿Eliminar "${p.nameEs}"?`,
                            "Esta acción no se puede deshacer.",
                          );
                          if (ok)
                            deleteProduct.mutate(p.id, {
                              onSuccess: () =>
                                alerts.success("Producto eliminado"),
                            });
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
