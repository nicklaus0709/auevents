import React, { useEffect, useState } from "react";
import { BedDouble, MapPin, Phone, Navigation } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { txt } from "@/lib/textos";
import { linkMapa, ordenarAlojamientos } from "@/lib/alojamientos";
import PageHero from "@/components/public/PageHero";
import Spinner from "@/components/public/Spinner";
import Tarjeta from "@/components/public/Tarjeta";
import Vacio from "@/components/public/Vacio";

export default function Alojamientos() {
  const { evento, loading } = useEvento();
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      setLoadingData(true);
      try {
        const { items } = await base44.entities.Alojamiento.filter({ evento_id: evento.id }, { limit: 200 });
        if (mounted) setItems(ordenarAlojamientos(items || []));
      } catch (e) {} finally {
        if (mounted) setLoadingData(false);
      }
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (loading || loadingData) return <Spinner />;

  return (
    <>
      <PageHero eyebrow={evento?.nombre} title={txt(evento, "alojamientos_titulo")} subtitle={txt(evento, "alojamientos_subtitulo")} image={evento?.hero_image} />
      <section className="section">
        {items.length === 0 ? (
          <Vacio>Pronto vas a ver acá los alojamientos recomendados.</Vacio>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <Tarjeta key={a.id} className="flex flex-col">
                <div className="relative h-40 bg-deep">
                  {a.imagen_url ? (
                    <img src={a.imagen_url} alt={a.nombre} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/40"><BedDouble className="h-12 w-12" /></div>
                  )}
                  {a.tipo && <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand shadow">{a.tipo}</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg leading-snug">{a.nombre}</h2>
                  {a.direccion && (
                    <p className="mt-2 flex items-start gap-2 text-sm text-stone-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {a.direccion}</p>
                  )}
                  {a.telefono && (
                    <p className="mt-1.5 flex items-center gap-2 text-sm text-stone-600">
                      <Phone className="h-4 w-4 shrink-0 text-brand" />
                      <a href={`tel:${a.telefono.replace(/[^\d+]/g, "")}`} className="hover:underline">{a.telefono}</a>
                    </p>
                  )}
                  <a href={linkMapa(a)} target="_blank" rel="noopener noreferrer" className="btn mt-5 self-start">
                    <Navigation className="h-4 w-4" /> Ver en Google Maps
                  </a>
                </div>
              </Tarjeta>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
