import { useState } from "react";
import {
  useSizes,
  useCreateSize,
  useDeleteSize,
  useColors,
  useCreateColor,
  useDeleteColor,
  useCategoriesAdmin,
  useCreateCategory,
  useDeleteCategory,
} from "@/features/catalog/catalog.queries";
import { Button, Card, Input, Spinner } from "@/components/ui";
import { slugify } from "@/lib/slugify";
import { alerts } from "@/lib/alerts";

export default function CatalogsAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Catálogos
        </h1>
        <p className="text-zinc-500">
          Gestiona las categorías, colores y tallas disponibles para los
          productos.
        </p>
      </div>
      <Categories />
      <Colors />
      <Sizes />
    </div>
  );
}

function Categories() {
  const { data = [], isLoading } = useCategoriesAdmin();
  const create = useCreateCategory();
  const del = useDeleteCategory();
  const [es, setEs] = useState("");
  const [en, setEn] = useState("");

  const add = () => {
    if (!es.trim()) return alerts.error("Ingresa el nombre de la categoría.");
    create.mutate(
      { slug: slugify(es), nameEs: es, nameEn: en || es },
      {
        onSuccess: () => {
          setEs("");
          setEn("");
          alerts.success("Categoría agregada");
        },
        onError: (e) => alerts.error(e instanceof Error ? e.message : "Error"),
      },
    );
  };

  return (
    <Card className="p-6">
      <p className="mb-4 text-sm font-medium text-zinc-900">Categorías</p>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Nombre (ES)"
          value={es}
          onChange={(e) => setEs(e.target.value)}
        />
        <Input
          label="Nombre (EN)"
          value={en}
          onChange={(e) => setEn(e.target.value)}
        />
        <Button onClick={add} disabled={create.isPending}>
          Agregar
        </Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <ul className="divide-y divide-zinc-100">
          {data.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-800">
                {c.nameEs} <span className="text-zinc-400">/ {c.nameEn}</span>
              </span>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  if (await alerts.confirm(`¿Eliminar "${c.nameEs}"?`))
                    del.mutate(c.id, {
                      onSuccess: () => alerts.success("Eliminada"),
                    });
                }}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Colors() {
  const { data = [], isLoading } = useColors();
  const create = useCreateColor();
  const del = useDeleteColor();
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#111111");

  const add = () => {
    if (!name.trim()) return alerts.error("Ingresa el nombre del color.");
    create.mutate(
      { name, hex },
      {
        onSuccess: () => {
          setName("");
          setHex("#111111");
          alerts.success("Color agregado");
        },
        onError: (e) => alerts.error(e instanceof Error ? e.message : "Error"),
      },
    );
  };

  return (
    <Card className="p-6">
      <p className="mb-4 text-sm font-medium text-zinc-900">Colores</p>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-600">Color</span>
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-lg border border-zinc-300"
          />
        </label>
        <Button onClick={add} disabled={create.isPending}>
          Agregar
        </Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {data.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-full border border-zinc-200 py-1 pl-1 pr-2"
            >
              <span
                className="h-6 w-6 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-sm text-zinc-700">{c.name}</span>
              <button
                onClick={async () => {
                  if (await alerts.confirm(`¿Eliminar "${c.name}"?`))
                    del.mutate(c.id, {
                      onSuccess: () => alerts.success("Eliminado"),
                    });
                }}
                className="text-zinc-400 hover:text-red-600"
                aria-label="Eliminar"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Sizes() {
  const { data = [], isLoading } = useSizes();
  const create = useCreateSize();
  const del = useDeleteSize();
  const [label, setLabel] = useState("");

  const add = () => {
    if (!label.trim()) return alerts.error("Ingresa la talla.");
    create.mutate(label.trim().toUpperCase(), {
      onSuccess: () => {
        setLabel("");
        alerts.success("Talla agregada");
      },
      onError: (e) => alerts.error(e instanceof Error ? e.message : "Error"),
    });
  };

  return (
    <Card className="p-6">
      <p className="mb-4 text-sm font-medium text-zinc-900">Tallas</p>
      <div className="mb-4 flex items-end gap-3">
        <Input
          label="Talla (ej. S, M, 38)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Button onClick={add} disabled={create.isPending}>
          Agregar
        </Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {data.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5"
            >
              <span className="text-sm font-medium text-zinc-700">
                {s.label}
              </span>
              <button
                onClick={async () => {
                  if (await alerts.confirm(`¿Eliminar la talla "${s.label}"?`))
                    del.mutate(s.id, {
                      onSuccess: () => alerts.success("Eliminada"),
                    });
                }}
                className="text-zinc-400 hover:text-red-600"
                aria-label="Eliminar"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
