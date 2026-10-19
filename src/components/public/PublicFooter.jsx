import React from "react";
import { Link } from "react-router-dom";
import { useEvento } from "@/lib/eventoContext";
import PoweredBy from "@/components/public/PoweredBy";

export default function PublicFooter() {
  const { evento } = useEvento();
  const year = new Date().getFullYear();
  const social = [
    { label: "Instagram", url: evento?.instagram_url },
    { label: "Facebook", url: evento?.facebook_url },
  ].filter((s) => s.url);

  return (
    <footer className="bg-deep bg-festive text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <img src="/navidad/escudo.png" alt="Escudo de Capioví" className="mb-4 h-16 w-16 rounded-full bg-white p-1" />
          <p className="font-titulo text-2xl font-bold text-white">{evento?.nombre || "Municipalidad de Capioví"}</p>
          <p className="mt-3 text-sm leading-relaxed">Eventos de la comunidad de Capioví, Misiones. Cultura, gastronomía y tradición.</p>
          {social.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/15">{s.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Pie de página">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Explorá</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Inicio</Link></li>
            <li><Link to="/eventos" className="hover:text-white">Grilla de Eventos</Link></li>
            <li><Link to="/gastronomia" className="hover:text-white">Gastronomía</Link></li>
            <li><Link to="/bonos" className="hover:text-white">Bonos de colaboración</Link></li>
            <li><Link to="/contacto" className="hover:text-white">Contacto</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>📍 Capioví, Misiones</li>
            {evento?.whatsapp_url && (
              <li>💬 <a href={evento.whatsapp_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp de la Municipalidad</a></li>
            )}
          </ul>
          <ul className="mt-5 space-y-2 text-sm">
            <li><a href="https://capiovi.misiones.gov.ar" target="_blank" rel="noopener noreferrer" className="hover:text-white">Municipalidad de Capioví</a></li>
            <li><a href="https://capiovi.misiones.gov.ar/turismo" target="_blank" rel="noopener noreferrer" className="hover:text-white">Turismo</a></li>
            <li><a href="https://capiovi.misiones.gov.ar/salto-capiovi" target="_blank" rel="noopener noreferrer" className="hover:text-white">Salto Capioví</a></li>
            <li><a href="https://capiovi.misiones.gov.ar/museo-de-la-inmigracion-alemana" target="_blank" rel="noopener noreferrer" className="hover:text-white">Museo de la Inmigración Alemana</a></li>
          </ul>
          <Link to="/admin" className="mt-5 inline-block text-sm font-semibold text-white underline-offset-4 hover:underline">Acceso administradores →</Link>
        </div>
      </div>
      <div className="space-y-4 border-t border-white/10 px-4 py-6 text-center">
        <p className="text-xs text-white/60">© {year} Municipalidad de Capioví{evento?.nombre ? ` · ${evento.nombre}` : ""}. Todos los derechos reservados.</p>
        <PoweredBy />
      </div>
    </footer>
  );
}
