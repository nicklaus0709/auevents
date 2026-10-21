import React from "react";
import { partesDia } from "@/lib/formato";
import Tarjeta from "@/components/public/Tarjeta";

/** Tarjeta de un artista o actividad. `detalle` suma el escenario destacado y la descripción (grilla completa). */
export default function TarjetaArtista({ a, detalle = false }) {
  const p = partesDia(a.fecha);
  return (
    <Tarjeta>
      <div className="relative h-44 bg-deep">
        {a.imagen_url && <img src={a.imagen_url} alt={detalle ? a.nombre : ""} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
        {p && (
          <div className="absolute left-4 top-4 rounded-xl bg-white px-3 py-2 text-center leading-none shadow-lg">
            <span className="block text-2xl font-extrabold text-brand">{p.day}</span>
            <span className="text-xs font-bold uppercase text-stone-600">{p.month}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        {(a.hora_inicio || (!detalle && p)) && (
          <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
            {!detalle && p && <span className="capitalize">{p.weekday}</span>}
            {a.hora_inicio && `${!detalle && p ? " · " : ""}${a.hora_inicio}${detalle && a.hora_fin ? ` - ${a.hora_fin}` : ""} hs`}
          </p>
        )}
        <h3 className="mt-1 text-lg leading-snug">{a.nombre}</h3>
        {a.genero && <p className="mt-1 text-sm text-stone-600">{a.genero}</p>}
        {a.escenario && <p className={`mt-1 text-sm ${detalle ? "font-semibold text-brand" : "text-stone-600"}`}>{a.escenario}</p>}
        {detalle && a.descripcion && <p className="mt-3 text-sm leading-relaxed text-stone-600">{a.descripcion}</p>}
      </div>
    </Tarjeta>
  );
}
