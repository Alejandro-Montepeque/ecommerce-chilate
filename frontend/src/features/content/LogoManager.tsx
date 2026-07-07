import { useState } from "react";
import {
  useLogoUrl,
  useUpdateContent,
  LOGO_KEY,
} from "@/features/content/content.queries";
import {
  uploadImage,
  validateImage,
  MAX_IMAGE_MB,
} from "@/features/products/upload";
import { alerts } from "@/lib/alerts";

// Permite al administrador subir/cambiar el logo de la tienda.
// El logo se guarda como configuración (site_content -> logo_url).
export function LogoManager() {
  const currentLogo = useLogoUrl();
  const updateContent = useUpdateContent();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      alerts.error(error);
      e.target.value = "";
      return;
    }

    setPreview((p) => {
      if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
      return URL.createObjectURL(file);
    });

    setUploading(true);
    try {
      const url = await uploadImage(file);
      updateContent.mutate(
        { key: LOGO_KEY, valueEs: url, valueEn: url },
        { onSuccess: () => alerts.success("Logo actualizado") },
      );
    } finally {
      setUploading(false);
    }
  }

  const shown = preview ?? currentLogo;

  return (
    <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-card">
      <p className="mb-3 text-sm font-medium text-zinc-900">
        Logo de la tienda
      </p>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-40 place-items-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-400">
          {uploading ? (
            "Subiendo..."
          ) : shown ? (
            <img
              src={shown}
              alt="logo"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            "Sin logo"
          )}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
          />
          <p className="mt-1 text-xs text-zinc-400">
            PNG con fondo transparente · máx. {MAX_IMAGE_MB} MB
          </p>
        </div>
      </div>
    </div>
  );
}
