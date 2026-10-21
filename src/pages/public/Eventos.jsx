import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { formatDia } from "@/lib/formato";
import PageHero from "@/components/public/PageHero";
import { txt } from "@/lib/textos";
import Spinner from "@/components/public/Spinner";
import TarjetaArtista from "@/components/public/TarjetaArtista";
import Vacio from "@/components/public/Vacio";

function Filtro({ etiqueta, valor, onChange, opciones }) {
  const todos = [{ valor: "todos", texto: "Todos" }, ...opciones];
  return (
    <div role="group" aria-label={`Filtrar por ${etiqueta.toLowerCase()}`} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-bold uppercase tracking-wider text-stone-600">{etiqueta}</span>
      {todos.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={valor === o.valor}
          onClick={() => onChange(o.valor)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold capitalize transition ${valor === o.valor ? "border-brand bg-brand text-onbrand" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"}`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

export default function Eventos() {
  const { evento, loading } = useEvento();
  const [artistas, setArtistas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dia, setDia] = useState("todos");
  const [escenario, setEscenario] = useState("todos");

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

  // Filtros por día y escenario (solo se ofrecen si hay más de una opción)
  const dias = [...new Set(artistas.map((a) => a.fecha || "Sin fecha"))].sort();
  const escenarios = [...new Set(artistas.map((a) => a.escenario).filter(Boolean))].sort();
  const visibles = artistas.filter((a) => (dia === "todos" || (a.fecha || "Sin fecha") === dia) && (escenario === "todos" || a.escenario === escenario));

  // Agrupar por fecha
  const porFecha = {};
  visibles.forEach((a) => {
    const key = a.fecha || "Sin fecha";
    (porFecha[key] ||= []).push(a);
  });
  const fechas = Object.keys(porFecha).sort();
  fechas.forEach((f) => porFecha[f].sort((a, b) => (a.hora_inicio || "99:99").localeCompare(b.hora_inicio || "99:99") || (a.orden ?? 0) - (b.orden ?? 0)));

  return (
    <>
      <PageHero eyebrow={evento?.nombre} title={txt(evento, "eventos_titulo")} subtitle={txt(evento, "eventos_subtitulo")} image={evento?.hero_image} />
      <section className="section">
        {(dias.length > 1 || escenarios.length > 1) && (
          <div className="mb-10 space-y-4">
            {dias.length > 1 && (
              <Filtro etiqueta="Día" valor={dia} onChange={setDia} opciones={dias.map((d) => ({ valor: d, texto: d === "Sin fecha" ? "Sin fecha" : formatDia(d) }))} />
            )}
            {escenarios.length > 1 && (
              <Filtro etiqueta="Escenario" valor={escenario} onChange={setEscenario} opciones={escenarios.map((x) => ({ valor: x, texto: x }))} />
            )}
          </div>
        )}
        {artistas.length === 0 ? (
          <Vacio>Aún no hay artistas cargados para este evento.</Vacio>
        ) : fechas.length === 0 ? (
          <Vacio>No hay actividades para ese filtro. Probá con otro día o escenario.</Vacio>
        ) : (
          <div className="space-y-12">
            {fechas.map((fecha) => (
              <div key={fecha}>
                <h2 className="mb-5 border-b border-stone-200 pb-3 text-2xl capitalize">
                  {fecha === "Sin fecha" ? "Durante toda la celebración" : formatDia(fecha)}
                </h2>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {porFecha[fecha].map((a) => <TarjetaArtista key={a.id} a={a} detalle />)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
