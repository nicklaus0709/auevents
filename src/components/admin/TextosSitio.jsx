import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { TEXTOS } from "@/lib/textos";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import PageHeader, { Panel } from "@/components/admin/PageHeader";

const KEYS = TEXTOS.flatMap((g) => g.campos.map((c) => c.key));

/** Edita todos los textos fijos del sitio público (títulos, botones, pie de página, chat…). Vacío = valor por defecto. */
export default function TextosSitio() {
  const { evento, recargar } = useEvento();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!evento) return;
    setForm(Object.fromEntries(KEYS.map((k) => [k, evento[k] ?? ""])));
  }, [evento?.id]);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Evento.update(evento.id, form);
      await recargar();
      toast({ title: "Textos guardados" });
    } catch (err) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const restaurar = (grupo) => {
    setForm((f) => ({ ...f, ...Object.fromEntries(grupo.campos.map((c) => [c.key, ""])) }));
  };

  if (!evento) return <p className="text-muted-foreground">Seleccioná un evento.</p>;

  return (
    <div>
      <PageHeader title="Textos del sitio" description="Títulos, botones y mensajes que se ven en el sitio público. Si dejás un campo vacío se usa el texto por defecto.">
        <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
      </PageHeader>

      <div className="space-y-5">
        {TEXTOS.map((g) => (
          <Panel key={g.grupo} title={g.grupo}>
            <div className="space-y-4">
              {g.campos.map((c) => (
                <div key={c.key} className="space-y-1.5">
                  <Label htmlFor={c.key}>{c.label}</Label>
                  {c.multiline ? (
                    <Textarea id={c.key} rows={c.key === "footer_links" ? 5 : 2} value={form[c.key] ?? ""} placeholder={c.def} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} />
                  ) : (
                    <Input id={c.key} value={form[c.key] ?? ""} placeholder={c.def} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} />
                  )}
                  {c.ayuda && <p className="text-xs text-muted-foreground">{c.ayuda}</p>}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => restaurar(g)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> Volver a los textos por defecto de esta sección
            </button>
          </Panel>
        ))}
        <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </div>
  );
}
