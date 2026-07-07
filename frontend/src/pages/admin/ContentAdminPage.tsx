import { useEffect, useState } from "react";
import {
  useSiteContent,
  useUpdateContent,
} from "@/features/content/content.queries";
import {
  CONTENT_KEYS,
  CONTENT_GROUPS,
  type ContentGroup,
} from "@/features/content/keys";
import { LogoManager } from "@/features/content/LogoManager";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { alerts } from "@/lib/alerts";

type Values = Record<string, { valueEs: string; valueEn: string }>;

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export default function ContentAdminPage() {
  const { data, isLoading } = useSiteContent();
  const updateContent = useUpdateContent();
  const [values, setValues] = useState<Values>({});
  const [tab, setTab] = useState<ContentGroup>("brand");

  useEffect(() => {
    const map: Values = {};
    // Base: los valores por defecto del catálogo.
    for (const ck of CONTENT_KEYS)
      map[ck.key] = {
        valueEs: ck.defaultEs ?? "",
        valueEn: ck.defaultEn ?? "",
      };
    // Sobrescribe con lo guardado; si está vacío, conserva el default.
    (data ?? []).forEach((row) => {
      const ck = CONTENT_KEYS.find((k) => k.key === row.key);
      map[row.key] = {
        valueEs: row.valueEs || ck?.defaultEs || "",
        valueEn: row.valueEn || ck?.defaultEn || "",
      };
    });
    setValues(map);
  }, [data]);

  if (isLoading) return <Spinner />;

  const update = (key: string, field: "valueEs" | "valueEn", v: string) =>
    setValues((prev) => ({ ...prev, [key]: { ...prev[key], [field]: v } }));

  const save = (key: string) =>
    updateContent.mutate(
      { key, valueEs: values[key]?.valueEs, valueEn: values[key]?.valueEn },
      { onSuccess: () => alerts.success("Guardado") },
    );

  const keysInTab = CONTENT_KEYS.filter((k) => k.group === tab);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        Contenido
      </h1>
      <p className="mb-6 text-zinc-500">
        Edita cada sección de la tienda por separado.
      </p>

      {/* Pestañas */}
      <div className="mb-6 flex gap-1 border-b border-zinc-200">
        {CONTENT_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setTab(g.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === g.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {tab === "brand" && <LogoManager />}

      <div className="space-y-4">
        {keysInTab.map((ck) => {
          const val = values[ck.key] ?? { valueEs: "", valueEn: "" };
          return (
            <div
              key={ck.key}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-card"
            >
              <p className="mb-3 text-sm font-medium text-zinc-900">
                {ck.label}
              </p>
              <div
                className={`grid gap-3 ${ck.singleLang ? "" : "sm:grid-cols-2"}`}
              >
                <Field
                  langLabel={ck.singleLang ? undefined : "Español"}
                  multiline={ck.multiline}
                  value={val.valueEs}
                  onChange={(v) => update(ck.key, "valueEs", v)}
                />
                {!ck.singleLang && (
                  <Field
                    langLabel="English"
                    multiline={ck.multiline}
                    value={val.valueEn}
                    onChange={(v) => update(ck.key, "valueEn", v)}
                  />
                )}
              </div>
              <Button size="sm" className="mt-3" onClick={() => save(ck.key)}>
                Guardar
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  langLabel,
  multiline,
  value,
  onChange,
}: {
  langLabel?: string;
  multiline?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      {langLabel && (
        <span className="mb-1 block text-xs font-medium text-zinc-500">
          {langLabel}
        </span>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={inputClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}
