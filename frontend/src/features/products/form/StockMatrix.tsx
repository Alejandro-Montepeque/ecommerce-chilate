import { Card } from "@/components/ui";
import { comboKey, type Combo } from "./variants";

interface Props {
  combos: Combo[];
  colorCatalog: { name: string; hex: string }[];
  stock: Record<string, number>;
  onChange: (key: string, value: number) => void;
}

// Matriz de stock: un input por cada combinación talla × color.
export function StockMatrix({ combos, colorCatalog, stock, onChange }: Props) {
  return (
    <Card className="p-6">
      <p className="mb-3 text-sm font-medium text-zinc-500">
        Stock por variante
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {combos.map((c) => {
          const key = comboKey(c.size, c.color);
          const hex = colorCatalog.find((x) => x.name === c.color)?.hex;
          const label =
            [c.size, c.color].filter(Boolean).join(" · ") || "Único";
          return (
            <div
              key={key}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2"
            >
              {hex && (
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: hex }}
                />
              )}
              <span className="flex-1 truncate text-sm text-zinc-700">
                {label}
              </span>
              <input
                type="number"
                min={0}
                value={stock[key] ?? ""}
                placeholder="0"
                onChange={(e) => onChange(key, Number(e.target.value))}
                className="w-16 rounded-lg border border-zinc-300 px-2 py-1 text-center text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
