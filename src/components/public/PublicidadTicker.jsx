import React, { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";

function safeUrl(u) {
  try {
    return u && /^https?:$/.test(new URL(u).protocol) ? u : null;
  } catch {
    return null;
  }
}

/** Banners de comercios: muestra hasta 3 a la vez (1 en celular) y rota cada 5 segundos. */
export default function PublicidadTicker() {
  const { evento } = useEvento();
  const [ads, setAds] = useState([]);
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const [detenido, setDetenido] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      try {
        const { items } = await base44.entities.Publicidad.filter(
          { evento_id: evento.id, activo: true },
          { sort: "orden", limit: 50 }
        );
        if (mounted) setAds((items || []).filter((a) => a.imagen_url));
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  useEffect(() => {
    if (ads.length <= 1 || paused || detenido) return;
    const t = setInterval(() => setStart((v) => (v + 1) % ads.length), 5000);
    return () => clearInterval(t);
  }, [ads.length, paused, detenido]);

  if (!ads.length) return null;

  const visible = Math.min(3, ads.length);
  const shown = Array.from({ length: visible }, (_, i) => ads[(start + i) % ads.length]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-600">Nos acompañan nuestros comercios</p>
      <ul className="grid gap-4 md:grid-cols-3">
        {shown.map((ad, i) => {
          const href = safeUrl(ad.link_url);
          const img = (
            <img
              src={ad.imagen_url}
              alt={`Publicidad: ${ad.comercio_nombre || ""}`}
              loading="lazy"
              className="aspect-[3/1] w-full animate-fade-in rounded-2xl object-cover shadow-sm ring-1 ring-stone-200"
            />
          );
          return (
            <li key={`${ad.id}-${start}-${i}`} className={i > 0 ? "hidden md:block" : ""}>
              {href ? <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="block transition hover:-translate-y-0.5">{img}</a> : img}
            </li>
          );
        })}
      </ul>
      {ads.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setDetenido((d) => !d)}
            aria-pressed={detenido}
            aria-label={detenido ? "Reanudar rotación de publicidades" : "Pausar rotación de publicidades"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-100"
          >
            {detenido ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
          <div className="flex gap-1.5" role="group" aria-label="Publicidades">
          {ads.map((a, idx) => (
            <button
              key={a.id}
              aria-label={`Ver desde ${a.comercio_nombre || "publicidad"}`}
              onClick={() => setStart(idx)}
              className={`h-2 rounded-full transition-all ${idx === start ? "w-6 bg-brand" : "w-2 bg-stone-400"}`}
            />
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
