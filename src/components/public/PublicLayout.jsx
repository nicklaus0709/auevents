import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import PublicidadTicker from "@/components/public/PublicidadTicker";
import ChatWidget from "@/components/public/ChatWidget";
import SelectorEventos from "@/components/public/SelectorEventos";
import { useEvento } from "@/lib/eventoContext";
import { esNavidad, hexToRgbTriplet } from "@/lib/formato";
import { mostrarChat } from "@/lib/textos";

export default function PublicLayout() {
  const { evento, eventos, seleccionarEvento, loading, necesitaSeleccion } = useEvento();

  // Pantalla de carga y selector de evento (antes de entrar a cualquier página)
  if (loading) {
    return (
      <div className="public-site flex min-h-screen items-center justify-center text-stone-500">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-brand" />
      </div>
    );
  }
  if (necesitaSeleccion && eventos.length > 0) {
    return <SelectorEventos eventos={eventos} onSeleccionar={seleccionarEvento} />;
  }
  // Colores del evento como variables CSS "r g b" (brand = principal, brand2 = secundario)
  const theme = {
    "--brand": hexToRgbTriplet(evento?.color_primario, "193 18 31"),
    "--brand2": hexToRgbTriplet(evento?.color_acento, "21 128 61"),
  };

  return (
    <div className={`public-site min-h-screen flex flex-col ${esNavidad(evento) ? "navidad" : ""}`} style={theme}>
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicidadTicker />
      <PublicFooter />
      {mostrarChat(evento) && <ChatWidget />}
    </div>
  );
}