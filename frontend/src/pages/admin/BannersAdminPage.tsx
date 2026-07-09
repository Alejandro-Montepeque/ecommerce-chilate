import { useState } from "react";
import {
  useAdminBanners,
  useCreateBanner,
  useDeleteBanner,
} from "@/features/banners/banners.queries";
import { Button, Input, Spinner } from "@/components/ui";
import { alerts } from "@/lib/alerts";

export default function BannersAdminPage() {
  const { data: banners = [], isLoading } = useAdminBanners();
  const createBanner = useCreateBanner();
  const deleteBanner = useDeleteBanner();
  const [draft, setDraft] = useState({ titleEs: "", titleEn: "" });

  if (isLoading) return <Spinner />;

  function create() {
    if (!draft.titleEs) return;
    createBanner.mutate(
      {
        titleEs: draft.titleEs,
        titleEn: draft.titleEn || draft.titleEs,
        isActive: true,
      },
      {
        onSuccess: () => {
          setDraft({ titleEs: "", titleEn: "" });
          alerts.success("Banner agregado");
        },
      },
    );
  }

  async function handleDelete(id: string) {
    const ok = await alerts.confirm("¿Eliminar este banner?");
    if (ok)
      deleteBanner.mutate(id, {
        onSuccess: () => alerts.success("Banner eliminado"),
      });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900">
        Banners
      </h1>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card">
        <p className="mb-3 text-sm font-medium text-zinc-500">Nuevo banner</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Título (ES)"
            value={draft.titleEs}
            onChange={(e) => setDraft({ ...draft, titleEs: e.target.value })}
          />
          <Input
            label="Title (EN)"
            value={draft.titleEn}
            onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
          />
          <Button onClick={create} disabled={createBanner.isPending}>
            Agregar
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card">
        {banners.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">
            Aún no hay banners
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {banners.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <span className="text-zinc-800">
                  {b.titleEs}{" "}
                  <span className="text-zinc-400">/ {b.titleEn}</span>
                </span>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(b.id)}
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
