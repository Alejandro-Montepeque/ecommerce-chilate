import { Card } from "@/components/ui";

interface Props {
  preview: string | null;
  uploading: boolean;
  maxMb: number;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Tarjeta de imagen: muestra la vista previa y el selector de archivo.
export function ImageField({ preview, uploading, maxMb, onFile }: Props) {
  return (
    <Card className="p-6">
      <p className="mb-4 text-sm font-medium text-zinc-500">Imagen</p>
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-400">
          {uploading ? (
            "Subiendo..."
          ) : preview ? (
            <img
              src={preview}
              alt="preview"
              className="h-full w-full object-cover"
            />
          ) : (
            "Sin imagen"
          )}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
          />
          <p className="mt-1 text-xs text-zinc-400">
            JPG o PNG · máx. {maxMb} MB
          </p>
        </div>
      </div>
    </Card>
  );
}
