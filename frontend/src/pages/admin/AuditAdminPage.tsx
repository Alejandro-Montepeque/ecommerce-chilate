import { useState } from "react";
import { useAuditLogs, type AuditLog } from "@/features/audit/audit.queries";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";

const TAKE = 25;

const ACTION_LABEL: Record<AuditLog["action"], string> = {
  CREATE: "Creó",
  UPDATE: "Editó",
  DELETE: "Eliminó",
};
const ACTION_TONE: Record<AuditLog["action"], "success" | "brand" | "warning"> =
  { CREATE: "success", UPDATE: "brand", DELETE: "warning" };

// Nombres legibles de las entidades registradas.
const ENTITY_LABEL: Record<string, string> = {
  products: "Producto",
  categories: "Categoría",
  colors: "Color",
  sizes: "Talla",
  discounts: "Descuento",
  banners: "Banner",
  content: "Contenido",
  users: "Usuario",
  collections: "Colección",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function AuditAdminPage() {
  const [skip, setSkip] = useState(0);
  const { data, isLoading, isFetching } = useAuditLogs(TAKE, skip);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <PageHeader
        title="Auditoría"
        subtitle="Registro de acciones de los usuarios internos (crear, editar y eliminar). Solo visible para administradores."
      />

      <DataTable
        headers={["Fecha", "Usuario", "Acción", "Elemento", "Detalle"]}
        minWidth="720px"
        isLoading={isLoading}
        isEmpty={items.length === 0}
        emptyText="Aún no hay acciones registradas."
      >
        {items.map((log) => (
          <tr key={log.id} className="hover:bg-zinc-50/50">
            <td className="whitespace-nowrap px-5 py-3 text-xs text-zinc-500">
              {fmt(log.createdAt)}
            </td>
            <td className="px-5 py-3">
              <p className="font-medium text-zinc-900">{log.actorEmail}</p>
              <p className="text-xs text-zinc-400">{log.actorRole}</p>
            </td>
            <td className="px-5 py-3">
              <Badge tone={ACTION_TONE[log.action]}>
                {ACTION_LABEL[log.action]}
              </Badge>
            </td>
            <td className="px-5 py-3 text-zinc-700">
              {ENTITY_LABEL[log.entity] ?? log.entity}
            </td>
            <td className="px-5 py-3 text-zinc-500">
              {log.details ||
                (log.entityId ? `#${log.entityId.slice(0, 8)}` : "—")}
            </td>
          </tr>
        ))}
      </DataTable>

      {total > TAKE && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {skip + 1}–{Math.min(skip + TAKE, total)} de {total}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={skip === 0 || isFetching}
              onClick={() => setSkip((s) => Math.max(s - TAKE, 0))}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={skip + TAKE >= total || isFetching}
              onClick={() => setSkip((s) => s + TAKE)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
