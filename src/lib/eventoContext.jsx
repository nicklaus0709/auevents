import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const EventoContext = createContext(null);

export function EventoProvider({ children }) {
  const [eventos, setEventos] = useState([]);
  const [eventoId, setEventoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [necesitaSeleccion, setNecesitaSeleccion] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { items } = await base44.entities.Evento.filter({}, { sort: "-activo", limit: 50 });
        if (!mounted) return;
        setEventos(items);
        // Un link con ?evento=<slug o id> (ej: el de los códigos QR) entra directo a ese evento, sin pantalla de selección
        const pedido = new URLSearchParams(window.location.search).get("evento");
        const porLink = pedido && items.find((e) => e.id === pedido || e.slug === pedido);
        if (porLink) localStorage.setItem("capiovi_evento_id", porLink.id);
        const guardado = localStorage.getItem("capiovi_evento_id");
        if (!guardado) setNecesitaSeleccion(true);
        const inicial = items.find((e) => e.id === guardado) || items.find((e) => e.activo) || items[0];
        if (inicial) setEventoId(inicial.id);
      } catch (e) {
        // sitio público: visitantes anónimos pueden leer
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Vuelve a leer los eventos (después de guardar en el admin) para no trabajar con datos viejos
  const recargar = async () => {
    const { items } = await base44.entities.Evento.filter({}, { sort: "-activo", limit: 50 });
    setEventos(items);
    setEventoId((actual) => (items.some((e) => e.id === actual) ? actual : (items.find((e) => e.activo) || items[0])?.id ?? null));
    return items;
  };

  const evento = eventos.find((e) => e.id === eventoId) || null;

  const seleccionarEvento = (id) => {
    setEventoId(id);
    localStorage.setItem("capiovi_evento_id", id);
    setNecesitaSeleccion(false);
  };

  return (
    <EventoContext.Provider value={{ eventos, evento, eventoId, seleccionarEvento, loading, necesitaSeleccion, recargar }}>
      {children}
    </EventoContext.Provider>
  );
}

export function useEvento() {
  const ctx = useContext(EventoContext);
  if (!ctx) throw new Error("useEvento debe usarse dentro de EventoProvider");
  return ctx;
}