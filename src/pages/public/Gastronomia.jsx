import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { formatMoney } from "@/lib/formato";
import PageHero from "@/components/public/PageHero";
import { txt } from "@/lib/textos";
import Spinner from "@/components/public/Spinner";
import Tarjeta from "@/components/public/Tarjeta";
import Vacio from "@/components/public/Vacio";

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
        setPuestos([...(p.items || [])].sort((a, b) => (a.numero ?? Infinity) - (b.numero ?? Infinity)));
        const grouped = {};
        (prod.items || []).forEach((pr) => {
          (grouped[pr.puesto_id] ||= []).push(pr);
        });
        setProductos(grouped);
      } catch (e) {} finally {
        if (mounted) setLoadingData(false);
      }
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (loading || loadingData) return <Spinner />;

  return (
    <>
      <PageHero eyebrow={evento?.nombre} title={txt(evento, "gastronomia_titulo")} subtitle={txt(evento, "gastronomia_subtitulo")} image={evento?.hero_image} />
      <section className="section">
        {puestos.length === 0 ? (
          <Vacio>Pronto vas a ver acá los puestos gastronómicos.</Vacio>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {puestos.map((p) => {
              const prods = productos[p.id] || [];
              return (
                <Tarjeta key={p.id} className="flex flex-col">
                  {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} loading="lazy" className="h-40 w-full object-cover" />}
                  <div className="flex items-center gap-4 border-b border-stone-100 p-5">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-2xl font-extrabold text-onbrand shadow-md shadow-brand/30" aria-label={`Puesto ${p.numero ?? ""}`}>
                      {p.numero ?? "—"}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg leading-tight">{p.nombre}</h2>
                      {p.responsable && <p className="text-sm text-stone-600">{p.responsable}</p>}
                    </div>
                  </div>
                  {p.descripcion && <p className="px-5 pt-4 text-sm leading-relaxed text-stone-600">{p.descripcion}</p>}
                  {prods.length > 0 && (
                    <ul className="flex-1 divide-y divide-dashed divide-stone-200 px-5 py-2 text-sm">
                      {prods.map((pr) => (
                        <li key={pr.id} className="flex items-baseline justify-between gap-3 py-2">
                          <span>{pr.nombre}</span>
                          {typeof pr.precio === "number" && (
                            <span className="shrink-0 rounded-full bg-brand2/10 px-2.5 py-0.5 text-xs font-bold text-brand2">{formatMoney(pr.precio)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.whatsapp && (
                    <a href={p.whatsapp} target="_blank" rel="noopener noreferrer" className="m-5 mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                      <MessageCircle className="h-4 w-4" /> Contactar puesto
                    </a>
                  )}
                </Tarjeta>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
