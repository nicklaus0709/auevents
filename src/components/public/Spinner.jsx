import React from "react";

/** Esqueleto de carga: respeta la forma de las páginas (encabezado + tarjetas) para evitar saltos. */
export default function Spinner({ label = "Cargando…" }) {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">{label}</span>
      <div className="h-40 bg-stone-200/80 sm:h-52" />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 ${i > 0 ? "hidden sm:block" : ""}`}>
            <div className="h-36 bg-stone-200/80" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-1/3 rounded bg-stone-200" />
              <div className="h-4 w-3/4 rounded bg-stone-200" />
              <div className="h-3 w-1/2 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
