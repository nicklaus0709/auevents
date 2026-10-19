import React from "react";
import { ChevronRight } from "lucide-react";

/** Pantalla para elegir el evento antes de entrar al sitio público. */
export default function SelectorEventos({ eventos, onSeleccionar }) {
  return (
    <div className="public-site flex min-h-screen flex-col items-center justify-center bg-deep bg-festive px-4 py-16 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">Municipio de Capioví · Misiones</p>
      <h1 className="animate-fade-up font-titulo text-4xl !text-white sm:text-5xl">Elegí el evento</h1>
      <p className="mt-3 max-w-md text-center text-white/80">
        Seleccioná cuál querés visitar para ver su grilla, gastronomía y más.
      </p>
      <div className="stripe-candy my-8 w-44" aria-hidden="true" />
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        {eventos.map((e) => (
          <button
            key={e.id}
            onClick={() => onSeleccionar(e.id)}
            className="group rounded-2xl border border-white/25 bg-white/10 p-6 text-left backdrop-blur transition hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: e.color_primario || "#b91c1c" }} />
              <h2 className="font-titulo text-2xl !text-white">{e.nombre}</h2>
            </div>
            {e.lema && <p className="mt-1 font-titulo italic text-white/70">“{e.lema}”</p>}
            {e.periodo && <p className="mt-2 text-sm text-white/80">{e.periodo}</p>}
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-white">
              Entrar <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}