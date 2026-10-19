import { base44 } from "@/api/base44Client";
import { esNavidad, formatDia } from "@/lib/formato";

// A4 en mm
const W = 210;
const L = 15;
const R = W - 15;
const BOTTOM = 278;

/** Las fuentes estándar de PDF solo traen Latin-1: se reemplazan/quitan los símbolos que no soportan (emojis, etc.). */
const limpiar = (t) =>
  String(t ?? "")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/ /g, " ")
    .replace(/[^\n -ÿ]/g, "");

const rgb = (hex, def) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return def;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mezclar = (a, b, p) => a.map((c, i) => Math.round(c * p + b[i] * (1 - p)));

async function cargarImagen(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const fmt = /png/.test(blob.type) ? "PNG" : /jpe?g/.test(blob.type) ? "JPEG" : null;
    if (!fmt) return null; // jsPDF no lee webp
    const data = await new Promise((ok, ko) => {
      const r = new FileReader();
      r.onload = () => ok(r.result);
      r.onerror = ko;
      r.readAsDataURL(blob);
    });
    const dim = await new Promise((ok) => {
      const i = new Image();
      i.onload = () => ok({ w: i.naturalWidth, h: i.naturalHeight });
      i.onerror = () => ok(null);
      i.src = data;
    });
    return dim ? { data, fmt, ...dim } : null;
  } catch {
    return null;
  }
}

const dinero = (n) => `$ ${Number(n).toLocaleString("es-AR")}`;
const mayus = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

/** Dibuja el documento base (encabezado, paginado y pie) y devuelve herramientas para ir escribiendo. */
async function crearDocumento(evento, titulo, subtitulo) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const brand = rgb(evento.color_primario, [193, 18, 31]);
  const brand2 = rgb(evento.color_acento, [21, 128, 61]);
  const deep = mezclar(brand2, [5, 21, 11], 0.52);
  const navidad = esNavidad(evento);
  const logo = await cargarImagen(evento.logo_url);

  const franja = (y) => {
    const colores = [brand, [255, 255, 255], brand2, [255, 255, 255]];
    for (let x = 0, i = 0; x < W; x += 7, i++) {
      doc.setFillColor(...colores[i % 4]);
      doc.rect(x, y, 7, 3, "F");
    }
  };

  // Primera página: encabezado grande
  doc.setFillColor(...deep);
  doc.rect(0, 0, W, 42, "F");
  if (navidad) franja(42);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.text(limpiar(titulo), L, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(limpiar(evento.nombre), L, 28);
  doc.setFontSize(9);
  doc.setTextColor(215, 228, 219);
  const linea = [subtitulo, evento.periodo, evento.lugar].filter(Boolean).join("   |   ");
  doc.text(doc.splitTextToSize(limpiar(linea), logo ? 120 : R - L), L, 35);
  if (logo) {
    const h = 26;
    const w = Math.min(46, (logo.w / logo.h) * h);
    const hh = (logo.h / logo.w) * w;
    const x = R - w;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x - 2, 8 - 2, w + 4, hh + 4, 2, 2, "F");
    doc.addImage(logo.data, logo.fmt, x, 8, w, hh);
  }

  const estado = { y: 54 };
  const nuevaPagina = () => {
    doc.addPage();
    doc.setFillColor(...deep);
    doc.rect(0, 0, W, 11, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(limpiar(`${evento.nombre}  |  ${titulo}`), L, 7);
    estado.y = 24;
  };
  const asegurar = (alto) => {
    if (estado.y + alto > BOTTOM) nuevaPagina();
  };

  const cerrar = () => {
    const total = doc.getNumberOfPages();
    const hoy = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setDrawColor(220, 220, 220);
      doc.line(L, 285, R, 285);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(limpiar(`Municipalidad de Capioví - ${evento.nombre} - Actualizado el ${hoy}`), L, 290);
      doc.text(`Página ${i} de ${total}`, R, 290, { align: "right" });
    }
  };

  return { doc, brand, brand2, deep, estado, asegurar, cerrar };
}

const slug = (evento) => (evento.slug || evento.id || "evento").toString().replace(/[^a-z0-9-]+/gi, "-").toLowerCase();

