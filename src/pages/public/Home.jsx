import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { formatFechaLarga, parseHistory, partesDia } from "@/lib/formato";
import Gallery from "@/components/public/Gallery";
import Spinner from "@/components/public/Spinner";

const paragraphs = (text) => (text || "").split(/\n\s*\n/).filter(Boolean);

export default function Home() {
  const { evento, loading } = useEvento();
  const [fotos, setFotos] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [hayPuestos, setHayPuestos] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      try {
        const [g, a, p] = await Promise.all([
          base44.entities.GaleriaFoto.filter({ evento_id: evento.id }, { sort: "orden", limit: 24 }),
          base44.entities.Artista.filter({ evento_id: evento.id }, { sort: "orden", limit: 100 }),
          base44.entities.PuestoGastronomico.filter({ evento_id: evento.id }, { limit: 1 }),
        ]);
        if (!mounted) return;
        setFotos((g.items || []).filter((f) => f.imagen_url));
        setArtistas(a.items || []);
        setHayPuestos((p.items || []).length > 0);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (loading) return <Spinner />;
  if (!evento) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-3 text-3xl">Próximamente</h1>
        <p className="max-w-md text-stone-500">Aún no hay eventos publicados. Volvé a visitarnos pronto.</p>
      </div>
    );
  }

  // Próximas actividades: las que todavía no pasaron; si no hay, las primeras de la grilla
  const hoy = new Date().toISOString().slice(0, 10);
  const conFecha = artistas.filter((a) => a.fecha).sort((a, b) => (a.fecha + (a.hora_inicio || "")).localeCompare(b.fecha + (b.hora_inicio || "")));
  const proximas = conFecha.filter((a) => a.fecha >= hoy);
  const destacados = (proximas.length ? proximas : artistas).slice(0, 3);

  const fechas = [...new Set(conFecha.map((a) => a.fecha))];
  const cuando = evento.periodo || (fechas.length
    ? fechas.length === 1
      ? formatFechaLarga(fechas[0])
      : `${formatFechaLarga(fechas[0])} — ${formatFechaLarga(fechas[fechas.length - 1])}`
    : null);
  const escenarios = [...new Set(artistas.map((a) => a.escenario).filter(Boolean))];
  const donde = evento.lugar || escenarios.join(" · ");

  const historia = evento.historia ? parseHistory(evento.historia) : null;
  const nosotros = paragraphs(evento.nosotros);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex h-[78vh] max-h-[52rem] min-h-[34rem] items-end overflow-hidden bg-deep bg-festive text-white">
        {evento.hero_image && <img src={evento.hero_image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-24 sm:px-6 sm:pb-32">
          {evento.logo_url && (
            <div className="animate-fade-up mb-6 inline-block rounded-2xl bg-white p-2 shadow-2xl">
              <img src={evento.logo_url} alt={evento.nombre} className="h-20 w-auto sm:h-24" />
            </div>
          )}
          <p className="animate-fade-up mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/80">Capioví · Misiones · Argentina</p>
          <h1 className="animate-fade-up max-w-3xl text-balance font-titulo text-5xl !text-white sm:text-7xl">{evento.nombre}</h1>
          {evento.descripcion && <p className="animate-fade-up mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">{evento.descripcion}</p>}
          <div className="animate-fade-up mt-8 flex flex-wrap gap-3">
            <Link to="/eventos" className="btn-light">Ver grilla de eventos</Link>
            <Link to="/gastronomia" className="btn-ghost">Gastronomía</Link>
            <Link to="/bonos" className="btn !px-6 !py-3">Comprar bono</Link>
          </div>
        </div>
      </section>

      {/* BARRA DE INFO */}
      <div className="relative z-10 mx-auto -mt-14 max-w-5xl px-4 sm:px-6">
        <dl className="grid gap-px overflow-hidden rounded-2xl bg-stone-200 shadow-xl sm:grid-cols-3">
          {cuando && <div className="bg-white p-5"><dt className="text-xs font-bold uppercase tracking-widest text-brand">Cuándo</dt><dd className="mt-1 font-bold text-stone-900">{cuando}</dd></div>}
          {donde && <div className="bg-white p-5"><dt className="text-xs font-bold uppercase tracking-widest text-brand">Dónde</dt><dd className="mt-1 font-bold text-stone-900">{donde}</dd></div>}
          <div className="bg-white p-5">
            <dt className="text-xs font-bold uppercase tracking-widest text-brand">Más info</dt>
            <dd className="mt-1 font-bold text-stone-900"><Link to="/contacto" className="underline">Escribinos</Link></dd>
          </div>
        </dl>
      </div>

      {/* PRÓXIMAS ACTIVIDADES */}
      {destacados.length > 0 && (
        <section className="section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="eyebrow">Agenda</p><h2 className="text-3xl sm:text-4xl">Próximas actividades</h2></div>
            <Link to="/eventos" className="text-sm font-bold text-brand hover:underline">Ver toda la grilla →</Link>
          </div>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {destacados.map((a) => {
              const p = partesDia(a.fecha);
              return (
                <li key={a.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-40 bg-deep">
                    {a.imagen_url && <img src={a.imagen_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                    {p && (
                      <div className="absolute left-4 top-4 rounded-xl bg-white px-3 py-2 text-center leading-none shadow-lg">
                        <span className="block text-2xl font-extrabold text-brand">{p.day}</span>
                        <span className="text-xs font-bold uppercase text-stone-600">{p.month}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      {p && <span className="capitalize">{p.weekday}</span>}{a.hora_inicio && ` · ${a.hora_inicio} hs`}
                    </p>
                    <h3 className="mt-1 text-lg leading-snug">{a.nombre}</h3>
                    {a.genero && <p className="mt-1 text-sm text-stone-500">{a.genero}</p>}
                    {a.escenario && <p className="mt-1 text-sm text-stone-500">{a.escenario}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* NOSOTROS */}
      {nosotros.length > 0 && (
        <section id="nosotros" className="bg-white">
          <div className="section grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="eyebrow">Nosotros</p>
              <h2 className="text-3xl sm:text-4xl">Una celebración de toda la comunidad</h2>
              <div className="mt-5 space-y-4 leading-relaxed text-stone-700">{nosotros.map((t, i) => <p key={i}>{t}</p>)}</div>
              {evento.lema && <p className="mt-6 border-l-4 border-brand pl-4 font-titulo text-2xl font-bold italic text-stone-900">“{evento.lema}”</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                {hayPuestos && <Link to="/gastronomia" className="btn">Ver gastronomía</Link>}
                <Link to="/contacto" className="btn-secondary">Quiero participar</Link>
              </div>
            </div>
            {fotos[0] && (
              <div className="relative">
                <img src={fotos[0].imagen_url} alt={fotos[0].titulo || evento.nombre} loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl" />
                {fotos[1] && <img src={fotos[1].imagen_url} alt="" loading="lazy" className="absolute -bottom-6 -left-4 hidden aspect-square w-40 rounded-2xl border-4 border-white object-cover shadow-xl sm:block" />}
              </div>
            )}
          </div>
        </section>
      )}

      {/* HISTORIA */}
      {historia && (historia.intro.length > 0 || historia.items.length > 0) && (
        <section id="historia" className="bg-deep bg-festive text-white">
          <div className="section">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">Historia</p>
            <h2 className="text-3xl !text-white sm:text-4xl">Cómo llegamos hasta acá</h2>
            {historia.intro.map((t, i) => <p key={i} className="mt-5 max-w-3xl leading-relaxed text-white/85">{t}</p>)}
            {historia.items.length > 0 && (
              <ol className="relative mt-12 space-y-8 border-l-2 border-white/25 pl-8 sm:ml-4">
                {historia.items.map((it) => (
                  <li key={it.title} className="relative">
                    <span className="absolute -left-[2.6rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand ring-4 ring-white/20" />
                    <h3 className="font-titulo text-2xl !text-white">{it.title}</h3>
                    <div className="mt-2 max-w-3xl space-y-3 leading-relaxed text-white/80">{paragraphs(it.body).map((t, i) => <p key={i}>{t}</p>)}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}

      {/* GALERÍA */}
      {fotos.length > 0 && (
        <section id="galeria" className="section">
          <p className="eyebrow">Galería</p>
          <h2 className="mb-8 text-3xl sm:text-4xl">Momentos que se quedan en el corazón</h2>
          <Gallery images={fotos} alt={`Foto de ${evento.nombre}`} />
        </section>
      )}

      {/* CTA BONOS */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand2 p-8 text-white shadow-2xl sm:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">Bonos de colaboración</p>
          <h2 className="mt-2 max-w-xl text-3xl !text-white sm:text-4xl">Sumate: tu aporte hace posible el evento</h2>
          <p className="mt-3 max-w-xl text-white/90">Registrá tu bono y colaborá con la comunidad de Capioví.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/bonos" className="btn-light">Ver bonos</Link>
            {evento.whatsapp_url && (
              <a href={evento.whatsapp_url} target="_blank" rel="noopener noreferrer" className="btn-ghost">Escribinos por WhatsApp</a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
