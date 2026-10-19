import React, { useEffect, useState } from "react";
import { UtensilsCrossed, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";

export default function Gastronomia() {
  const { evento, loading } = useEvento();
  const [puestos, setPuestos] = useState([]);
  const [productos, setProductos] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      setLoadingData(true);
      try {
        const [p, prod] = await Promise.all([
          base44.entities.PuestoGastronomico.filter({ evento_id: evento.id }, { sort: "numero", limit: 100 }),
          base44.entities.Producto.filter({ evento_id: evento.id }, { limit: 500 }),
        ]);
        if (!mounted) return;
        setPuestos(p.items || []);
        const grouped = {};
        (prod.items || []).forEach((pr) => {
          if (!grouped[pr.puesto_id]) grouped[pr.puesto_id] = [];
          grouped[pr.puesto_id].push(pr);
        });
        setProductos(grouped);
      } catch (e) {} finally {
        if (mounted) setLoadingData(false);
      }
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (loading || loadingData) {
    return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{evento?.nombre}</span>
        <h1 className="font-heading font-bold text-4xl md:text-5xl mt-2">Grilla Gastronómica</h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl">Los puestos de comida del evento y sus productos.</p>
      </header>

      {puestos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <UtensilsCrossed className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aún no hay puestos cargados para este evento.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {puestos.map((p) => {
            const prods = productos[p.id] || [];
            return (
              <article key={p.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-[5/3] overflow-hidden bg-secondary relative">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><UtensilsCrossed className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                  <span className="absolute top-3 left-3 h-9 w-9 flex items-center justify-center rounded-full bg-foreground text-background font-heading font-bold text-sm">
                    {p.numero ?? "—"}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-lg">{p.nombre}</h3>
                  {p.responsable && <p className="text-sm text-muted-foreground">{p.responsable}</p>}
                  {p.descripcion && <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{p.descripcion}</p>}

                  {prods.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Productos</p>
                      <ul className="space-y-1.5">
                        {prods.map((pr) => (
                          <li key={pr.id} className="flex justify-between gap-3 text-sm">
                            <span className="text-foreground/80">{pr.nombre}</span>
                            {typeof pr.precio === "number" && (
                              <span className="font-medium whitespace-nowrap">${pr.precio.toLocaleString("es-AR")}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.whatsapp && (
                    <a href={p.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:text-accent transition-colors">
                      <MessageCircle className="h-4 w-4" /> Contactar puesto
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}