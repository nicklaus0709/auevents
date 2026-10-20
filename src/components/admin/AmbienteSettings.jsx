import React, { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { AMBIENTE_CAMPOS, ambienteActivo, LOGO_AMBIENTE } from "@/lib/ambiente";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import PageHeader, { Panel, Spinner } from "@/components/admin/PageHeader";

const KEYS = ["ambiente_logo", ...AMBIENTE_CAMPOS.map((c) => c.key)];

/** Logo, visibilidad y textos de la sección "Capioví apoyando al medio ambiente". */
export default function AmbienteSettings() {
  const { evento, recargar } = useEvento();
  const [form, setForm] = useState(null);
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    if (!evento) return;
    setForm(Object.fromEntries(KEYS.map((k) => [k, evento[k] ?? ""])));
    setActivo(ambienteActivo(evento));
  }, [evento?.id]);

  const subirLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm((f) => ({ ...f, ambiente_logo: file_url }));
      toast({ title: "Logo cargado", description: "Guardá los cambios para publicarlo." });
    } catch (err) {
      toast({ title: "Error al subir la imagen", variant: "destructive" });
    } finally {
      setSubiendo(false);
    }
  };

  const guardar = async () => {
    setSaving(true);
    try {
      await base44.entities.Evento.update(evento.id, { ...form, ambiente_activo: activo });
      await recargar();
      toast({ title: "Medio ambiente actualizado" });
    } catch (err) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!evento) return <p className="text-muted-foreground">Seleccioná un evento.</p>;
  if (!form) return <Spinner />;

  return (
    <div>
      <PageHeader title="Medio ambiente" description="Logo flotante del inicio y textos de la página “Capioví apoyando al medio ambiente”. Los pasos, las fotos y los videos se cargan en las secciones siguientes del menú.">
        <Button onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
      </PageHeader>

      <div className="space-y-5">
        <Panel title="Visibilidad y logo">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-semibold">Mostrar la sección en este evento</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Muestra u oculta el logo flotante del inicio y la página de medio ambiente.</p>
              </div>
              <Switch checked={activo} onCheckedChange={setActivo} aria-label="Mostrar la sección de medio ambiente" className="mt-0.5" />
            </div>

            <div className="space-y-2">
              <Label>Logo de reciclaje</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white p-2 shadow ring-2 ring-emerald-500">
                  <img src={form.ambiente_logo || LOGO_AMBIENTE} alt="" className="h-full w-full rounded-full object-contain" />
                </div>
                <div className="space-y-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold transition hover:bg-accent">
                    <Upload className="h-3.5 w-3.5" /> {subiendo ? "Subiendo…" : "Subir logo"}
                    <input type="file" accept="image/*" className="hidden" disabled={subiendo} onChange={subirLogo} />
                  </label>
                  {form.ambiente_logo && (
                    <button type="button" onClick={() => setForm({ ...form, ambiente_logo: "" })} className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" /> Volver al logo de Capioví
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">Se muestra redondo y flotando en el inicio. Si no subís uno, se usa el logo de Capioví (flechas de reciclaje alrededor del planeta).</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Textos de la página" description="Si dejás un campo vacío se usa el texto por defecto.">
          <div className="space-y-4">
            {AMBIENTE_CAMPOS.map((c) => (
              <div key={c.key} className="space-y-1.5">
                <Label htmlFor={c.key}>{c.label}</Label>
                {c.multiline ? (
                  <Textarea id={c.key} rows={c.key === "ambiente_intro" ? 6 : 3} value={form[c.key]} placeholder={c.def} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} />
                ) : (
                  <Input id={c.key} value={form[c.key]} placeholder={c.def} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Button onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </div>
  );
}
