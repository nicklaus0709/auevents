export const TIPOS_ALOJAMIENTO = [
  { value: "", label: "Sin especificar" },
  { value: "Hotel", label: "Hotel" },
  { value: "Hostería", label: "Hostería" },
  { value: "Cabañas", label: "Cabañas" },
  { value: "Hospedaje", label: "Hospedaje" },
  { value: "Camping", label: "Camping" },
  { value: "Departamento", label: "Departamento" },
  { value: "Otro", label: "Otro" },
];

/** Solo links http(s): evita que se cargue algo como javascript: en un enlace. */
export function urlSegura(u) {
  try {
    return u && /^https?:$/.test(new URL(u).protocol) ? u : null;
  } catch {
    return null;
  }
}

/** Link de Google Maps cargado, o una búsqueda en Maps con el nombre y la dirección si no hay link. */
export function linkMapa(a) {
  const cargado = urlSegura(a.maps_url);
  if (cargado) return cargado;
  const consulta = [a.nombre, a.direccion, "Capioví, Misiones"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

/** Orden de la lista: primero por "orden" y después alfabético. */
export const ordenarAlojamientos = (items) =>
  [...items].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || (a.nombre || "").localeCompare(b.nombre || "", "es"));
