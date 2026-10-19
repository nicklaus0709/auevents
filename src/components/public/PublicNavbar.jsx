import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Instagram, Facebook } from "lucide-react";
import { useEvento } from "@/lib/eventoContext";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/eventos", label: "Grilla de Eventos" },
  { to: "/gastronomia", label: "Gastronomía" },
  { to: "/bonos", label: "Bonos" },
  { to: "/contacto", label: "Contacto" },
];

export default function PublicNavbar() {
  const { eventos, evento, seleccionarEvento } = useEvento();
  const [open, setOpen] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const location = useLocation();

  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-heading font-bold text-lg md:text-xl tracking-tight">CAPIOVÍ</span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-muted-foreground">Eventos</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(l.to) ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {eventos.length > 1 && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setSwitcher((s) => !s)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: evento?.color_acento || "#D4A017" }} />
                  {evento?.nombre || "Evento"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {switcher && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50" onMouseLeave={() => setSwitcher(false)}>
                    {eventos.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => { seleccionarEvento(e.id); setSwitcher(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-secondary",
                          e.id === evento?.id && "bg-secondary font-medium"
                        )}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: e.color_acento || "#D4A017" }} />
                        {e.nombre}
                        {e.activo && <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Activo</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <a
              href={evento?.instagram_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={evento?.facebook_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>

            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-secondary"
              aria-label="Menú"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-border pt-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-3 py-2.5 text-sm font-medium rounded-md",
                  isActive(l.to) ? "text-foreground bg-secondary" : "text-muted-foreground hover:bg-secondary/60"
                )}
              >
                {l.label}
              </Link>
            ))}
            {eventos.length > 1 && (
              <div className="px-3 pt-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Eventos</p>
                <div className="flex flex-wrap gap-2">
                  {eventos.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => { seleccionarEvento(e.id); setOpen(false); }}
                      className={cn(
                        "px-3 py-1.5 text-sm border rounded-md flex items-center gap-2",
                        e.id === evento?.id ? "border-foreground bg-secondary" : "border-border"
                      )}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: e.color_acento || "#D4A017" }} />
                      {e.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}