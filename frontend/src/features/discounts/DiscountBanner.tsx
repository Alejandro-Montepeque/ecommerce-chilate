import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDiscountBanner } from "./discounts.queries";

// Formatea milisegundos restantes como "2d 05h 12m 30s".
function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = [
    d > 0 ? `${d}d` : "",
    `${String(h).padStart(2, "0")}h`,
    `${String(m).padStart(2, "0")}m`,
    `${String(s).padStart(2, "0")}s`,
  ];
  return parts.filter(Boolean).join(" ");
}

// Banner de descuentos. Solo se muestra si hay un descuento VIGENTE (activo) o
// uno PRÓXIMO por comenzar; si no hay ninguno, nunca aparece.
export function DiscountBanner() {
  const { t } = useTranslation();
  const { data } = useDiscountBanner();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!data || data.state === "none") return null;

  // Descuento vigente: cuenta regresiva hasta que termina.
  if (data.state === "active" && data.endsAt) {
    const remaining = new Date(data.endsAt).getTime() - now;
    if (remaining <= 0) return null; // ya terminó (aún no refresca)
    return (
      <Banner
        label={t("discount.bannerActive", { percent: data.percent ?? 0 })}
        countdown={formatRemaining(remaining)}
        suffix={t("discount.bannerEndsIn")}
      />
    );
  }

  // Descuento próximo: cuenta regresiva hasta que empieza.
  if (data.state === "upcoming" && data.startsAt) {
    const remaining = new Date(data.startsAt).getTime() - now;
    if (remaining <= 0) return null; // ya empezó (aún no refresca)
    return (
      <Banner
        label={t("discount.bannerStarts")}
        countdown={formatRemaining(remaining)}
      />
    );
  }

  return null;
}

function Banner({
  label,
  countdown,
  suffix,
}: {
  label: string;
  countdown: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-5 text-center text-white sm:flex-row sm:justify-center sm:gap-3">
      <span className="text-sm sm:text-base">{label}</span>
      {suffix && <span className="text-sm sm:text-base">{suffix}</span>}
      <span className="rounded-lg bg-white/15 px-3 py-1 font-mono text-sm font-semibold tabular-nums">
        {countdown}
      </span>
    </div>
  );
}