async function pdfArtistas(evento) {
  const { items } = await base44.entities.Artista.filter({ evento_id: evento.id }, { sort: "orden", limit: 300 });
  const grupos = {};
  (items || []).forEach((a) => (grupos[a.fecha || "Sin fecha"] ||= []).push(a));
  const fechas = Object.keys(grupos).sort(); // "Sin fecha" queda al final
  fechas.forEach((f) =>
    grupos[f].sort((a, b) => (a.hora_inicio || "99:99").localeCompare(b.hora_inicio || "99:99") || (a.orden ?? 0) - (b.orden ?? 0))
  );

  const { doc, brand, estado, asegurar, cerrar } = await crearDocumento(evento, "Grilla de artistas", "Ordenada por fecha y horario");
  const tinte = mezclar(brand, [255, 255, 255], 0.12);

  if (!fechas.length) {
    doc.setTextColor(110, 110, 110);
    doc.setFontSize(11);
    doc.text("Todavía no hay actividades cargadas.", L, estado.y);
  }

  for (const fecha of fechas) {
    asegurar(30);
    doc.setFillColor(...tinte);
    doc.roundedRect(L, estado.y - 6, R - L, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...brand);
    doc.text(limpiar(fecha === "Sin fecha" ? "Durante toda la celebración" : mayus(formatDia(fecha))), L + 4, estado.y + 0.8);
    estado.y += 11;

    for (const a of grupos[fecha]) {
      const detalle = [a.genero, a.escenario].filter(Boolean).join("   |   ");
      const desc = a.descripcion ? doc.splitTextToSize(limpiar(a.descripcion), R - L - 34) : [];
      const alto = 7 + (detalle ? 5 : 0) + desc.length * 4.2 + 4;
      asegurar(alto);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...brand);
      const hora = a.hora_inicio ? `${a.hora_inicio}${a.hora_fin ? " - " + a.hora_fin : ""}` : "A confirmar";
      doc.text(limpiar(hora), L + 2, estado.y);

      doc.setFontSize(11.5);
      doc.setTextColor(25, 25, 25);
      doc.text(limpiar(a.nombre), L + 34, estado.y);
      let y = estado.y;
      if (detalle) {
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(95, 95, 95);
        doc.text(limpiar(detalle), L + 34, y);
      }
      if (desc.length) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(110, 110, 110);
        doc.text(desc, L + 34, y + 4.5);
        y += desc.length * 4.2 + 1;
      }
      y += 4;
      doc.setDrawColor(228, 228, 228);
      doc.line(L, y, R, y);
      estado.y = y + 6;
    }
    estado.y += 3;
  }

  cerrar();
  return { doc, filename: `grilla-artistas-${slug(evento)}.pdf` };
}

async function pdfGastronomia(evento) {
  const [p, pr] = await Promise.all([
    base44.entities.PuestoGastronomico.filter({ evento_id: evento.id }, { sort: "numero", limit: 200 }),
    base44.entities.Producto.filter({ evento_id: evento.id }, { limit: 1000 }),
  ]);
  const puestos = [...(p.items || [])].sort((a, b) => (a.numero ?? Infinity) - (b.numero ?? Infinity));
  const productos = {};
  (pr.items || []).forEach((x) => (productos[x.puesto_id] ||= []).push(x));

  const { doc, brand, estado, asegurar, cerrar } = await crearDocumento(evento, "Patio gastronómico", "Puestos ordenados por número");

  if (!puestos.length) {
    doc.setTextColor(110, 110, 110);
    doc.setFontSize(11);
    doc.text("Todavía no hay puestos cargados.", L, estado.y);
  }

  for (const puesto of puestos) {
    const prods = productos[puesto.id] || [];
    const desc = puesto.descripcion ? doc.splitTextToSize(limpiar(puesto.descripcion), R - L - 24) : [];
    const alto = 18 + desc.length * 4.2 + prods.length * 6.2 + 4;
    asegurar(alto);

    const top = estado.y - 4;
    doc.setDrawColor(222, 222, 222);
    doc.roundedRect(L, top, R - L, alto, 3, 3, "S");

    // Número del puesto
    doc.setFillColor(...brand);
    doc.roundedRect(L + 4, top + 4, 13, 13, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(puesto.numero != null && String(puesto.numero).length > 2 ? 10 : 14);
    doc.text(String(puesto.numero ?? "-"), L + 10.5, top + 13.2, { align: "center" });

    doc.setFontSize(12.5);
    doc.setTextColor(25, 25, 25);
    doc.text(limpiar(puesto.nombre), L + 21, top + 9);
    let y = top + 9;
    if (puesto.responsable) {
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(limpiar(puesto.responsable), L + 21, y);
    }
    y = Math.max(y, top + 17) + 3;
    if (desc.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(110, 110, 110);
      doc.text(desc, L + 21, y + 1);
      y += desc.length * 4.2 + 1;
    }
    for (const prod of prods) {
      y += 6.2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(limpiar(prod.nombre), L + 21, y);
      if (typeof prod.precio === "number") {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brand);
        doc.text(dinero(prod.precio), R - 5, y, { align: "right" });
      }
    }
    estado.y = top + alto + 9;
  }

  cerrar();
  return { doc, filename: `gastronomia-${slug(evento)}.pdf` };
}

export const TIPOS_PDF = {
  artistas: { titulo: "Grilla de artistas", generar: pdfArtistas, ruta: "/eventos" },
  gastronomia: { titulo: "Gastronomía", generar: pdfGastronomia, ruta: "/gastronomia" },
};

/** Arma el PDF actualizado del tipo pedido ("artistas" | "gastronomia"). Devuelve { doc, filename }. */
export async function generarPdf(tipo, evento) {
  const def = TIPOS_PDF[tipo];
  if (!def) throw new Error("Tipo de PDF desconocido");
  return def.generar(evento);
}
