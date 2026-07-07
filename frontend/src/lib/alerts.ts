import Swal, { type SweetAlertOptions } from "sweetalert2";

// Estilo de las alertas alineado a la identidad del ecommerce (paleta índigo,
// esquinas redondeadas, botones y tipografía consistentes). Usamos clases de
// Tailwind en vez del estilo por defecto de SweetAlert2 (buttonsStyling: false).
const customClass = {
  popup: "rounded-2xl border border-zinc-200 shadow-xl",
  title: "text-zinc-900 text-xl font-semibold",
  htmlContainer: "text-zinc-600",
  actions: "gap-2",
  confirmButton:
    "rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
  cancelButton:
    "rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100",
};

// Base compartida para modales.
const base = Swal.mixin({
  buttonsStyling: false,
  customClass,
  reverseButtons: true,
});

// Toast discreto en la esquina.
const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  buttonsStyling: false,
  customClass: {
    popup: "rounded-xl border border-zinc-200 shadow-lg",
    title: "text-sm font-medium text-zinc-800",
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

  // Modal de éxito con detalle (ej. referencia de pago).
  successModal(title: string, text?: string) {
    return modal({ icon: "success", title, text });
  },

  // Confirmación (true si el usuario acepta).
  async confirm(title: string, text?: string): Promise<boolean> {
    const res = await modal({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });
    return res.isConfirmed;
  },
};
