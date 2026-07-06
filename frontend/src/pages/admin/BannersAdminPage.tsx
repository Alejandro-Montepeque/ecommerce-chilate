import { useState } from "react";
import {
  useAdminBanners,
  useCreateBanner,
  useDeleteBanner,
} from "@/features/banners/banners.queries";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

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
      { onSuccess: () => setDraft({ titleEs: "", titleEn: "" }) },
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banners</h1>

      <div className="flex gap-2 mb-6">
        <input
          placeholder="Título ES"
          value={draft.titleEs}
          onChange={(e) => setDraft({ ...draft, titleEs: e.target.value })}
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          placeholder="Title EN"
          value={draft.titleEn}
          onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
          className="border rounded px-3 py-2 flex-1"
        />
        <Button onClick={create} disabled={createBanner.isPending}>
          Agregar
        </Button>
      </div>

      <ul className="divide-y">
        {banners.map((b) => (
          <li key={b.id} className="py-3 flex justify-between items-center">
            <span>
              {b.titleEs} <span className="text-gray-400">/ {b.titleEn}</span>
            </span>
            <Button variant="danger" onClick={() => deleteBanner.mutate(b.id)}>
              Eliminar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
