import { useEffect, useState } from "react";
import {
  useSiteContent,
  useUpdateContent,
} from "@/features/content/content.queries";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { SiteContent } from "@/types";

export default function ContentAdminPage() {
  const { data, isLoading } = useSiteContent();
  const updateContent = useUpdateContent();
  const [rows, setRows] = useState<SiteContent[]>([]);

  // Copia editable local sincronizada con el fetch.
  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  if (isLoading) return <Spinner />;

  const update = (key: string, field: "valueEs" | "valueEn", value: string) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contenido</h1>
      <div className="space-y-6">
        {rows.map((row) => (
          <div key={row.key} className="border rounded-lg p-4">
            <p className="font-mono text-xs text-gray-500 mb-2">{row.key}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <textarea
                value={row.valueEs ?? ""}
                onChange={(e) => update(row.key, "valueEs", e.target.value)}
                className="border rounded p-2"
                rows={2}
                placeholder="Español"
              />
              <textarea
                value={row.valueEn ?? ""}
                onChange={(e) => update(row.key, "valueEn", e.target.value)}
                className="border rounded p-2"
                rows={2}
                placeholder="English"
              />
            </div>
            <Button
              className="mt-2"
              onClick={() =>
                updateContent.mutate({
                  key: row.key,
                  valueEs: row.valueEs ?? undefined,
                  valueEn: row.valueEn ?? undefined,
                })
              }
            >
              Guardar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
