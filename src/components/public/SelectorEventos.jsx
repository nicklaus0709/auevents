import React from "react";
import { ArrowUpRight } from "lucide-react";

/** Pantalla para elegir el evento antes de entrar al sitio público. Neutra: sin decoración de ningún evento. */
export default function SelectorEventos({ eventos, onSeleccionar }) {
  return (
    <div className="public-site relative isolate flex min-h-screen flex-col overflow-hidden bg-[#0b100d] text-white">
      {/* Luces de fondo */}
      <div className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 -z-10 h-[34rem] w-[34rem] rounded-full bg-rose-500/15 blur-[130px]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "56px 56px" }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-6 sm:px-6">
        <img src="/navidad/escudo.png" alt="Escudo de Capioví" className="h-12 w-auto drop-shadow-lg" />
        <div className="leading-tight">
          <p className="font-heading text-sm font-bold tracking-tight">Municipalidad de Capioví</p>
          <p className="text-xs text-white/50">Misiones · Argentina</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-16 pt-6 sm:px-6">
        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Eventos</p>
        <h1 className="animate-fade-up mt-3 max-w-2xl !font-heading text-4xl font-bold leading-[1.05] tracking-tight !text-white sm:text-6xl">
          ¿Qué evento querés visitar?
        </h1>
        <p className="animate-fade-up mt-4 max-w-xl text-lg text-white/60">
          Elegí uno para ver su programación, gastronomía, bonos y más.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((e) => (
            <button
              key={e.id}
              onClick={() => onSeleccionar(e.id)}
              className="group relative isolate flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition duration-300 hover:-translate-y-1.5 hover:border-white/30 hover:shadow-2xl hover:shadow-black/50"
            >
              {e.hero_image ? (
                <img src={e.hero_image} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0 -z-20" style={{ background: `linear-gradient(135deg, ${e.color_primario || "#334155"}, ${e.color_acento || "#0f172a"})` }} />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

              <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition duration-300 group-hover:rotate-12 group-hover:bg-white group-hover:text-black">
                <ArrowUpRight className="h-5 w-5" />
              </div>

              {e.activo && (
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Evento activo
                </span>
              )}
              <h2 className="!font-heading text-2xl font-bold leading-tight tracking-tight !text-white">{e.nombre}</h2>
              {e.lema && <p className="mt-1 text-sm italic text-white/70">“{e.lema}”</p>}
              {e.periodo && <p className="mt-3 text-sm text-white/60">{e.periodo}</p>}
              <span className="mt-5 h-0.5 w-10 rounded-full transition-all duration-300 group-hover:w-24" style={{ background: e.color_primario || "#fff" }} />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
