import { Card } from "@/components/ui";

interface Props {
  catalog: { id: string; label: string }[];
  selected: string[];
  onToggle: (label: string) => void;
}

// Selector de tallas: chips que se activan/desactivan.
export function SizeSelector({ catalog, selected, onToggle }: Props) {
  return (
    <Card className="p-6">
      <p className="mb-3 text-sm font-medium text-zinc-500">
        Tallas disponibles
      </p>
      <div className="flex flex-wrap gap-2">
        {catalog.map((sz) => {
          const active = selected.includes(sz.label);
          return (
            <button
              key={sz.id}
              type="button"
              onClick={() => onToggle(sz.label)}
              className={`min-w-[2.5rem] rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
              }`}
            >
              {sz.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
