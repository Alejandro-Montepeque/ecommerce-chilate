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
import { Button, Card, Input, Spinner, Textarea } from "@/components/ui";
import { alerts } from "@/lib/alerts";

type Values = Record<string, { valueEs: string; valueEn: string }>;

export default function ContentAdminPage() {
  const { data, isLoading } = useSiteContent();
  const updateContent = useUpdateContent();
  const [values, setValues] = useState<Values>({});
  // Snapshot de lo cargado, para detectar si hubo cambios.
  const [initial, setInitial] = useState<Values>({});
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
    setInitial(structuredClone(map));
  }, [data]);

  if (isLoading) return <Spinner />;

  const update = (key: string, field: "valueEs" | "valueEn", v: string) =>
    setValues((prev) => ({ ...prev, [key]: { ...prev[key], [field]: v } }));

  // ¿Hay cambios respecto a lo cargado?
  const isDirty = (key: string) =>
    values[key]?.valueEs !== initial[key]?.valueEs ||
    values[key]?.valueEn !== initial[key]?.valueEn;

  // Vacío = el campo principal (español) sin contenido.
  const isEmpty = (key: string) => !values[key]?.valueEs?.trim();

  const save = (key: string) => {
    if (isEmpty(key)) return alerts.error("El campo no puede quedar vacío.");
    if (!isDirty(key)) return alerts.info("No hay cambios que guardar.");
    updateContent.mutate(
      { key, valueEs: values[key]?.valueEs, valueEn: values[key]?.valueEn },
      {
        onSuccess: () => {
          // Marca este campo como "sin cambios" tras guardar.
          setInitial((prev) => ({ ...prev, [key]: { ...values[key] } }));
          alerts.success("Guardado");
        },
        onError: (e) =>
          alerts.error(e instanceof Error ? e.message : "Error al guardar"),
      },
    );
  };

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
            <Card key={ck.key} className="p-5">
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
              <Button
                size="sm"
                className="mt-3"
                onClick={() => save(ck.key)}
                disabled={!isDirty(ck.key) || isEmpty(ck.key)}
              >
                Guardar
              </Button>
            </Card>
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
  if (multiline)
    return (
      <Textarea
        label={langLabel}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  return (
    <Input
      label={langLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
