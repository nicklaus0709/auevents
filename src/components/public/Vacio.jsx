import React from "react";

/** Mensaje de "todavía no hay nada" compartido por las páginas públicas. */
export default function Vacio({ children }) {
  return <p className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-600">{children}</p>;
}
