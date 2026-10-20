// Carga "Navidad en Capioví" con el contenido de "Navidad en Capioví — Contenido del sitio.pdf".
// Uso:  cat scripts/seed-demo.js | base44 exec [--local]
// Las fotos salen de public/navidad/. No se inventan horarios, puestos ni contactos que el sitio
// original no publica: eso se completa desde /admin. Es idempotente (slug "navidad-capiovi").

// Historia: intro + línea de tiempo ("AAAA – Título" seguido de su párrafo). Los años se dibujan como hitos.
const HISTORIA = [
  "Navidad en Capioví se viene realizando de forma ininterrumpida desde hace más de 11 años, con el esfuerzo de personas que donan voluntariamente su tiempo y conocimientos. Todo nació de reutilizar botellas descartables para transformarlas en adornos navideños.",
  "2009 – Los inicios",
  "Nació como un proyecto de un grupo de Catequesis Familiar de la Parroquia San Luis Gonzaga, para decorar la Iglesia y sus alrededores. Tomaron como ejemplo actividades similares de Brasil, donde con botellas descartables se elaboran objetos navideños. Fue una manera de mostrar a los niños otra forma de contribuir al desarrollo de su comunidad y de cuidar el medio ambiente. Unas 50 personas voluntarias reutilizaron cerca de 3.000 botellas plásticas, con financiación de los propios vecinos.",
  "2010 – Toda la avenida",
  "Ante la excelente repercusión se sumaron más vecinos. Los adornos abarcaron toda la Avenida San Luis Gonzaga y se agregó un árbol navideño de unos 10 metros en la Plaza Los Pioneros. Se reutilizaron unas 9.000 botellas con unos 80 voluntarios.",
  "2012 – El taller y los arbolitos auspiciados",
  "El grupo empezó a trabajar en un lugar propio para confeccionar los adornos, cedido por el Instituto Nuestra Señora de Itatí. Comercios y familias auspiciaron 28 arbolitos de 3 metros sobre el boulevard. Se reutilizaron unas 14.000 botellas y el grupo llegó a 120 voluntarios.",
  "2013 – El trineo con renos",
  "Se decoraron las farolas de la RN 12 y los edificios públicos. El proyecto más importante fue un trineo con 5 renos a escala real, posible gracias al aporte de tres empresas y de la Municipalidad.",
].join("\n\n");

const existentes = await base44.entities.Evento.filter({ slug: "navidad-capiovi" }, { limit: 1 });
if ((existentes.items || []).length) {
  // Ya cargado: solo completa la historia si todavía está vacía (no pisa lo editado en /admin)
  const ev = existentes.items[0];
  if (!ev.historia) {
    await base44.entities.Evento.update(ev.id, { historia: HISTORIA });
    console.log("Evento existente: se cargó la historia.");
  } else {
    console.log("Ya existe el evento, no se crea nada.");
  }
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
    historia: HISTORIA,
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

// ---- Medio ambiente: pasos del proceso y galería de ejemplo (editables desde /admin) ----
{
  const ev = ((await base44.entities.Evento.filter({ slug: "navidad-capiovi" }, { limit: 1 })).items || [])[0];
  if (ev) {
    const img = (n) => `/navidad/${n}`;
    const hayPasos = ((await base44.entities.PasoReciclaje.filter({ evento_id: ev.id }, { limit: 1 })).items || []).length;
    if (!hayPasos) {
      const pasos = [
        ["Recolección", "Vecinos, escuelas, instituciones y comercios juntan botellas plásticas durante todo el año."],
        ["Limpieza y clasificación", "Las botellas se lavan y se separan por tamaño y color para poder usarlas."],
        ["Corte y armado de piezas", "Cada botella se corta y se une a otras para formar flores, hojas, velas y figuras."],
        ["Montaje", "Los adornos se arman sobre estructuras y se instalan en la plaza y en las calles del pueblo."],
      ];
      for (const [i, [titulo, descripcion]] of pasos.entries()) {
        await base44.entities.PasoReciclaje.create({ evento_id: ev.id, titulo, descripcion, orden: i + 1 });
      }
      console.log(`Medio ambiente: ${pasos.length} pasos de ejemplo cargados.`);
    }
    const hayFotos = ((await base44.entities.AmbienteFoto.filter({ evento_id: ev.id }, { limit: 1 })).items || []).length;
    if (!hayFotos) {
      const fotos = [
        ["Papá Noel y su árbol", "papa-noel.jpg"],
        ["Árbol de las casitas", "arbol-casitas.jpg"],
        ["Tren navideño", "tren.jpg"],
        ["Velas gigantes en la avenida", "calle-dia.jpg"],
        ["Árbol de regalos y dulces", "arbol-regalos.jpg"],
        ["Ángeles de la plaza", "angeles.jpg"],
      ];
      for (const [i, [titulo, foto]] of fotos.entries()) {
        await base44.entities.AmbienteFoto.create({ evento_id: ev.id, titulo, imagen_url: img(foto), orden: i + 1 });
      }
      console.log(`Medio ambiente: ${fotos.length} fotos de ejemplo cargadas.`);
    }
  }
}
