import { api } from "@/lib/api";

// Tamaño máximo permitido para imágenes de producto.
export const MAX_IMAGE_MB = 2;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

// Valida el archivo antes de subirlo. Devuelve un mensaje de error o null.
export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "El archivo debe ser una imagen.";
  if (file.size > MAX_IMAGE_BYTES)
    return `La imagen no debe superar ${MAX_IMAGE_MB} MB.`;
  return null;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Sube la imagen al backend (Google Cloud Storage). Si el almacenamiento no
// está configurado o falla, cae a base64 para no bloquear el alta local.
export async function uploadImage(file: File): Promise<string> {
  try {
    const form = new FormData();
    form.append("file", file);
    const { url } = await api.post<{ url: string }>("/uploads", form);
    return url;
  } catch {
    return fileToDataUrl(file);
  }
}
