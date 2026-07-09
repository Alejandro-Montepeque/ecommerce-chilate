// Helpers puros para armar las variantes (talla × color) de un producto.
// Se mantienen fuera del componente para poder reutilizarlos y testearlos.

export interface Combo {
  size: string;
  color: string;
}

// Clave estable para identificar una combinación talla|color en el mapa de stock.
export const comboKey = (size: string, color: string) => `${size}|${color}`;

// Producto cartesiano de tallas y colores. Si solo hay uno de los dos, usa ese;
// si no hay ninguno, devuelve una única variante "sin especificar".
export function buildCombos(sizes: string[], colors: string[]): Combo[] {
  if (sizes.length && colors.length)
    return sizes.flatMap((s) => colors.map((c) => ({ size: s, color: c })));
  if (sizes.length) return sizes.map((s) => ({ size: s, color: "" }));
  if (colors.length) return colors.map((c) => ({ size: "", color: c }));
  return [{ size: "", color: "" }];
}

// Agrega o quita un valor de una lista (para los selectores de talla/color).
export const toggleValue = (list: string[], value: string) =>
  list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
