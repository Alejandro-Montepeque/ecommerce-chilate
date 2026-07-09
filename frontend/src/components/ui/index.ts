// Punto único de importación para los primitivos de UI.
// En vez de varias líneas por componente, se importa desde un solo lugar:
//   import { Button, Input, Card } from "@/components/ui";
// Nota: son reexportaciones con nombre, así que el bundler sigue haciendo
// tree-shaking (solo entra al chunk lo que realmente se usa).
export { Badge } from "./Badge";
export { Button } from "./Button";
export { Card } from "./Card";
export { DataTable } from "./DataTable";
export { EmptyState } from "./EmptyState";
export { ErrorBoundary } from "./ErrorBoundary";
export { Input } from "./Input";
export { Logo } from "./Logo";
export { PageHeader } from "./PageHeader";
export { Select } from "./Select";
export { Spinner } from "./Spinner";
export { Textarea } from "./Textarea";
export { TruckIcon, ShieldIcon, RefreshIcon } from "./icons";
