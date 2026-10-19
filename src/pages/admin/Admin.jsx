import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEvento } from "@/lib/eventoContext";
import EventoSettings from "@/components/admin/EventoSettings";
import CrudManager from "@/components/admin/CrudManager";
import ProductosManager from "@/components/admin/ProductosManager";
import MensajesManager from "@/components/admin/MensajesManager";
import BonosManager from "@/components/admin/BonosManager";
import QrManager from "@/components/admin/QrManager";
import { base44 } from "@/api/base44Client";
import {
  Settings, Music, UtensilsCrossed, Package, Megaphone, Images,
  Mail, Heart, LogOut, Menu, X, ChevronDown, ExternalLink, LayoutDashboard, QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { id: "evento", label: "Configuración", icon: Settings, component: EventoSettings },
  { id: "artistas", label: "Artistas", icon: Music, component: () => (
    <CrudManager entityName="Artista" title="Artistas" description="Grilla de eventos: artistas, horarios y escenarios."
      fields={[
        { key: "nombre", label: "Nombre", type: "text", required: true },
        { key: "genero", label: "Género", type: "text" },
        { key: "descripcion", label: "Descripción", type: "textarea" },
        { key: "fecha", label: "Fecha", type: "date", sort: true },
        { key: "hora_inicio", label: "Hora inicio", type: "time" },
        { key: "hora_fin", label: "Hora fin", type: "time" },
        { key: "escenario", label: "Escenario", type: "text" },
        { key: "orden", label: "Orden", type: "number" },
        { key: "imagen_url", label: "Imagen", type: "image" },
      ]}
      listColumns={[
        { key: "imagen_url", label: "", type: "image" },
        { key: "nombre", label: "Artista" },
        { key: "genero", label: "Género" },
        { key: "fecha", label: "Fecha", render: (r) => r.fecha ? new Date(r.fecha).toLocaleDateString("es-AR") : "—" },
        { key: "hora_inicio", label: "Hora" },
      ]}
    />
  )},
  { id: "puestos", label: "Puestos gastronómicos", icon: UtensilsCrossed, component: () => (
    <CrudManager entityName="PuestoGastronomico" title="Puestos gastronómicos" description="Puestos de comida con su numeración."
      fields={[
        { key: "numero", label: "Número", type: "number", sort: true },
        { key: "nombre", label: "Nombre", type: "text", required: true },
        { key: "responsable", label: "Responsable", type: "text" },
        { key: "descripcion", label: "Descripción", type: "textarea" },
        { key: "whatsapp", label: "WhatsApp", type: "text" },
        { key: "imagen_url", label: "Imagen", type: "image" },
      ]}
      listColumns={[
        { key: "imagen_url", label: "", type: "image" },
        { key: "numero", label: "N°" },
        { key: "nombre", label: "Nombre" },
        { key: "responsable", label: "Responsable" },
      ]}
    />
  )},
  { id: "productos", label: "Productos", icon: Package, component: ProductosManager },
  { id: "publicidades", label: "Publicidades", icon: Megaphone, component: () => (
    <CrudManager entityName="Publicidad" title="Publicidades" description="Anuncios de comercios que rotan en el sitio."
      fields={[
        { key: "comercio_nombre", label: "Nombre del comercio", type: "text", required: true },
        { key: "descripcion", label: "Descripción", type: "text" },
        { key: "link_url", label: "Link", type: "text" },
        { key: "imagen_url", label: "Logo/Imagen", type: "image" },
        { key: "orden", label: "Orden", type: "number", sort: true },
        { key: "activo", label: "Activo", type: "boolean", default: true },
      ]}
      listColumns={[
        { key: "imagen_url", label: "", type: "image" },
        { key: "comercio_nombre", label: "Comercio" },
        { key: "descripcion", label: "Descripción" },
        { key: "activo", label: "Activo", type: "boolean" },
      ]}
    />
  )},
  { id: "galeria", label: "Galería", icon: Images, component: () => (
    <CrudManager entityName="GaleriaFoto" title="Galería de fotos" description="Fotos que se muestran en el inicio."
      fields={[
        { key: "titulo", label: "Título", type: "text" },
        { key: "descripcion", label: "Descripción", type: "text" },
        { key: "imagen_url", label: "Imagen", type: "image", required: true },
        { key: "orden", label: "Orden", type: "number", sort: true },
      ]}
      listColumns={[
        { key: "imagen_url", label: "", type: "image" },
        { key: "titulo", label: "Título" },
      ]}
    />
  )},
  { id: "mensajes", label: "Mensajes", icon: Mail, component: MensajesManager },
  { id: "bonos", label: "Bonos", icon: Heart, component: BonosManager },
  { id: "qr", label: "Códigos QR", icon: QrCode, component: QrManager },
];

export default function Admin() {
  const { eventos, evento, seleccionarEvento, loading } = useEvento();
  const [seccion, setSeccion] = useState("evento");
  const [sidebar, setSidebar] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    await base44.auth.logout();
    navigate("/");
  };

  const ActiveComponent = SECCIONES.find((s) => s.id === seccion)?.component || EventoSettings;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={cn(
        "md:w-64 md:min-h-screen md:sticky md:top-0 border-r border-border bg-card flex flex-col z-40",
        "fixed inset-y-0 left-0 w-64 transition-transform md:static",
        sidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-heading font-bold">Panel Admin</span>
          </Link>
          <button onClick={() => setSidebar(false)} className="md:hidden p-1"><X className="h-5 w-5" /></button>
        </div>

        {/* Event selector */}
        <div className="p-3 border-b border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">Evento</p>
          <div className="relative">
            <button
              onClick={() => setSwitcher((s) => !s)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-border rounded-md hover:bg-secondary text-left"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: evento?.color_acento || "#D4A017" }} />
                <span className="truncate font-medium text-sm">{evento?.nombre || "Seleccionar"}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
            {switcher && (
              <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 max-h-60 overflow-auto">
                {eventos.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { seleccionarEvento(e.id); setSwitcher(false); }}
                    className={cn("w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-secondary", e.id === evento?.id && "bg-secondary font-medium")}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color_acento || "#D4A017" }} />
                    {e.nombre}
                    {e.activo && <span className="ml-auto text-[10px] uppercase text-accent">Activo</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSeccion(s.id); setSidebar(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                seccion === s.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ExternalLink className="h-4 w-4" /> Ver sitio público
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebar && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebar(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-20">
          <button onClick={() => setSidebar(true)} className="p-1.5"><Menu className="h-5 w-5" /></button>
          <span className="font-heading font-semibold text-sm">Panel Admin — {evento?.nombre}</span>
          <span className="w-7" />
        </div>
        <div className="p-5 md:p-8 max-w-5xl">
          {loading ? (
            <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto" /></div>
          ) : (
            <ActiveComponent />
          )}
        </div>
      </div>
    </div>
  );
}