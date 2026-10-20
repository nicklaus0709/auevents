/** Textos por defecto de la sección "Capioví apoyando al medio ambiente". Se editan en Admin → Medio ambiente. */
export const AMBIENTE_CAMPOS = [
  { key: "ambiente_titulo", label: "Título de la página", def: "Capioví apoyando al medio ambiente" },
  { key: "ambiente_subtitulo", label: "Subtítulo", def: "Reciclamos plástico y lo convertimos en arte para cada evento." },
  {
    key: "ambiente_intro",
    label: "Texto principal (separá los párrafos con una línea en blanco)",
    def: "Capioví cuida el medio ambiente en conjunto con la comunidad. Vecinos, escuelas e instituciones reciclan plástico y lo transforman en arte a través de los adornos temáticos de cada evento.\n\nCada botella que no termina como residuo vuelve convertida en una decoración que renueva la fiesta del pueblo.",
    multiline: true,
  },
  { key: "ambiente_proceso_titulo", label: "Título del proceso de reciclaje", def: "Así reciclamos: del plástico al adorno" },
  { key: "ambiente_proceso_intro", label: "Texto del proceso", def: "Un trabajo hecho a mano, paso a paso, por voluntarios de la comunidad.", multiline: true },
  { key: "ambiente_videos_titulo", label: "Título de los videos", def: "Videos del proceso" },
  { key: "ambiente_galeria_titulo", label: "Título de la galería", def: "Galería: el arte del reciclaje" },
];

const DEFAULTS = Object.fromEntries(AMBIENTE_CAMPOS.map((c) => [c.key, c.def]));

/** Texto configurado en el evento, o el valor por defecto si está vacío. */
export function amb(evento, key) {
  const v = evento?.[key];
  return v === undefined || v === null || v === "" ? DEFAULTS[key] : v;
}

/** Logo por defecto (flechas de reciclaje alrededor del planeta); se puede reemplazar desde el admin. */
export const LOGO_AMBIENTE = "/ambiente/logo.jpg";
export const logoAmbiente = (evento) => evento?.ambiente_logo || LOGO_AMBIENTE;

/** La sección está activa salvo que se la apague en el admin. */
export const ambienteActivo = (evento) => evento?.ambiente_activo !== false;

/**
 * Interpreta un enlace de video. YouTube, Vimeo y Facebook se muestran embebidos;
 * cualquier otro enlace o archivo subido se reproduce con la etiqueta <video>.
 */
export function videoEmbed(url) {
  const u = String(url || "").trim();
  if (!u) return null;
  let m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/))([\w-]{11})/.exec(u);
  if (m) return { tipo: "iframe", src: `https://www.youtube-nocookie.com/embed/${m[1]}` };
  m = /vimeo\.com\/(?:video\/)?(\d+)/.exec(u);
  if (m) return { tipo: "iframe", src: `https://player.vimeo.com/video/${m[1]}` };
  if (/^https?:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.watch)\//i.test(u)) {
    return { tipo: "iframe", src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false` };
  }
  if (/^https?:\/\//i.test(u) || u.startsWith("/")) return { tipo: "file", src: u };
  return null;
}
