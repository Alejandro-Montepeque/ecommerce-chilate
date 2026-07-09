import { Card } from "@/components/ui";

interface Props {
  catalog: { id: string; name: string; hex: string }[];
  selected: string[];
  onToggle: (name: string) => void;
}

// Selector de colores: muestras circulares con el color real.
export function ColorSelector({ catalog, selected, onToggle }: Props) {
  return (
    <Card className="p-6">
      <p className="mb-3 text-sm font-medium text-zinc-500">
        Colores disponibles
      </p>
      <div className="flex flex-wrap gap-3">
        {catalog.map((c) => {
          const active = selected.includes(c.name);
          return (
            <button
              key={c.id}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={active}
              onClick={() => onToggle(c.name)}
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
    </Card>
  );
}
