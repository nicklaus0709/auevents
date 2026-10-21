export const TZ = "America/Argentina/Cordoba";

/** "#b91c1c" -> "185 28 28" (para variables CSS con soporte de opacidad). */
export function hexToRgbTriplet(hex, fallback) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** "2025-12-20" (fecha sin hora) -> Date al mediodía local, sin corrimiento de día por zona horaria. */
/** "r g b" de un texto que se lee bien sobre ese color: blanco u oscuro según la luminancia (WCAG). */
export function colorSobre(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "255 255 255";
  const n = parseInt(m[1], 16);
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return lum > 0.4 ? "28 25 23" : "255 255 255";
}

export function parseFecha(fecha) {
  if (!fecha) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? new Date(`${fecha}T12:00:00`) : new Date(fecha);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDia(fecha) {
  const d = parseFecha(fecha);
  return d ? new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(d) : "";
}

export function formatFechaLarga(fecha) {
  const d = parseFecha(fecha);
  return d ? new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(d) : "";
}

export function partesDia(fecha) {
  const d = parseFecha(fecha);
  if (!d) return null;
  return {
    day: new Intl.DateTimeFormat("es-AR", { day: "numeric" }).format(d),
    month: new Intl.DateTimeFormat("es-AR", { month: "short" }).format(d).replace(".", ""),
    weekday: new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(d),
  };
}

export const formatMoney = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

/** Texto con años ("2009 – Los inicios" + párrafo) -> línea de tiempo. Lo demás es introducción. */
export function parseHistory(text) {
  const blocks = (text || "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const intro = [];
  const items = [];
  for (let i = 0; i < blocks.length; i++) {
    if (/^\d{4}(\s*[–-]\s*[^\n]+)?$/.test(blocks[i]) && blocks[i + 1]) items.push({ title: blocks[i], body: blocks[++i] });
    else if (items.length === 0) intro.push(blocks[i]);
    else items[items.length - 1].body += "\n\n" + blocks[i];
  }
  return { intro, items };
}

/** El evento de Navidad es el único que lleva la decoración navideña (luces, nieve, bastones). */
export const esNavidad = (evento) => /navidad/i.test(`${evento?.nombre || ""} ${evento?.slug || ""}`);
