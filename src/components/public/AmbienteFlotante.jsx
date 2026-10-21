import React from "react";
import { Link } from "react-router-dom";
import { ambienteActivo, logoAmbiente } from "@/lib/ambiente";

/** Logo flotante del home: lleva a la sección "Capioví apoyando al medio ambiente". */
export default function AmbienteFlotante({ evento }) {
  if (!ambienteActivo(evento)) return null;
  return (
    <Link
      to="/medio-ambiente"
      aria-label="Capioví apoyando al medio ambiente"
      className="no-print group fixed bottom-4 left-4 z-30 flex items-center gap-3"
    >
      <span className="flex h-14 w-14 animate-flotar items-center justify-center rounded-full bg-white p-1.5 shadow-xl ring-2 ring-emerald-500 transition group-hover:scale-110 sm:h-20 sm:w-20">
        <img src={logoAmbiente(evento)} alt="" className="h-full w-full rounded-full object-contain" />
      </span>
      <span className="pointer-events-none max-w-[13rem] -translate-x-2 rounded-full bg-white px-4 py-2 text-xs font-bold leading-snug text-emerald-800 opacity-0 shadow-lg transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        Capioví apoyando al medio ambiente
      </span>
    </Link>
  );
}
