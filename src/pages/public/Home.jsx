import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, UtensilsCrossed, Heart, ArrowRight, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { Image } from "@/components/ui/image";

export default function Home() {
  const { evento, loading } = useEvento();
  const [fotos, setFotos] = useState([]);
  const [artistas, setArtistas] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      try {
        const [g, a] = await Promise.all([
          base44.entities.GaleriaFoto.filter({ evento_id: evento.id }, { sort: "orden", limit: 8 }),
          base44.entities.Artista.filter({ evento_id: evento.id }, { sort: "orden", limit: 3 }),
        ]);
        if (!mounted) return;
        setFotos(g.items || []);
        setArtistas(a.items || []);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>;
  }
  if (!evento) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-heading text-3xl font-bold mb-3">Próximamente</h1>
        <p className="text-muted-foreground max-w-md">Aún no hay eventos publicados. Volvé a visitarnos pronto.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end overflow-hidden">
        {evento.hero_image ? (
          <Image src={evento.hero_image} alt={evento.nombre} className="absolute inset-0 h-full w-full" fittingType="fill" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-foreground to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12 md:pb-20 w-full">
          <span className="inline-block px-3 py-1 mb-4 text-xs uppercase tracking-[0.25em] bg-white/15 backdrop-blur-sm text-white rounded-full border border-white/20">
            {evento.nombre}
          </span>
          <h1 className="font-heading font-bold text-white text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-balance max-w-3xl">
            Capioví es cultura
          </h1>
          {evento.descripcion && (
            <p className="mt-4 text-white/85 text-lg md:text-xl max-w-xl leading-relaxed">{evento.descripcion}</p>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/eventos" className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground font-semibold rounded-md hover:opacity-90 transition-opacity">
              Ver grilla de eventos <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/gastronomia" className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-md border border-white/25 hover:bg-white/20 transition-colors">
              <UtensilsCrossed className="h-4 w-4" /> Gastronomía
            </Link>
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: "/eventos", icon: Calendar, title: "Grilla de Eventos", desc: "Artistas, horarios y escenarios" },
            { to: "/gastronomia", icon: UtensilsCrossed, title: "Gastronomía", desc: "Puestos y sus productos" },
            { to: "/bonos", icon: Heart, title: "Bonos de Colaboración", desc: "Apoyá el evento" },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="group bg-card border border-border rounded-lg p-6 hover:border-foreground transition-colors shadow-sm">
              <c.icon className="h-7 w-7 mb-3" style={{ color: evento.color_acento || "hsl(var(--accent))" }} />
              <h3 className="font-heading font-semibold text-lg mb-1 flex items-center gap-1">
                {c.title} <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Nosotros / Historia */}
      {(evento.nosotros || evento.historia) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Nosotros</span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mt-2 mb-5">La comunidad de Capioví</h2>
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">{evento.nosotros || ""}</p>
            </div>
            <div className="md:border-l md:border-border md:pl-12">
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Historia</span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mt-2 mb-5">Nuestra tradición</h2>
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">{evento.historia || ""}</p>
            </div>
          </div>
        </section>
      )}

      {/* Artistas destacados */}
      {artistas.length > 0 && (
        <section className="bg-secondary/40 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Próximas presentaciones</span>
                <h2 className="font-heading font-bold text-3xl md:text-4xl mt-2">Artistas destacados</h2>
              </div>
              <Link to="/eventos" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {artistas.map((a) => (
                <div key={a.id} className="bg-card rounded-lg overflow-hidden border border-border group">
                  <div className="aspect-[4/3] overflow-hidden">
                    {a.imagen_url ? (
                      <img src={a.imagen_url} alt={a.nombre} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full bg-secondary flex items-center justify-center"><Calendar className="h-8 w-8 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-semibold text-lg">{a.nombre}</h3>
                    {a.genero && <p className="text-sm text-muted-foreground">{a.genero}</p>}
                    <p className="text-sm mt-2 text-foreground/70">
                      {a.fecha && new Date(a.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
                      {a.hora_inicio && ` · ${a.hora_inicio}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galería */}
      {fotos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Galería</span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mt-2 mb-8">Momentos del evento</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {fotos.map((f) => (
              <div key={f.id} className="aspect-square overflow-hidden rounded-lg group">
                {f.imagen_url && (
                  <img src={f.imagen_url} alt={f.titulo || ""} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA WhatsApp */}
      {evento.whatsapp_url && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-foreground text-background rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl mb-2">¿Querés participar del evento?</h2>
              <p className="text-background/70">Comunicate con la municipalidad para ser artista o tener tu puesto gastronómico.</p>
            </div>
            <a href={evento.whatsapp_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 bg-accent text-accent-foreground font-semibold rounded-md hover:opacity-90 transition-opacity whitespace-nowrap">
              <MessageCircle className="h-5 w-5" /> Escribinos por WhatsApp
            </a>
          </div>
        </section>
      )}
    </div>
  );
}