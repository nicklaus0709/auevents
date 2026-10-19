import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Music, UtensilsCrossed, Images, Megaphone, BedDouble, Mail, Heart, ExternalLink, Settings, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import PageHeader, { Panel, Spinner } from "@/components/admin/PageHeader";

const fmt = (n) => `$${(n || 0).toLocaleString("es-AR")}`;

export default function Resumen({ onNavigate }) {
  const { evento } = useEvento();
  const [d, setD] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      const q = { evento_id: evento.id };
      const list = async (name) => {
        try {
          const { items } = await base44.entities[name].filter(q, { limit: 500 });
          return items || [];
        } catch {
          return [];
        }
      };
      const [artistas, puestos, fotos, pubs, mensajes, bonos, alojamientos] = await Promise.all(
        ["Artista", "PuestoGastronomico", "GaleriaFoto", "Publicidad", "MensajeContacto", "SolicitudBono", "Alojamiento"].map(list)
      );
      if (!mounted) return;
      setD({
        artistas: artistas.length,
        puestos: puestos.length,
        fotos: fotos.length,
        alojamientos: alojamientos.length,
        pubs: pubs.filter((p) => p.activo).length,
        mensajesNuevos: mensajes.filter((m) => !m.estado || m.estado === "nuevo").length,
        bonosPendientes: bonos.filter((b) => !b.estado || b.estado === "pendiente").length,
        recaudado: bonos.filter((b) => b.estado === "verificado").reduce((s, b) => s + (b.monto || 0), 0),
      });
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (!evento) return <p className="text-muted-foreground">Seleccioná un evento.</p>;

  const tiles = d && [
    { id: "artistas", label: "Artistas / actividades", value: d.artistas, icon: Music, tone: "bg-emerald-50 text-emerald-700" },
    { id: "puestos", label: "Puestos gastronómicos", value: d.puestos, icon: UtensilsCrossed, tone: "bg-amber-50 text-amber-700" },
    { id: "alojamientos", label: "Alojamientos", value: d.alojamientos, icon: BedDouble, tone: "bg-teal-50 text-teal-700" },
    { id: "galeria", label: "Fotos en la galería", value: d.fotos, icon: Images, tone: "bg-sky-50 text-sky-700" },
    { id: "publicidades", label: "Publicidades activas", value: d.pubs, icon: Megaphone, tone: "bg-violet-50 text-violet-700" },
    { id: "mensajes", label: "Mensajes nuevos", value: d.mensajesNuevos, icon: Mail, tone: "bg-rose-50 text-rose-700", alert: d.mensajesNuevos > 0 },
    { id: "bonos", label: "Bonos pendientes", value: d.bonosPendientes, icon: Heart, tone: "bg-red-50 text-red-700", alert: d.bonosPendientes > 0 },
  ];

  return (
    <div>
      <PageHeader title="Resumen" description="Un vistazo al estado del evento seleccionado." />

      {/* Tarjeta del evento */}
      <div className="relative isolate mb-6 overflow-hidden rounded-3xl bg-[#0c1f14] p-6 text-white shadow-lg md:p-8">
        {evento.hero_image && <img src={evento.hero_image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c1f14] via-[#0c1f14]/80 to-transparent" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">{evento.activo ? "Evento activo" : "Evento"}</p>
        <h3 className="mt-2 font-heading text-3xl font-bold tracking-tight">{evento.nombre}</h3>
        {evento.periodo && <p className="mt-1 text-white/70">{evento.periodo}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0c1f14] transition hover:bg-emerald-50">
            <ExternalLink className="h-4 w-4" /> Ver sitio
          </Link>
          <button onClick={() => onNavigate?.("evento")} className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold transition hover:bg-white/10">
            <Settings className="h-4 w-4" /> Configuración
          </button>
        </div>
      </div>

      {!d ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {tiles.map((t) => (
              <button
                key={t.id}
                onClick={() => onNavigate?.(t.id)}
                className="group relative rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.tone}`}><t.icon className="h-5 w-5" /></span>
                <p className="mt-4 font-heading text-3xl font-bold tracking-tight">{t.value}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t.label}</p>
                {t.alert && <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-destructive ring-4 ring-destructive/15" />}
                <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>

          <Panel title="Bonos verificados" description="Total recaudado con bonos de colaboración confirmados." className="mt-6">
            <p className="font-heading text-4xl font-bold tracking-tight text-primary">{fmt(d.recaudado)}</p>
          </Panel>
        </>
      )}
    </div>
  );
}
