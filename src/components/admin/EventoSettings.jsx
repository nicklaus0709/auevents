import React, { useState } from "react";
import { useEvento } from "@/lib/eventoContext";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X, Plus, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function EventoSettings() {
  const { eventos, evento, seleccionarEvento, loading } = useEvento();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", slug: "" });

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
      seleccionarEvento(rec.id);
      setNuevo({ nombre: "", slug: "" });
      toast({ title: "Evento creado" });
    } catch (err) {
      toast({ title: "Error al crear", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (loading || !form) return <div className="py-12 text-center"><div className="w-7 h-7 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto" /></div>;

  const ImageField = ({ k, label }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {form[k] && (
        <div className="relative inline-block">
          <img src={form[k]} alt="" className="h-24 w-full max-w-xs object-cover rounded-md border border-border" />
          <button type="button" onClick={() => setForm({ ...form, [k]: "" })} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-3 w-3" /></button>
        </div>
      )}
      <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm cursor-pointer hover:bg-secondary">
        <Upload className="h-4 w-4" /> Subir imagen
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, k)} />
      </label>
    </div>
  );

  return (
    <div>
      <h2 className="font-heading font-bold text-2xl mb-1">Configuración del evento</h2>
      <p className="text-muted-foreground text-sm mb-6">Editá los datos generales de <strong>{evento.nombre}</strong>.</p>

      {/* Lista de eventos */}
      <div className="mb-8 p-4 border border-border rounded-lg bg-secondary/30">
        <p className="text-sm font-medium mb-3">Eventos disponibles</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {eventos.map((e) => (
            <div key={e.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm ${e.id === evento.id ? "border-foreground bg-background" : "border-border bg-background"}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color_acento || "#D4A017" }} />
              {e.nombre}
              {e.activo && <span className="text-[10px] uppercase tracking-wider text-accent font-semibold">Activo</span>}
              {!e.activo && <button onClick={() => setActivo(e)} className="text-xs underline text-muted-foreground hover:text-foreground">activar</button>
              }
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-border">
          <div className="space-y-1">
            <Label className="text-xs">Nombre del nuevo evento</Label>
            <Input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Ej: Fiesta Rural" className="h-9" />
          </div>
          <Button onClick={crearEvento} disabled={creating || !nuevo.nombre} variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Crear evento</Button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Nombre *</Label><Input value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Identificador (slug)</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
        </div>
        <div className="space-y-1.5"><Label>Descripción corta</Label><Textarea value={form.descripcion || ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Nosotros</Label><Textarea value={form.nosotros || ""} onChange={(e) => setForm({ ...form, nosotros: e.target.value })} rows={4} /></div>
          <div className="space-y-1.5"><Label>Historia</Label><Textarea value={form.historia || ""} onChange={(e) => setForm({ ...form, historia: e.target.value })} rows={4} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Color de acento</Label><div className="flex items-center gap-2"><input type="color" value={form.color_acento || "#D4A017"} onChange={(e) => setForm({ ...form, color_acento: e.target.value })} className="h-10 w-14 rounded border border-border" /><Input value={form.color_acento || ""} onChange={(e) => setForm({ ...form, color_acento: e.target.value })} /></div></div>
          <div className="space-y-1.5"><Label>Color primario</Label><div className="flex items-center gap-2"><input type="color" value={form.color_primario || "#1A1C19"} onChange={(e) => setForm({ ...form, color_primario: e.target.value })} className="h-10 w-14 rounded border border-border" /><Input value={form.color_primario || ""} onChange={(e) => setForm({ ...form, color_primario: e.target.value })} /></div></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label>Instagram URL</Label><Input value={form.instagram_url || ""} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Facebook URL</Label><Input value={form.facebook_url || ""} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>WhatsApp URL</Label><Input value={form.whatsapp_url || ""} onChange={(e) => setForm({ ...form, whatsapp_url: e.target.value })} /></div>
        </div>
        <div className="space-y-1.5"><Label>Link de Mercado Pago (bonos)</Label><Input value={form.mp_link || ""} onChange={(e) => setForm({ ...form, mp_link: e.target.value })} placeholder="https://mp..." /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <ImageField k="hero_image" label="Imagen principal (hero)" />
          <ImageField k="logo_url" label="Logo del evento" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
          <button type="button" onClick={() => setActivo(evento)} className="text-sm flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-secondary">
            <Check className="h-4 w-4" /> Marcar como evento activo
          </button>
        </div>
      </div>
    </div>
  );
}