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
import { Spinner } from "@/components/ui/Spinner";
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
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        Descuentos programados
      </h1>
      <p className="mb-6 text-zinc-500">
        Programa descuentos por producto con fecha de inicio y fin. La tienda
        aplica el precio rebajado automáticamente dentro del rango.
      </p>

      {/* Nuevo descuento */}
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card">
        <p className="mb-4 text-sm font-medium text-zinc-500">
          Nuevo descuento
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-600">
              Producto
            </span>
            <Select
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
          </label>
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
      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card">
        {isLoading ? (
          <Spinner />
        ) : discounts.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">
            No hay descuentos programados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">%</th>
                  <th className="px-5 py-3 font-medium">Vigencia</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
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
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
