import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";

export default function Eventos() {
  const { evento, loading } = useEvento();
  const [artistas, setArtistas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      setLoadingData(true);
      try {
        const { items } = await base44.entities.Artista.filter(
          { evento_id: evento.id },
          { sort: "orden", limit: 100 }
        );
        if (mounted) setArtistas(items || []);
      } catch (e) {} finally {
        if (mounted) setLoadingData(false);
      }
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (loading || loadingData) {
    return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>;
  }

  // Agrupar por fecha
  const porFecha = {};
  (artistas || []).forEach((a) => {
    const key = a.fecha || "Sin fecha";
    if (!porFecha[key]) porFecha[key] = [];
    porFecha[key].push(a);
  });
  const fechas = Object.keys(porFecha).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{evento?.nombre}</span>
        <h1 className="font-heading font-bold text-4xl md:text-5xl mt-2">Grilla de Eventos</h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl">Artistas, horarios y escenarios del evento.</p>
      </header>

      {fechas.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aún no hay artistas cargados para este evento.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {fechas.map((fecha) => (
            <div key={fecha}>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                <Calendar className="h-5 w-5" style={{ color: evento?.color_acento || "hsl(var(--accent))" }} />
                <h2 className="font-heading font-semibold text-xl md:text-2xl">
                  {fecha === "Sin fecha" ? "Sin fecha" : new Date(fecha).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {porFecha[fecha].map((a) => (
                  <article key={a.id} className="bg-card border border-border rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="aspect-[5/3] overflow-hidden bg-secondary">
                      {a.imagen_url ? (
                        <img src={a.imagen_url} alt={a.nombre} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><Calendar className="h-8 w-8 text-muted-foreground" /></div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading font-semibold text-lg mb-1">{a.nombre}</h3>
                      {a.genero && <p className="text-sm text-muted-foreground mb-3">{a.genero}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-foreground/70">
                        {a.hora_inicio && (
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {a.hora_inicio}{a.hora_fin ? ` - ${a.hora_fin}` : ""}</span>
                        )}
                        {a.escenario && (
                          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {a.escenario}</span>
                        )}
                      </div>
                      {a.descripcion && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a.descripcion}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}