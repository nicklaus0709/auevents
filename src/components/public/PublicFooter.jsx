import React from "react";
import { Link } from "react-router-dom";
import { useEvento } from "@/lib/eventoContext";
import PoweredBy from "@/components/public/PoweredBy";
import { txt, parseLinks, mostrarBonos } from "@/lib/textos";

export default function PublicFooter() {
  const { evento } = useEvento();
  const year = new Date().getFullYear();
  const social = [
    { label: "Instagram", url: evento?.instagram_url },
    { label: "Facebook", url: evento?.facebook_url },
  ].filter((s) => s.url);

  return (
    <footer className="bg-deep bg-festive text-white/80">
      <div className="stripe-candy" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <img src="/navidad/escudo.png" alt="Escudo de Capioví" className="h-16 w-auto drop-shadow-lg" />
            {evento?.logo_url && <img src={evento.logo_url} alt="" className="h-14 w-auto rounded-xl bg-white px-2 py-0.5" />}
          </div>
          <p className="font-titulo text-2xl font-bold text-white">{evento?.nombre || "Municipalidad de Capioví"}</p>
          <p className="mt-3 text-sm leading-relaxed">{txt(evento, "footer_texto")}</p>
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
            {mostrarBonos(evento) && <li><Link to="/bonos" className="hover:text-white">Bonos de colaboración</Link></li>}
            <li><Link to="/contacto" className="hover:text-white">Contacto</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm">
            {txt(evento, "footer_ubicacion") && <li>📍 {txt(evento, "footer_ubicacion")}</li>}
            {evento?.telefono && <li>📞 <a href={`tel:${evento.telefono.replace(/[^\d+]/g, "")}`} className="hover:text-white">{evento.telefono}</a></li>}
            {evento?.email && <li>✉️ <a href={`mailto:${evento.email}`} className="hover:text-white">{evento.email}</a></li>}
            {evento?.whatsapp_url && (
              <li>💬 <a href={evento.whatsapp_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp de la Municipalidad</a></li>
            )}
          </ul>
          {parseLinks(evento).length > 0 && (
            <ul className="mt-5 space-y-2 text-sm">
              {parseLinks(evento).map((l) => (
                <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">{l.label}</a></li>
              ))}
            </ul>
          )}
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
