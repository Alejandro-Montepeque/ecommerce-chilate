// Indicador de carga reutilizable (spinner animado, accesible).
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-8 ${className}`} role="status">
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-brand-600"
        aria-label="Cargando"
      />
    </div>
  );
}
