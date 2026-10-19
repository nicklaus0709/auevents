import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";

export default function PublicidadTicker() {
  const { evento } = useEvento();
  const [pubs, setPubs] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      try {
        const { items } = await base44.entities.Publicidad.filter(
          { evento_id: evento.id, activo: true },
          { sort: "orden", limit: 50 }
        );
        if (mounted) setPubs(items);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (!pubs.length) return null;
  const doubled = [...pubs, ...pubs];

  return (
    <div className="border-y border-border bg-secondary/40 overflow-hidden py-3">
      <div className="flex w-max marquee-track gap-10 px-5">
        {doubled.map((p, i) => (
          <a
            key={i}
            href={p.link_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 whitespace-nowrap text-sm shrink-0 group"
          >
            {p.imagen_url && (
              <img src={p.imagen_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            )}
            <span className="font-heading font-semibold">{p.comercio_nombre}</span>
            {p.descripcion && <span className="text-muted-foreground group-hover:text-foreground transition-colors">— {p.descripcion}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}