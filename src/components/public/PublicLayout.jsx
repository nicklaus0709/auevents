import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import PublicidadTicker from "@/components/public/PublicidadTicker";
import ChatWidget from "@/components/public/ChatWidget";
import SelectorEventos from "@/components/public/SelectorEventos";
import { useEvento } from "@/lib/eventoContext";
import { colorSobre, esNavidad, hexToRgbTriplet } from "@/lib/formato";
import Spinner from "@/components/public/Spinner";
import { mostrarChat } from "@/lib/textos";

export default function PublicLayout() {
  const { evento, eventos, seleccionarEvento, loading, necesitaSeleccion } = useEvento();

  // El título de la pestaña lleva el nombre del evento elegido
  useEffect(() => {
    document.title = evento && !necesitaSeleccion ? `${evento.nombre} · Eventos Capioví` : "Eventos Capioví";
  }, [evento?.nombre, necesitaSeleccion]);

  // Pantalla de carga y selector de evento (antes de entrar a cualquier página)
  if (loading) {
    return (
      <div className="public-site min-h-screen">
        <Spinner />
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
    "--on-brand": colorSobre(evento?.color_primario || "#c1121f"),
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