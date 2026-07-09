import type { ReactNode } from "react";
import { Card } from "./Card";
import { Spinner } from "./Spinner";

interface Props {
  headers: string[];
  minWidth?: string; // ej. "720px" — fuerza scroll horizontal en pantallas chicas
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyText?: string;
  children: ReactNode; // filas <tr> del tbody
}

// Tabla dentro de una tarjeta, con scroll horizontal, encabezados y estados de
// carga/vacío. Unifica las tablas del panel de administración.
export function DataTable({
  headers,
  minWidth = "640px",
  isLoading = false,
  isEmpty = false,
  emptyText = "Sin datos.",
  children,
}: Props) {
  return (
    <Card className="overflow-hidden">
      {isLoading ? (
        <Spinner />
      ) : isEmpty ? (
        <p className="p-8 text-center text-sm text-zinc-500">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth }}>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                {headers.map((h) => (
                  <th key={h} className="px-5 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">{children}</tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
