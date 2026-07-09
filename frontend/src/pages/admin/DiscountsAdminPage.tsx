import { useState } from "react";
import { useAdminProducts } from "@/features/products/products.queries";
import {
  useDiscounts,
  useCreateDiscount,
  useDeleteDiscount,
} from "@/features/discounts/discounts.queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { alerts } from "@/lib/alerts";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  });

// Inicio del día siguiente (los descuentos solo empiezan desde mañana).
function tomorrowStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

// Formatea una fecha a "YYYY-MM-DDTHH:mm" en hora local (para datetime-local).
function toLocalInput(d: Date) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
}

// Mínimo permitido: mañana a las 00:00.
function tomorrowLocalInput() {
  return toLocalInput(tomorrowStart());
}

// Valores por defecto: inicio mañana 09:00, fin una semana después.
function defaultStart() {
  const d = tomorrowStart();
  d.setHours(9, 0, 0, 0);
  return toLocalInput(d);
}
function defaultEnd() {
  const d = tomorrowStart();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + 7);
  return toLocalInput(d);
}

export default function DiscountsAdminPage() {
  const { data: products = [] } = useAdminProducts();
  const { data: discounts = [], isLoading } = useDiscounts();
  const create = useCreateDiscount();
  const del = useDeleteDiscount();

  const [productId, setProductId] = useState("");
  const [percent, setPercent] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [endsAt, setEndsAt] = useState(defaultEnd);

  const now = Date.now();

  // Al cambiar el inicio, mantén el fin siempre posterior (evita fechas iguales).
  function handleStartChange(value: string) {
    setStartsAt(value);
    if (value && (!endsAt || new Date(endsAt) <= new Date(value))) {
      const next = new Date(value);
      next.setDate(next.getDate() + 7);
      setEndsAt(toLocalInput(next));
    }
  }

  function submit() {
    const p = Number(percent);
    if (!productId) return alerts.error("Elige un producto.");
    if (!(p > 0 && p <= 100))
      return alerts.error("El porcentaje debe ser entre 1 y 100.");
    if (!startsAt || !endsAt) return alerts.error("Indica las fechas.");
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (start < tomorrowStart())
      return alerts.error(
        "El descuento debe empezar a partir del día siguiente.",
      );
    if (end <= start)
      return alerts.error("La fecha de fin debe ser posterior al inicio.");

    create.mutate(
      {
        productId,
        percent: p,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      },
      {
        onSuccess: () => {
          setProductId("");
          setPercent("");
          setStartsAt(defaultStart());
          setEndsAt(defaultEnd());
          alerts.success("Descuento programado");
        },
        onError: (e) => alerts.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  const status = (d: { startsAt: string; endsAt: string }) => {
    const s = new Date(d.startsAt).getTime();
    const e = new Date(d.endsAt).getTime();
    if (now < s) return <Badge tone="brand">Programado</Badge>;
    if (now > e) return <Badge>Finalizado</Badge>;
    return <Badge tone="success">Activo</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Descuentos programados"
        subtitle="Programa descuentos por producto con fecha de inicio y fin. La tienda aplica el precio rebajado automáticamente dentro del rango."
      />

      {/* Nuevo descuento */}
      <Card className="mb-6 p-6">
        <p className="mb-4 text-sm font-medium text-zinc-500">
          Nuevo descuento
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Producto"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Selecciona…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameEs}
              </option>
            ))}
          </Select>
          <Input
            label="Descuento (%)"
            type="number"
            min="1"
            max="100"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
          />
          <Input
            label="Inicio"
            type="datetime-local"
            min={tomorrowLocalInput()}
            value={startsAt}
            onChange={(e) => handleStartChange(e.target.value)}
          />
          <Input
            label="Fin"
            type="datetime-local"
            min={startsAt || tomorrowLocalInput()}
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
        <Button className="mt-4" onClick={submit} disabled={create.isPending}>
          Programar descuento
        </Button>
      </Card>

      {/* Lista */}
      <DataTable
        headers={["Producto", "%", "Vigencia", "Estado", ""]}
        minWidth="680px"
        isLoading={isLoading}
        isEmpty={discounts.length === 0}
        emptyText="No hay descuentos programados."
      >
        {discounts.map((d) => (
          <tr key={d.id} className="hover:bg-zinc-50/50">
            <td className="px-5 py-3 font-medium text-zinc-900">
              {d.product?.nameEs ?? "—"}
            </td>
            <td className="px-5 py-3 text-zinc-700">-{d.percent}%</td>
            <td className="px-5 py-3 text-xs text-zinc-500">
              {fmt(d.startsAt)} → {fmt(d.endsAt)}
            </td>
            <td className="px-5 py-3">{status(d)}</td>
            <td className="px-5 py-3 text-right">
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  if (await alerts.confirm("¿Eliminar este descuento?"))
                    del.mutate(d.id, {
                      onSuccess: () => alerts.success("Eliminado"),
                    });
                }}
              >
                Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
