// Carga "Navidad en Capioví" con el contenido de "Navidad en Capioví — Contenido del sitio.pdf".
// Uso:  cat scripts/seed-demo.js | base44 exec [--local]
// Las fotos salen de public/navidad/. No se inventan horarios, puestos ni contactos que el sitio
// original no publica: eso se completa desde /admin. Es idempotente (slug "navidad-capiovi").

const existentes = await base44.entities.Evento.filter({ slug: "navidad-capiovi" }, { limit: 1 });
if ((existentes.items || []).length) {
  console.log("Ya existe el evento, no se crea nada.");
} else {
  const img = (n) => `/navidad/${n}`;

  const evento = await base44.entities.Evento.create({
    nombre: "Navidad en Capioví",
    slug: "navidad-capiovi",
    descripcion: "Una propuesta que refleja pertenencia, compromiso y respeto mutuo, unida por un mismo lema: AMOR A SU PUEBLO.",
    lema: "AMOR A SU PUEBLO",
    periodo: "Desde el primer domingo de Adviento hasta fines de enero",
    lugar: "Capioví, Misiones, Argentina",
    nosotros:
      "Desde hace más de una década, Navidad en Capioví se realiza sin interrupciones gracias al trabajo de vecinos y vecinas que donan voluntariamente su tiempo y sus conocimientos.\n\nEs una propuesta que refleja pertenencia, compromiso y respeto mutuo, unida por un mismo lema: «AMOR A SU PUEBLO».",
    activo: true,
    color_primario: "#c1121f",
    color_acento: "#15803d",
    hero_image: img("hero.jpg"),
    logo_url: img("logo.jpg"),
  });
  const evento_id = evento.id;

  // La celebración arranca el primer domingo de Adviento (29/11/2026). Lo demás no tiene horario publicado.
  const actividades = [
    ["Inicio de la celebración", "Primer domingo de Adviento", "2026-11-29", "Capioví", "encendido.jpg", "Cuatro domingos antes de Navidad comienza Navidad en Capioví, que se extiende hasta fines de enero."],
    ["Espectáculos de danza", "Danza", null, "Capioví", "ballet.png", "Presentaciones de danza durante la celebración. Horarios a confirmar."],
    ["Velas y villancicos", "Espectáculo", null, "Capioví", "velas-ninos.jpg", "Niños y jóvenes de la comunidad en escena a la luz de las velas. Horarios a confirmar."],
    ["Papá Noel", "Visita especial", null, "Capioví", "papa-noel-voluntarias.jpg", "Fotos y saludos con Papá Noel. Horarios a confirmar."],
    ["Paseo por las calles decoradas", "Recorrido", null, "Capioví", "calle-dia.jpg", "Velas, guirnaldas y figuras gigantes armadas a mano por la comunidad."],
  ];
  for (const [i, [nombre, genero, fecha, escenario, foto, descripcion]] of actividades.entries()) {
    await base44.entities.Artista.create({ evento_id, nombre, genero, ...(fecha ? { fecha } : {}), escenario, descripcion, imagen_url: img(foto), orden: i + 1 });
  }

  // Galería: las 13 fotos de la página original (las dos primeras se usan en la sección "Nosotros")
  const galeria = [
    ["Tren navideño", "tren.jpg"],
    ["Papá Noel junto a voluntarias", "papa-noel-voluntarias.jpg"],
    ["Calle decorada con velas gigantes", "calle-dia.jpg"],
    ["Ballet", "ballet.png"],
    ["Encendido del árbol", "encendido.jpg"],
    ["Papá Noel y su árbol", "papa-noel.jpg"],
    ["Árbol de las casitas", "arbol-casitas.jpg"],
    ["Pesebre", "pesebre.jpg"],
    ["Velas gigantes de noche", "hero.jpg"],
    ["Velas y niños en escena", "velas-ninos.jpg"],
    ["Árbol de regalos y dulces", "arbol-regalos.jpg"],
    ["Ángeles de la plaza", "angeles.jpg"],
    ["La plaza llena de gente", "multitud.jpg"],
  ];
  for (const [i, [titulo, foto]] of galeria.entries()) {
    await base44.entities.GaleriaFoto.create({ evento_id, titulo, imagen_url: img(foto), orden: i + 1 });
  }

  await base44.entities.Publicidad.create({
    evento_id,
    comercio_nombre: "Capioví Turismo",
    descripcion: "Municipalidad de Capioví",
    imagen_url: img("banner.jpg"),
    link_url: "https://capiovi.misiones.gov.ar/turismo",
    activo: true,
    orden: 1,
  });

  console.log(`Evento creado (${evento_id}): ${actividades.length} actividades, ${galeria.length} fotos.`);
}
