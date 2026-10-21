import React from "react";

/** Tarjeta con borde de color del evento, usada en grilla, gastronomía, alojamientos e inicio. */
export default function Tarjeta({ as: Tag = "li", className = "", children }) {
  return (
    <Tag className={`group overflow-hidden rounded-2xl border-t-4 border-brand bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl ${className}`}>
      {children}
    </Tag>
  );
}
