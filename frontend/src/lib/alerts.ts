import Swal, { type SweetAlertOptions } from "sweetalert2";

// Estilo de las alertas alineado a la identidad boutique del ecommerce
// (rosa palo + salvia, esquinas redondeadas, botones tipo pill). Usamos clases
// de Tailwind en vez del estilo por defecto de SweetAlert2.
const customClass = {
  popup: "rounded-3xl border border-zinc-200 shadow-card-hover",
  title: "text-zinc-900 text-xl font-bold",
  htmlContainer: "text-zinc-500",
  actions: "gap-2",
  confirmButton:
    "rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
  cancelButton:
    "rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100",
  denyButton:
    "rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700",
};

// Base compartida para modales.
const base = Swal.mixin({
  buttonsStyling: false,
  customClass,
  reverseButtons: true,
  showClass: { popup: "animate-fade-in" },
});

// Toast discreto en la esquina (notificaciones).
const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
  buttonsStyling: false,
  customClass: {
    popup: "rounded-2xl border border-zinc-200 shadow-card",
    title: "text-sm font-semibold text-zinc-800",
  },
});

const modal = (opts: SweetAlertOptions) => base.fire(opts);

export const alerts = {
  success(message: string) {
    return toast.fire({ icon: "success", title: message });
  },

  error(message: string) {
    return modal({ icon: "error", title: "Ups", text: message });
  },

  info(message: string) {
    return toast.fire({ icon: "info", title: message });
  },

  // Notificación de aviso discreta.
  warn(message: string) {
    return toast.fire({ icon: "warning", title: message });
  },

  // Modal de éxito con detalle (ej. referencia de pago).
  successModal(title: string, text?: string) {
    return modal({ icon: "success", title, text });
  },

  // Confirmación (true si el usuario acepta).
  async confirm(title: string, text?: string): Promise<boolean> {
    const res = await modal({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });
    return res.isConfirmed;
  },

  // Confirmación destructiva (botón rojo/acento; para eliminar).
  async confirmDanger(
    title: string,
    text?: string,
    confirmText = "Sí, eliminar",
  ): Promise<boolean> {
    const res = await base.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancelar",
      customClass: {
        ...customClass,
        confirmButton:
          "rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
      },
    });
    return res.isConfirmed;
  },
};
