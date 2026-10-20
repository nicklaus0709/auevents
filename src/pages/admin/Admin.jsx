import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEvento } from "@/lib/eventoContext";
import EventoSettings from "@/components/admin/EventoSettings";
import CrudManager from "@/components/admin/CrudManager";
import ProductosManager from "@/components/admin/ProductosManager";
import MensajesManager from "@/components/admin/MensajesManager";
import BonosManager from "@/components/admin/BonosManager";
import QrManager from "@/components/admin/QrManager";
import Resumen from "@/components/admin/Resumen";
import TextosSitio from "@/components/admin/TextosSitio";
import UsuariosManager from "@/components/admin/UsuariosManager";
import AmbienteSettings from "@/components/admin/AmbienteSettings";
import { useAuth } from "@/lib/AuthContext";
import { TIPOS_ALOJAMIENTO } from "@/lib/alojamientos";
import { base44 } from "@/api/base44Client";
import {
  Settings, Music, UtensilsCrossed, Package, Megaphone, Images,
  Mail, Heart, LogOut, Menu, X, ChevronsUpDown, ExternalLink, LayoutDashboard, QrCode, Check, Type, BedDouble, Users, ShieldAlert, Leaf, ListOrdered, Video
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { id: "resumen", grupo: "General", label: "Resumen", icon: LayoutDashboard, component: Resumen },
  { id: "evento", grupo: "General", label: "Configuración", icon: Settings, component: EventoSettings },
  { id: "textos", grupo: "General", label: "Textos del sitio", icon: Type, component: TextosSitio },
  { id: "artistas", grupo: "Contenido", label: "Artistas", icon: Music, component: () => (
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
  { id: "puestos", grupo: "Contenido", label: "Puestos gastronómicos", icon: UtensilsCrossed, component: () => (
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
  { id: "alojamientos", grupo: "Contenido", label: "Alojamientos", icon: BedDouble, component: () => (
    <CrudManager entityName="Alojamiento" title="Alojamientos" description="Hoteles, hosterías, cabañas y otros lugares donde hospedarse."
      emptyMessage="Aún no hay alojamientos cargados."
      fields={[
        { key: "nombre", label: "Nombre del lugar", type: "text", required: true },
        { key: "tipo", label: "Tipo", type: "select", options: TIPOS_ALOJAMIENTO },
        { key: "direccion", label: "Dirección", type: "text" },
        { key: "maps_url", label: "Link de Google Maps", type: "text" },
        { key: "telefono", label: "Teléfono", type: "text" },
        { key: "imagen_url", label: "Imagen", type: "image" },
        { key: "orden", label: "Orden", type: "number", sort: true },
      ]}
      listColumns={[
        { key: "imagen_url", label: "", type: "image" },
        { key: "nombre", label: "Nombre" },
        { key: "tipo", label: "Tipo" },
        { key: "direccion", label: "Dirección" },
      ]}
    />
  )},
  { id: "productos", grupo: "Contenido", label: "Productos", icon: Package, component: ProductosManager },
  { id: "publicidades", grupo: "Contenido", label: "Publicidades", icon: Megaphone, component: () => (
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
  { id: "galeria", grupo: "Contenido", label: "Galería", icon: Images, component: () => (
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
  { id: "ambiente", grupo: "Medio ambiente", label: "Ajustes y textos", icon: Leaf, component: AmbienteSettings },
  { id: "amb-pasos", grupo: "Medio ambiente", label: "Proceso de reciclaje", icon: ListOrdered, component: () => (
    <CrudManager entityName="PasoReciclaje" title="Proceso de reciclaje" description="Los pasos que explican cómo se recicla el plástico y se transforma en adornos. Se muestran en el orden indicado."
      emptyMessage="Aún no hay pasos cargados."
      fields={[
        { key: "titulo", label: "Título del paso", type: "text", required: true },
        { key: "descripcion", label: "Descripción", type: "textarea" },
        { key: "imagen_url", label: "Imagen", type: "image" },
        { key: "orden", label: "Orden", type: "number", sort: true },
      ]}
      listColumns={[
        { key: "imagen_url", label: "", type: "image" },
        { key: "orden", label: "N°" },
        { key: "titulo", label: "Paso" },
      ]}
    />
  )},
  { id: "amb-galeria", grupo: "Medio ambiente", label: "Galería ambiental", icon: Images, component: () => (
    <CrudManager entityName="AmbienteFoto" title="Galería ambiental" description="Fotos del arte hecho con plástico reciclado."
      emptyMessage="Aún no hay fotos cargadas."
      fields={[
        { key: "titulo", label: "Título", type: "text", required: true },
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
  { id: "amb-videos", grupo: "Medio ambiente", label: "Videos del proceso", icon: Video, component: () => (
    <CrudManager entityName="AmbienteVideo" title="Videos del proceso" description="Videos que muestran cómo se recicla y se arma cada adorno. Podés subir un archivo o pegar un enlace de YouTube, Vimeo o Facebook."
      emptyMessage="Aún no hay videos cargados."
      fields={[
        { key: "titulo", label: "Título", type: "text", required: true },
        { key: "descripcion", label: "Descripción", type: "textarea" },
        { key: "video_url", label: "Video", type: "video", required: true },
        { key: "orden", label: "Orden", type: "number", sort: true },
      ]}
      listColumns={[
        { key: "titulo", label: "Título" },
        { key: "video_url", label: "Video", render: (r) => <span className="line-clamp-1 text-muted-foreground">{r.video_url}</span> },
      ]}
    />
  )},
  { id: "mensajes", grupo: "Gestión", label: "Mensajes", icon: Mail, component: MensajesManager },
  { id: "bonos", grupo: "Gestión", label: "Bonos", icon: Heart, component: BonosManager },
  { id: "usuarios", grupo: "Gestión", label: "Usuarios", icon: Users, component: UsuariosManager },
  { id: "qr", grupo: "Gestión", label: "Códigos QR", icon: QrCode, component: QrManager },
];

export default function Admin() {
  const { eventos, evento, seleccionarEvento, loading } = useEvento();
  const { user } = useAuth();
  const [seccion, setSeccion] = useState("resumen");
  const [sidebar, setSidebar] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const navigate = useNavigate();

  // El tema del panel vive en el <body> para que los diálogos (que se montan fuera del árbol) lo hereden
  useEffect(() => {
    document.body.classList.add("admin-site");
    return () => document.body.classList.remove("admin-site");
  }, []);

  const logout = async () => {
    await base44.auth.logout();
    navigate("/");
  };

  // Solo los administradores entran al panel (los datos ya están protegidos por rol; esto evita mostrar una pantalla vacía)
  if (user && user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="font-heading text-2xl font-bold">No tenés permisos para entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta ({user.email}) no es de administrador. Pedile a quien administra el sitio que te dé acceso con ese email.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Ir al sitio</Link>
            <button onClick={logout} className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary">Cerrar sesión</button>
          </div>
        </div>
      </div>
    );
  }

  const actual = SECCIONES.find((s) => s.id === seccion) || SECCIONES[0];
  const ActiveComponent = actual.component;
  const grupos = [...new Set(SECCIONES.map((s) => s.grupo))];
  const ir = (id) => { setSeccion(id); setSidebar(false); };
  const inicial = (user?.full_name || user?.email || "A").trim()[0]?.toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      {/* Barra lateral */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#0c1f14] text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
        sidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Link to="/" className="flex items-center gap-3">
            <img src="/navidad/escudo.png" alt="" className="h-10 w-auto drop-shadow" />
            <span className="leading-tight">
              <span className="block font-heading text-base font-bold tracking-tight">Panel de control</span>
              <span className="block text-xs text-white/50">Eventos Capioví</span>
            </span>
          </Link>
          <button onClick={() => setSidebar(false)} className="rounded-lg p-1.5 hover:bg-white/10 md:hidden" aria-label="Cerrar menú"><X className="h-5 w-5" /></button>
        </div>

        {/* Selector de evento */}
        <div className="px-4 pb-3">
          <div className="relative">
            <button
              onClick={() => setSwitcher((s) => !s)}
              className="flex w-full items-center justify-between gap-2 rounded-xl bg-white/[0.07] px-3 py-2.5 text-left ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: evento?.color_primario || "#4ade80" }} />
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/50">Evento</span>
                  <span className="block truncate text-sm font-semibold">{evento?.nombre || "Seleccionar"}</span>
                </span>
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/50" />
            </button>
            {switcher && (
              <div className="absolute inset-x-0 z-50 mt-2 max-h-64 overflow-auto rounded-xl bg-white py-1 text-foreground shadow-2xl ring-1 ring-black/10">
                {eventos.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { seleccionarEvento(e.id); setSwitcher(false); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-secondary"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: e.color_primario || "#4ade80" }} />
                    <span className="min-w-0 flex-1 truncate">{e.nombre}</span>
                    {e.id === evento?.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-4 pb-4 pt-2">
          {grupos.map((g) => (
            <div key={g}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{g}</p>
              <div className="space-y-0.5">
                {SECCIONES.filter((s) => s.grupo === g).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => ir(s.id)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                      seccion === s.id ? "bg-white/[0.12] text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    {seccion === s.id && <span className="absolute -left-4 bottom-2 top-2 w-1 rounded-r-full bg-emerald-400" />}
                    <s.icon className={cn("h-[18px] w-[18px] shrink-0", seccion === s.id && "text-emerald-300")} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">{inicial}</span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold">{user?.full_name || "Administrador"}</span>
              <span className="block truncate text-xs text-white/50">{user?.email}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/" className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.07] px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.12]">
              <ExternalLink className="h-3.5 w-3.5" /> Ver sitio
            </Link>
            <button onClick={logout} className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.07] px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.12]">
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>
      </aside>

      {sidebar && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebar(false)} />}

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:hidden">
          <button onClick={() => setSidebar(true)} className="rounded-lg p-2 hover:bg-secondary" aria-label="Abrir menú"><Menu className="h-5 w-5" /></button>
          <span className="truncate font-heading text-sm font-semibold">{actual.label} · {evento?.nombre}</span>
        </div>
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">
          {loading ? (
            <div className="py-24 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-primary" /></div>
          ) : (
            <ActiveComponent onNavigate={ir} />
          )}
        </div>
      </div>
    </div>
  );
}
