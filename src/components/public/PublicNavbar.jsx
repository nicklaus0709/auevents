import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useEvento } from "@/lib/eventoContext";
import { txt, mostrarBonos } from "@/lib/textos";

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/eventos", label: "Grilla de Eventos" },
  { to: "/gastronomia", label: "Gastronomía" },
  { to: "/contacto", label: "Contacto" },
];

export default function PublicNavbar() {
  const { eventos, evento, seleccionarEvento } = useEvento();
  const [open, setOpen] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const { pathname } = useLocation();

  const switcherRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  // El desplegable de eventos se cierra al hacer clic afuera o con Escape (no al mover el mouse)
  useEffect(() => {
    if (!switcher) return;
    const onClick = (e) => { if (!switcherRef.current?.contains(e.target)) setSwitcher(false); };
    const onKey = (e) => { if (e.key === "Escape") setSwitcher(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [switcher]);

  return (
    <header className="sticky top-0 z-40 bg-deep text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          {evento?.logo_url ? (
            <img src={evento.logo_url} alt={evento.nombre} className="h-11 w-auto rounded-xl bg-white px-2 py-0.5 shadow-md" />
          ) : (
            <span className="font-titulo text-xl font-bold leading-none tracking-tight sm:text-2xl">
              {evento?.nombre || "Capioví Eventos"}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-white/15" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
            >
              {l.label}
            </NavLink>
          ))}

          {eventos.length > 1 && (
            <div className="relative ml-1" ref={switcherRef}>
              <button
                onClick={() => setSwitcher((s) => !s)}
                aria-expanded={switcher}
                className="flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Eventos <ChevronDown className="h-4 w-4" />
              </button>
              {switcher && (
                <div className="animate-fade-in absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl bg-white py-1 text-stone-800 shadow-2xl ring-1 ring-stone-200">
                  {eventos.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => { seleccionarEvento(e.id); setSwitcher(false); }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-stone-100 ${e.id === evento?.id ? "bg-stone-100 font-bold" : ""}`}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color_primario || "#b91c1c" }} />
                      {e.nombre}
                      {e.activo && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-stone-400">Activo</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mostrarBonos(evento) && <Link to="/bonos" className="btn ml-2">{txt(evento, "cta_bono")}</Link>}
        </nav>

        <button
          className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      <div className="luces" aria-hidden="true" />

      {open && (
        <nav id="mobile-nav" className="animate-fade-in flex flex-col gap-1 border-t border-white/10 px-4 pb-5 pt-3 lg:hidden" aria-label="Principal móvil">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-white/10">{l.label}</Link>
          ))}
          {eventos.length > 1 && (
            <div className="px-4 pt-2">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">Eventos</p>
              <div className="flex flex-wrap gap-2">
                {eventos.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { seleccionarEvento(e.id); setOpen(false); }}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${e.id === evento?.id ? "border-white bg-white/15" : "border-white/30"}`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: e.color_primario || "#b91c1c" }} />
                    {e.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mostrarBonos(evento) && <Link to="/bonos" className="btn mt-2 !py-3">{txt(evento, "cta_bono")}</Link>}
        </nav>
      )}
    </header>
  );
}