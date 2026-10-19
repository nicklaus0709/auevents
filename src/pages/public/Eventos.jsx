import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { formatDia, partesDia } from "@/lib/formato";
import PageHero from "@/components/public/PageHero";
import { txt } from "@/lib/textos";
import Spinner from "@/components/public/Spinner";

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
        const { items } = await base44.entities.Artista.filter({ evento_id: evento.id }, { sort: "orden", limit: 100 });
        if (mounted) setArtistas(items || []);
      } catch (e) {} finally {
        if (mounted) setLoadingData(false);
      }
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (loading || loadingData) return <Spinner />;

  // Agrupar por fecha
  const porFecha = {};
  artistas.forEach((a) => {
    const key = a.fecha || "Sin fecha";
    (porFecha[key] ||= []).push(a);
  });
  const fechas = Object.keys(porFecha).sort();

  return (
    <>
      <PageHero eyebrow={evento?.nombre} title={txt(evento, "eventos_titulo")} subtitle={txt(evento, "eventos_subtitulo")} image={evento?.hero_image} />
      <section className="section">
        {fechas.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500">Aún no hay artistas cargados para este evento.</p>
        ) : (
          <div className="space-y-12">
            {fechas.map((fecha) => (
              <div key={fecha}>
                <h2 className="mb-5 border-b border-stone-200 pb-3 text-2xl capitalize">
                  {fecha === "Sin fecha" ? "Durante toda la celebración" : formatDia(fecha)}
                </h2>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {porFecha[fecha].map((a) => {
                    const p = partesDia(a.fecha);
                    return (
                      <li key={a.id} className="group overflow-hidden rounded-2xl border-t-4 border-brand bg-white shadow-sm ring-1 ring-stone-200 transition even:border-brand2 hover:-translate-y-1 hover:shadow-xl">
                        <div className="relative h-44 bg-deep">
                          {a.imagen_url && <img src={a.imagen_url} alt={a.nombre} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                          {p && (
                            <div className="absolute left-4 top-4 rounded-xl bg-white px-3 py-2 text-center leading-none shadow-lg">
                              <span className="block text-2xl font-extrabold text-brand">{p.day}</span>
                              <span className="text-xs font-bold uppercase text-stone-600">{p.month}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          {a.hora_inicio && (
                            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{a.hora_inicio}{a.hora_fin ? ` - ${a.hora_fin}` : ""} hs</p>
                          )}
                          <h3 className="mt-1 text-lg leading-snug">{a.nombre}</h3>
                          {a.genero && <p className="mt-1 text-sm text-stone-500">{a.genero}</p>}
                          {a.escenario && <p className="mt-1 text-sm font-semibold text-brand">{a.escenario}</p>}
                          {a.descripcion && <p className="mt-3 text-sm leading-relaxed text-stone-600">{a.descripcion}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
