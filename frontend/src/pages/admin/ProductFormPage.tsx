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
import type { VariantInput } from "@/features/products/products.api";
import { alerts } from "@/lib/alerts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

function slugify(text: string) {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "producto"}-${Math.random().toString(36).slice(2, 6)}`;
}

const schema = z.object({
  nameEs: z.string().min(2, "Ingresa el nombre"),
  nameEn: z.string().optional(),
  descriptionEs: z.string().optional(),
  descriptionEn: z.string().optional(),
  categoryId: z.string().optional(),
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

  const comboKey = (s: string, c: string) => `${s}|${c}`;

  // Prefill en modo edición cuando llega el producto.
  useEffect(() => {
    if (!isEdit || !existing || prefilled) return;
    reset({
      nameEs: existing.nameEs,
      nameEn: existing.nameEn,
      descriptionEs: existing.descriptionEs ?? "",
      descriptionEn: existing.descriptionEn ?? "",
      categoryId: existing.categoryId ?? "",
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

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const combos = useMemo(() => {
    if (sizes.length && colors.length)
      return sizes.flatMap((s) => colors.map((c) => ({ size: s, color: c })));
    if (sizes.length) return sizes.map((s) => ({ size: s, color: "" }));
    if (colors.length) return colors.map((c) => ({ size: "", color: c }));
    return [{ size: "", color: "" }];
  }, [sizes, colors]);

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

    const payload = {
      slug: existing?.slug ?? slugify(form.nameEs),
      nameEs: form.nameEs,
      nameEn: form.nameEn || form.nameEs,
      descriptionEs: form.descriptionEs || null,
      descriptionEn: form.descriptionEn || null,
      priceUsd: form.priceUsd,
      isPublished: form.isPublished,
      categoryId: form.categoryId || undefined,
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
  const card = "rounded-2xl border border-zinc-200 bg-white p-6 shadow-card";
  const errMsg = (m?: string) =>
    m ? <p className="mt-1 text-xs text-red-600">{m}</p> : null;

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
      <div className={card}>
        <p className="mb-4 text-sm font-medium text-zinc-500">Información</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input label="Nombre (ES)" {...register("nameEs")} />
            {errMsg(errors.nameEs?.message)}
          </div>
          <Input label="Nombre (EN)" {...register("nameEn")} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-600">
              Descripción (ES)
            </span>
            <textarea
              {...register("descriptionEs")}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-600">
              Descripción (EN)
            </span>
            <textarea
              {...register("descriptionEn")}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-600">
              Categoría
            </span>
            <Select {...register("categoryId")}>
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEs}
                </option>
              ))}
            </Select>
          </label>
          <div>
            <Input
              label="Precio (USD)"
              type="number"
              step="0.01"
              {...register("priceUsd")}
            />
            {errMsg(errors.priceUsd?.message)}
          </div>
        </div>
      </div>

      {/* Imagen */}
      <div className={card}>
        <p className="mb-4 text-sm font-medium text-zinc-500">Imagen</p>
        <div className="flex items-center gap-4">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-400">
            {uploading ? (
              "Subiendo..."
            ) : preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-full w-full object-cover"
              />
            ) : (
              "Sin imagen"
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
            />
            <p className="mt-1 text-xs text-zinc-400">
              JPG o PNG · máx. {MAX_IMAGE_MB} MB
            </p>
          </div>
        </div>
      </div>

      {/* Tallas */}
      <div className={card}>
        <p className="mb-3 text-sm font-medium text-zinc-500">
          Tallas disponibles
        </p>
        <div className="flex flex-wrap gap-2">
          {sizeCatalog.map((sz) => {
            const s = sz.label;
            const active = sizes.includes(s);
            return (
              <button
                key={sz.id}
                type="button"
                onClick={() => setSizes(toggle(sizes, s))}
                className={`min-w-[2.5rem] rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colores */}
      <div className={card}>
        <p className="mb-3 text-sm font-medium text-zinc-500">
          Colores disponibles
        </p>
        <div className="flex flex-wrap gap-3">
          {colorCatalog.map((c) => {
            const active = colors.includes(c.name);
            return (
              <button
                key={c.id}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={active}
                onClick={() => setColors(toggle(colors, c.name))}
                className={`h-9 w-9 rounded-full border transition-transform hover:scale-110 ${
                  active
                    ? "border-brand-600 ring-2 ring-brand-600 ring-offset-2"
                    : "border-black/10"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* Matriz de stock */}
      <div className={card}>
        <p className="mb-3 text-sm font-medium text-zinc-500">
          Stock por variante
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((c) => {
            const key = comboKey(c.size, c.color);
            const hex = colorCatalog.find((x) => x.name === c.color)?.hex;
            const label =
              [c.size, c.color].filter(Boolean).join(" · ") || "Único";
            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2"
              >
                {hex && (
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: hex }}
                  />
                )}
                <span className="flex-1 truncate text-sm text-zinc-700">
                  {label}
                </span>
                <input
                  type="number"
                  min={0}
                  value={stock[key] ?? ""}
                  placeholder="0"
                  onChange={(e) =>
                    setStock((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                  className="w-16 rounded-lg border border-zinc-300 px-2 py-1 text-center text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            );
          })}
        </div>
      </div>

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
