// Máscaras de entrada (sin dependencias). Devuelven el texto ya formateado.

export function onlyDigits(v: string): string {
  return v.replace(/\D/g, "");
}

// Tarjeta: "#### #### #### ####" (máx. 16 dígitos).
export function formatCardNumber(v: string): string {
  return onlyDigits(v)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

// Vencimiento: "MM/AA" con mes válido (01-12) y autoprefijo (3 -> 03).
export function formatExpiry(v: string): string {
  let d = onlyDigits(v).slice(0, 4);
  if (d.length === 1 && Number(d) > 1) d = "0" + d;
  if (d.length >= 2) {
    let mm = Number(d.slice(0, 2));
    if (mm < 1) mm = 1;
    if (mm > 12) mm = 12;
    d = String(mm).padStart(2, "0") + d.slice(2);
  }
  return d.length <= 2 ? d : d.slice(0, 2) + "/" + d.slice(2);
}

// CVC: 3-4 dígitos.
export function formatCvc(v: string): string {
  return onlyDigits(v).slice(0, 4);
}

// Teléfono El Salvador: "####-####" (8 dígitos).
export function formatPhone(v: string): string {
  const d = onlyDigits(v).slice(0, 8);
  return d.length <= 4 ? d : d.slice(0, 4) + "-" + d.slice(4);
}
