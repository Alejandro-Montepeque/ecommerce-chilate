import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateProduct,
  useUpdateProduct,
  useAdminProducts,
  useCategories,
} from "@/features/products/products.queries";
import { useSizes, useColors } from "@/features/catalog/catalog.queries";
import {
  uploadImage,
  validateImage,
  MAX_IMAGE_MB,
} from "@/features/products/upload";
import { resolveImageUrl } from "@/features/products/image";
import {
  SUBCATEGORIES,
  subcategoryLabel,
} from "@/features/products/subcategory";
import type {
  VariantInput,
  ProductInput,
} from "@/features/products/products.api";
import {
  buildCombos,
  comboKey,
  toggleValue,
  ImageField,
  SizeSelector,
  ColorSelector,
  StockMatrix,
} from "@/features/products/form";
import { slugify } from "@/lib/slugify";
import { alerts } from "@/lib/alerts";
import {
  Button,
  Card,
  Input,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";

// Slug único: base legible + sufijo corto aleatorio para evitar colisiones.
const uniqueSlug = (name: string) =>
  `${slugify(name) || "producto"}-${Math.random().toString(36).slice(2, 6)}`;

const schema = z.object({
  nameEs: z.string().min(2, "Ingresa el nombre"),
  nameEn: z.string().optional(),
  descriptionEs: z.string().optional(),
  descriptionEn: z.string().optional(),
  categoryId: z.string().optional(),
  subcategory: z.string().optional(),
  priceUsd: z.coerce.number().positive("El precio debe ser mayor a 0"),
  isPublished: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const { data: sizeCatalog = [] } = useSizes();
  const { data: colorCatalog = [] } = useColors();
  const { data: products = [], isLoading } = useAdminProducts();
  const existing = isEdit ? products.find((p) => p.id === id) : undefined;

  const [image, setImage] = useState<string | null>(null); // valor a guardar (URL)
  const [preview, setPreview] = useState<string | null>(null); // solo para mostrar
  const [uploading, setUploading] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [prefilled, setPrefilled] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isPublished: true },
  });

  // Prefill en modo edición cuando llega el producto.
  useEffect(() => {
    if (!isEdit || !existing || prefilled) return;
    reset({
      nameEs: existing.nameEs,
      nameEn: existing.nameEn,
      descriptionEs: existing.descriptionEs ?? "",
      descriptionEn: existing.descriptionEn ?? "",
      categoryId: existing.categoryId ?? "",
      subcategory: existing.subcategory ?? "",
      priceUsd: Number(existing.priceUsd),
      isPublished: existing.isPublished,
    });
    const vs = existing.variants ?? [];
    setSizes([...new Set(vs.map((v) => v.size).filter(Boolean) as string[])]);
    setColors([...new Set(vs.map((v) => v.color).filter(Boolean) as string[])]);
    const st: Record<string, number> = {};
    vs.forEach((v) => (st[comboKey(v.size ?? "", v.color ?? "")] = v.stock));
    setStock(st);
    setImage(existing.images?.[0]?.url ?? null);
    setPreview(resolveImageUrl(existing.images?.[0]?.url));
    setPrefilled(true);
  }, [isEdit, existing, prefilled, reset]);

  const combos = useMemo(() => buildCombos(sizes, colors), [sizes, colors]);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      alerts.error(error);
      e.target.value = ""; // permite reintentar con el mismo archivo
      return;
    }

    // Preview local inmediata desde el archivo (siempre carga, no depende del bucket).
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    setUploading(true);
    try {
      setImage(await uploadImage(file));
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = handleSubmit(async (form) => {
    const variants: VariantInput[] = combos.map((c) => ({
      size: c.size || undefined,
      color: c.color || undefined,
      colorHex: colorCatalog.find((x) => x.name === c.color)?.hex,
      stock: stock[comboKey(c.size, c.color)] ?? 0,
    }));

    if (variants.reduce((n, v) => n + v.stock, 0) <= 0) {
      alerts.error("Agrega stock a por lo menos una talla o color.");
      return;
    }

    const payload: ProductInput = {
      slug: existing?.slug ?? uniqueSlug(form.nameEs),
      nameEs: form.nameEs,
      nameEn: form.nameEn || form.nameEs,
      descriptionEs: form.descriptionEs || null,
      descriptionEn: form.descriptionEn || null,
      priceUsd: form.priceUsd,
      isPublished: form.isPublished,
      categoryId: form.categoryId || undefined,
      subcategory:
        (form.subcategory as ProductInput["subcategory"]) || undefined,
      variants,
      images: image ? [{ url: image }] : undefined,
    };

    try {
      if (isEdit && existing) {
        await updateProduct.mutateAsync({ id: existing.id, data: payload });
        await alerts.success("Producto actualizado");
      } else {
        await createProduct.mutateAsync(payload);
        await alerts.success("Producto creado");
      }
      navigate("/admin/productos");
    } catch (e) {
      alerts.error(e instanceof Error ? e.message : "Error al guardar");
    }
  });

  if (isEdit && isLoading) return <Spinner />;
  if (isEdit && !existing)
    return <p className="text-zinc-500">Producto no encontrado.</p>;

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {isEdit ? "Editar producto" : "Nuevo producto"}
        </h1>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>

      {/* Datos básicos */}
      <Card className="p-6">
        <p className="mb-4 text-sm font-medium text-zinc-500">Información</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre (ES)"
            error={errors.nameEs?.message}
            {...register("nameEs")}
          />
          <Input label="Nombre (EN)" {...register("nameEn")} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Textarea
            label="Descripción (ES)"
            rows={2}
            {...register("descriptionEs")}
          />
          <Textarea
            label="Descripción (EN)"
            rows={2}
            {...register("descriptionEn")}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Select label="Categoría" {...register("categoryId")}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEs}
              </option>
            ))}
          </Select>
          <Select label="Subcategoría" {...register("subcategory")}>
            <option value="">Sin especificar</option>
            {SUBCATEGORIES.map((s) => (
              <option key={s} value={s}>
                {subcategoryLabel(s, "es")}
              </option>
            ))}
          </Select>
          <Input
            label="Precio (USD)"
            type="number"
            step="0.01"
            error={errors.priceUsd?.message}
            {...register("priceUsd")}
          />
        </div>
      </Card>

      <ImageField
        preview={preview}
        uploading={uploading}
        maxMb={MAX_IMAGE_MB}
        onFile={handleImage}
      />

      <SizeSelector
        catalog={sizeCatalog}
        selected={sizes}
        onToggle={(label) => setSizes(toggleValue(sizes, label))}
      />

      <ColorSelector
        catalog={colorCatalog}
        selected={colors}
        onToggle={(name) => setColors(toggleValue(colors, name))}
      />

      <StockMatrix
        combos={combos}
        colorCatalog={colorCatalog}
        stock={stock}
        onChange={(key, value) =>
          setStock((prev) => ({ ...prev, [key]: value }))
        }
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            {...register("isPublished")}
            className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
          />
          Publicado
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>
    </form>
  );
}
