import {
  useAdminProducts,
  useUpdateProduct,
} from "@/features/products/products.queries";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { Product } from "@/types";

// Listado + publicar/despublicar. Extensible con formulario completo de
// creación/edición de variantes e imágenes.
export default function ProductsAdminPage() {
  const { data: products = [], isLoading } = useAdminProducts();
  const updateProduct = useUpdateProduct();

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Productos</h1>
      <table className="w-full text-sm">
        <thead className="text-left border-b">
          <tr>
            <th className="py-2">Nombre (ES)</th>
            <th>Precio</th>
            <th>Publicado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.nameEs}</td>
              <td>${Number(p.priceUsd).toFixed(2)}</td>
              <td>{p.isPublished ? "Sí" : "No"}</td>
              <td className="text-right">
                <Button variant="secondary" onClick={() => togglePublish(p)}>
                  {p.isPublished ? "Despublicar" : "Publicar"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
