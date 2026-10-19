/**
 * Textos editables del sitio público. Cada campo se guarda en el Evento (se edita en Admin → Textos del sitio).
 * Si un campo está vacío se usa el valor por defecto de acá.
 */
export const TEXTOS = [
  {
    grupo: "Portada",
    campos: [
      { key: "hero_eyebrow", label: "Línea sobre el título", def: "Capioví · Misiones · Argentina" },
      { key: "cta_principal", label: "Botón principal", def: "Ver grilla de eventos" },
      { key: "cta_secundario", label: "Botón secundario", def: "Gastronomía" },
      { key: "cta_bono", label: "Botón de bonos (también en el menú)", def: "Comprar bono" },
      { key: "agenda_titulo", label: "Título de próximas actividades", def: "Próximas actividades" },
      { key: "nosotros_titulo", label: "Título de “Nosotros”", def: "Una celebración de toda la comunidad" },
      { key: "historia_titulo", label: "Título de “Historia”", def: "Cómo llegamos hasta acá" },
      { key: "galeria_titulo", label: "Título de la galería", def: "Momentos que se quedan en el corazón" },
      { key: "bonos_cta_titulo", label: "Título del bloque de bonos", def: "Sumate: tu aporte hace posible el evento" },
      { key: "bonos_cta_texto", label: "Texto del bloque de bonos", def: "Registrá tu bono y colaborá con la comunidad de Capioví.", multiline: true },
    ],
  },
  {
    grupo: "Grilla de eventos",
    campos: [
      { key: "eventos_titulo", label: "Título", def: "Grilla de Eventos" },
      { key: "eventos_subtitulo", label: "Subtítulo", def: "Artistas, horarios y escenarios del evento." },
    ],
  },
  {
    grupo: "Gastronomía",
    campos: [
      { key: "gastronomia_titulo", label: "Título", def: "Patio gastronómico" },
      { key: "gastronomia_subtitulo", label: "Subtítulo", def: "Encontrá tu puesto por número y mirá qué sirve cada uno." },
    ],
  },
  {
    grupo: "Alojamientos",
    campos: [
      { key: "alojamientos_titulo", label: "Título", def: "Alojamientos y hotelería" },
      { key: "alojamientos_subtitulo", label: "Subtítulo", def: "Dónde hospedarte para disfrutar del evento." },
    ],
  },
  {
    grupo: "Bonos de colaboración",
    campos: [
      { key: "bonos_titulo", label: "Título", def: "Bonos de colaboración" },
      { key: "bonos_subtitulo", label: "Subtítulo", def: "Tu aporte ayuda a que el evento sea posible. Todos los bonos ayudan a sostener la fiesta.", multiline: true },
      { key: "bonos_montos", label: "Montos sugeridos (separados por coma)", def: "2000, 5000, 10000, 20000", ayuda: "Ej: 2000, 5000, 10000. Se muestran como botones para elegir." },
    ],
  },
  {
    grupo: "Contacto",
    campos: [
      { key: "contacto_titulo", label: "Título", def: "Contacto" },
      { key: "contacto_subtitulo", label: "Subtítulo", def: "¿Querés participar como artista o tener un puesto gastronómico? Escribinos.", multiline: true },
    ],
  },
  {
    grupo: "Pie de página y chat",
    campos: [
      { key: "footer_texto", label: "Texto del pie", def: "Eventos de la comunidad de Capioví, Misiones. Cultura, gastronomía y tradición.", multiline: true },
      { key: "footer_ubicacion", label: "Ubicación", def: "Capioví, Misiones" },
      {
        key: "footer_links",
        label: "Enlaces del pie (uno por línea: Texto | URL)",
        def: "Municipalidad de Capioví | https://capiovi.misiones.gov.ar\nTurismo | https://capiovi.misiones.gov.ar/turismo\nSalto Capioví | https://capiovi.misiones.gov.ar/salto-capiovi\nMuseo de la Inmigración Alemana | https://capiovi.misiones.gov.ar/museo-de-la-inmigracion-alemana",
        multiline: true,
        ayuda: "Para no mostrar ningún enlace, escribí solo un espacio.",
      },
      { key: "chat_saludo", label: "Saludo del asistente (chat)", def: "¡Hola! Soy el asistente del evento. Preguntame por la programación, los puestos de comida o los bonos 🎉", multiline: true },
    ],
  },
];

const DEFAULTS = Object.fromEntries(TEXTOS.flatMap((g) => g.campos.map((c) => [c.key, c.def])));

/** Texto configurado en el evento, o el valor por defecto si está vacío / sin definir. */
export function txt(evento, key) {
  const v = evento?.[key];
  return v === undefined || v === null || v === "" ? DEFAULTS[key] : v;
}

/** Los enlaces del pie se pueden vaciar a propósito: un campo con solo espacios significa "sin enlaces". */
export function parseLinks(evento) {
  const raw = evento?.footer_links;
  const text = raw === undefined || raw === null || raw === "" ? DEFAULTS.footer_links : raw;
  return text
    .split("\n")
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter(([label, url]) => label && /^https?:\/\//.test(url || ""))
    .map(([label, url]) => ({ label, url }));
}

export function parseMontos(evento) {
  const nums = String(txt(evento, "bonos_montos"))
    .split(/[,;\s]+/)
    .map((n) => Number(n.replace(/\./g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  return nums.length ? nums : [2000, 5000, 10000, 20000];
}

/** Secciones que se pueden ocultar (por defecto visibles). */
export const mostrarBonos = (evento) => evento?.mostrar_bonos !== false;
export const mostrarChat = (evento) => evento?.mostrar_chat !== false;
