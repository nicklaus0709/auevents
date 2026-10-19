import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import PublicidadTicker from "@/components/public/PublicidadTicker";
import ChatWidget from "@/components/public/ChatWidget";
import { useEvento } from "@/lib/eventoContext";
import { hexToRgbTriplet } from "@/lib/formato";

export default function PublicLayout() {
  const { evento } = useEvento();
  // Colores del evento como variables CSS "r g b" (brand = principal, brand2 = secundario)
  const theme = {
    "--brand": hexToRgbTriplet(evento?.color_primario, "185 28 28"),
    "--brand2": hexToRgbTriplet(evento?.color_acento, "22 101 52"),
  };

  return (
    <div className="public-site min-h-screen flex flex-col" style={theme}>
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicidadTicker />
      <PublicFooter />
      <ChatWidget />
    </div>
  );
}
