import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Recycle, HeartHandshake, Palette } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { amb, ambienteActivo, logoAmbiente } from "@/lib/ambiente";
import PageHero from "@/components/public/PageHero";
import Spinner from "@/components/public/Spinner";
import Gallery from "@/components/public/Gallery";
import VideoPlayer from "@/components/public/VideoPlayer";

const ordenar = (items) => [...items].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

export default function Ambiente() {
  const { evento, loading } = useEvento();
  const [pasos, setPasos] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      setCargando(true);
      const traer = async (nombre) => {
        try {
          const { items } = await base44.entities[nombre].filter({ evento_id: evento.id }, { limit: 200 });
          return ordenar(items || []);
        } catch {
          return [];
        }
      };
      const [p, f, v] = await Promise.all([traer("PasoReciclaje"), traer("AmbienteFoto"), traer("AmbienteVideo")]);
      if (!mounted) return;
      setPasos(p);
      setFotos(f.filter((x) => x.imagen_url));
      setVideos(v.filter((x) => x.video_url));
      setCargando(false);
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (loading || cargando) return <Spinner />;
  if (evento && !ambienteActivo(evento)) return <Navigate to="/" replace />;

  const parrafos = amb(evento, "ambiente_intro").split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={evento?.nombre}
        title={amb(evento, "ambiente_titulo")}
        subtitle={amb(evento, "ambiente_subtitulo")}
        image={evento?.hero_image}
      />

      {/* Qué hacemos */}
      <section className="section">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_20rem]">
          <div>
            <p className="eyebrow">Nuestro compromiso</p>
            <div className="mt-3 space-y-4 text-lg leading-relaxed text-stone-700">
              {parrafos.map((t, i) => <p key={i}>{t}</p>)}
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {[
                [Recycle, "Reciclamos plástico"],
                [HeartHandshake, "Lo hacemos con la comunidad"],
                [Palette, "Lo convertimos en arte"],
              ].map(([Icono, texto]) => (
                <li key={texto} className="inline-flex items-center gap-2 rounded-full bg-brand2/10 px-4 py-2 text-sm font-bold text-brand2">
                  <Icono className="h-4 w-4" aria-hidden="true" /> {texto}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto flex aspect-square w-full max-w-[20rem] items-center justify-center rounded-3xl bg-white p-8 shadow-xl ring-1 ring-stone-200">
            <img src={logoAmbiente(evento)} alt="Capioví apoyando al medio ambiente" className="h-full w-full object-contain" />
          </div>
        </div>
      </section>

      {/* Proceso de reciclaje */}
      {pasos.length > 0 && (
        <section className="bg-white">
          <div className="section">
            <p className="eyebrow">Paso a paso</p>
            <h2 className="text-3xl sm:text-4xl">{amb(evento, "ambiente_proceso_titulo")}</h2>
            <p className="mt-3 max-w-2xl text-lg text-stone-600">{amb(evento, "ambiente_proceso_intro")}</p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pasos.map((p, i) => (
                <li key={p.id} className="flex flex-col overflow-hidden rounded-2xl border-t-4 border-brand2 bg-cream shadow-sm ring-1 ring-stone-200">
                  {p.imagen_url && <img src={p.imagen_url} alt={p.titulo} loading="lazy" className="h-44 w-full object-cover" />}
                  <div className="flex flex-1 gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand2 text-lg font-extrabold text-white">{i + 1}</span>
                    <div>
                      <h3 className="text-lg leading-snug">{p.titulo}</h3>
                      {p.descripcion && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-600">{p.descripcion}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Videos del proceso */}
      {videos.length > 0 && (
        <section className="section">
          <p className="eyebrow">Mirá cómo lo hacemos</p>
          <h2 className="mb-8 text-3xl sm:text-4xl">{amb(evento, "ambiente_videos_titulo")}</h2>
          <ul className="grid gap-8 md:grid-cols-2">
            {videos.map((v) => (
              <li key={v.id}>
                <VideoPlayer url={v.video_url} titulo={v.titulo} />
                <h3 className="mt-3 text-lg">{v.titulo}</h3>
                {v.descripcion && <p className="mt-1 text-sm leading-relaxed text-stone-600">{v.descripcion}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Galería */}
      {fotos.length > 0 && (
        <section className="bg-white">
          <div className="section">
            <p className="eyebrow">Galería</p>
            <h2 className="mb-8 text-3xl sm:text-4xl">{amb(evento, "ambiente_galeria_titulo")}</h2>
            <Gallery images={fotos} alt="Arte hecho con plástico reciclado" />
          </div>
        </section>
      )}

      <section className="px-4 pb-16 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-3xl bg-deep bg-festive p-8 text-white shadow-xl">
          <p className="max-w-xl font-titulo text-2xl font-bold">Cada adorno es una botella que volvió a la fiesta.</p>
          <Link to="/" className="btn-light">Volver al inicio</Link>
        </div>
      </section>
    </>
  );
}
