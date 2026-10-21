import React, { useState } from "react";
import { useEvento } from "@/lib/eventoContext";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Plus, Check, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import PageHeader, { Panel, Spinner } from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function EventoSettings() {
  const { eventos, evento, seleccionarEvento, loading, recargar } = useEvento();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", slug: "" });
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  React.useEffect(() => {
    if (evento) setForm({ ...evento });
  }, [evento?.id]);

  const handleUpload = async (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm((f) => ({ ...f, [key]: file_url }));
      toast({ title: "Imagen cargada" });
    } catch (err) {
      toast({ title: "Error al subir", variant: "destructive" });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Evento.update(form.id, form);
      await recargar();
      toast({ title: "Evento actualizado" });
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const setActivo = async (ev) => {
    try {
      // desactivar todos, activar el elegido
      for (const e of eventos) {
        if (e.activo && e.id !== ev.id) await base44.entities.Evento.update(e.id, { activo: false });
      }
      await base44.entities.Evento.update(ev.id, { activo: true });
      await recargar();
      toast({ title: `${ev.nombre} es ahora el evento activo` });
      seleccionarEvento(ev.id);
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const crearEvento = async () => {
    if (!nuevo.nombre) return;
    setCreating(true);
    try {
      const rec = await base44.entities.Evento.create({
        nombre: nuevo.nombre,
        slug: nuevo.slug || nuevo.nombre.toLowerCase().replace(/\s+/g, "-"),
        activo: eventos.length === 0,
        color_acento: "#D4A017",
        instagram_url: "", facebook_url: "", whatsapp_url: "", mp_link: "",
      });
      await recargar();
      seleccionarEvento(rec.id);
      setNuevo({ nombre: "", slug: "" });
      toast({ title: "Evento creado" });
    } catch (err) {
      toast({ title: "Error al crear", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };


  const eliminarEvento = async () => {
    setConfirmarBorrado(false);
    try {
      await base44.entities.Evento.delete(evento.id);
      const items = await recargar();
      if (items[0]) seleccionarEvento((items.find((e) => e.activo) || items[0]).id);
      toast({ title: "Evento eliminado" });
    } catch (err) {
      toast({ title: "No se pudo eliminar", variant: "destructive" });
    }
  };

  if (loading || !form) return <Spinner />;

  const Toggle = ({ k, label, hint }) => {
    const on = form[k] !== false;
    return (
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        <Switch checked={on} onCheckedChange={(v) => setForm({ ...form, [k]: v })} aria-label={label} className="mt-0.5" />
      </div>
    );
  };

  const ImageField = ({ k, label, hint }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {form[k] ? (
        <div className="relative inline-block">
          <img src={form[k]} alt="" className="h-28 w-full max-w-xs rounded-xl border border-border bg-secondary object-cover" />
          <button type="button" onClick={() => setForm({ ...form, [k]: "" })} aria-label="Quitar imagen" className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"><X className="h-3 w-3" /></button>
        </div>
      ) : (
        <div className="flex h-28 max-w-xs items-center justify-center rounded-xl border border-dashed border-border bg-secondary/50 text-xs text-muted-foreground">Sin imagen</div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold transition hover:bg-accent">
        <Upload className="h-3.5 w-3.5" /> Subir imagen
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, k)} />
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  const ColorField = ({ k, label, fallback }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={form[k] || fallback} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-background p-1" />
        <Input value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={fallback} />
      </div>
    </div>
  );

  const text = (k, label, props = {}) => (
    <div className="space-y-1.5"><Label>{label}</Label><Input value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...props} /></div>
  );

  return (
    <div>
      <PageHeader title="Configuración del evento" description={`Datos generales de ${evento.nombre}. Se muestran en el sitio público.`}>
        <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
      </PageHeader>

      <div className="space-y-5">
        {/* Eventos */}
        <Panel title="Eventos" description="El evento activo es el que se muestra por defecto en el sitio.">
          <div className="mb-4 flex flex-wrap gap-2">
            {eventos.map((e) => (
              <div key={e.id} className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm ${e.id === evento.id ? "border-primary bg-primary/5 font-semibold" : "border-border bg-background"}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color_primario || e.color_acento || "#16a34a" }} />
                {e.nombre}
                {e.activo
                  ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Activo</span>
                  : <button onClick={() => setActivo(e)} className="text-xs text-muted-foreground underline hover:text-foreground">activar</button>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <div className="space-y-1">
              <Label className="text-xs">Nuevo evento</Label>
              <Input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Ej: Fiesta Rural" className="h-9 w-64" />
            </div>
            <Button onClick={crearEvento} disabled={creating || !nuevo.nombre} variant="outline" size="sm"><Plus className="h-4 w-4" /> Crear evento</Button>
          </div>
        </Panel>

        <Panel title="Datos generales">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("nombre", "Nombre *")}
              {text("slug", "Identificador (slug)")}
            </div>
            <div className="space-y-1.5"><Label>Descripción corta</Label><Textarea value={form.descripcion || ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              {text("lema", "Lema", { placeholder: "Ej: AMOR A SU PUEBLO" })}
              {text("periodo", "Cuándo (texto libre)", { placeholder: "Ej: Del 29/11 a fines de enero" })}
              {text("lugar", "Dónde", { placeholder: "Ej: Plaza central" })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Nosotros</Label><Textarea value={form.nosotros || ""} onChange={(e) => setForm({ ...form, nosotros: e.target.value })} rows={5} /></div>
              <div className="space-y-1.5"><Label>Historia</Label><Textarea value={form.historia || ""} onChange={(e) => setForm({ ...form, historia: e.target.value })} rows={5} /></div>
            </div>
          </div>
        </Panel>

        <Panel title="Identidad visual" description="Colores e imágenes del evento.">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField k="color_primario" label="Color primario" fallback="#c1121f" />
              <ColorField k="color_acento" label="Color secundario" fallback="#15803d" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageField k="hero_image" label="Imagen principal (hero)" hint="Se muestra en la portada y en la pantalla de selección." />
              <ImageField k="logo_url" label="Logo del evento" hint="Se muestra en el encabezado del sitio." />
            </div>
          </div>
        </Panel>

        <Panel title="Contacto y secciones" description="Datos de contacto del pie de página y qué secciones se muestran.">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("telefono", "Teléfono", { placeholder: "Ej: 03743 49-0000" })}
              {text("email", "Email", { placeholder: "turismo@capiovi.gob.ar" })}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle k="mostrar_bonos" label="Bonos de colaboración" hint="Muestra u oculta la página de bonos, sus botones y el bloque en la portada." />
              <Toggle k="mostrar_chat" label="Asistente de chat" hint="Muestra u oculta el botón del chat flotante." />
            </div>
          </div>
        </Panel>

        <Panel title="Redes y pagos">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {text("instagram_url", "Instagram URL")}
              {text("facebook_url", "Facebook URL")}
              {text("whatsapp_url", "WhatsApp URL")}
            </div>
            {text("mp_link", "Link de Mercado Pago (bonos)", { placeholder: "https://mp..." })}
          </div>
        </Panel>

        <Panel title="Zona de peligro" className="border-destructive/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm text-muted-foreground">Eliminar este evento lo saca del sitio. El contenido asociado (artistas, puestos, fotos…) deja de mostrarse.</p>
            <Button variant="destructive" onClick={() => setConfirmarBorrado(true)}><Trash2 className="h-4 w-4" /> Eliminar evento</Button>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
          <button type="button" onClick={() => setActivo(evento)} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-secondary">
            <Check className="h-4 w-4" /> Marcar como evento activo
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmarBorrado}
        onOpenChange={setConfirmarBorrado}
        title={`¿Eliminar el evento “${evento?.nombre}”?`}
        description="Sus artistas, puestos, fotos y demás contenido quedan sin evento y dejan de verse. Esta acción no se puede deshacer."
        confirmLabel="Eliminar evento"
        onConfirm={eliminarEvento}
      />
    </div>
  );
}
