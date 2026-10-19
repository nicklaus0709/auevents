import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle, MapPin } from "lucide-react";
import { useEvento } from "@/lib/eventoContext";

export default function PublicFooter() {
  const { evento } = useEvento();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-heading font-bold text-xl mb-3">Municipalidad de Capioví</h3>
            <p className="text-sm text-background/70 leading-relaxed">
              Eventos de la comunidad de Capioví, Misiones. Cultura, gastronomía y tradición.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-3 text-background/60">Secciones</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/eventos" className="hover:text-accent transition-colors">Grilla de Eventos</Link></li>
              <li><Link to="/gastronomia" className="hover:text-accent transition-colors">Gastronomía</Link></li>
              <li><Link to="/bonos" className="hover:text-accent transition-colors">Bonos de Colaboración</Link></li>
              <li><Link to="/contacto" className="hover:text-accent transition-colors">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-3 text-background/60">Seguinos</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href={evento?.instagram_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a href={evento?.facebook_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Facebook className="h-4 w-4" /> Facebook
              </a>
              <a href={evento?.whatsapp_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <span className="flex items-center gap-2 text-background/60">
                <MapPin className="h-4 w-4" /> Capioví, Misiones
              </span>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-background/15 flex flex-col sm:flex-row justify-between gap-3 text-xs text-background/50">
          <p>© {year} Municipalidad de Capioví. Todos los derechos reservados.</p>
          <Link to="/admin" className="hover:text-accent transition-colors">Acceso administradores</Link>
        </div>
      </div>
    </footer>
  );
}