import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, X, Inbox } from "lucide-react";
import PageHeader, { Spinner, EmptyState } from "@/components/admin/PageHeader";
import { toast } from "@/components/ui/use-toast";

export default function CrudManager({
  entityName,
  title,
  description,
  fields,
  listColumns,
  filterByEvento = true,
  extraCreateFields = {},
  emptyMessage = "Aún no hay registros.",
}) {
  const { evento } = useEvento();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const blank = () => {
    const b = {};
    fields.forEach((f) => { b[f.key] = f.type === "boolean" ? false : f.default ?? ""; });
    return b;
  };

  const load = async () => {
    if (filterByEvento && !evento) return;
    setLoading(true);
    try {
      const query = filterByEvento ? { evento_id: evento.id } : {};
      const { items } = await base44.entities[entityName].filter(query, { sort: fields.find((f) => f.sort)?.key ? fields.find((f) => f.sort).key : "-created_date", limit: 200 });
      setRecords(items || []);
    } catch (e) {
      toast({ title: "Error al cargar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [evento?.id]);

  const openNew = () => { setEditing(null); setForm(blank()); setOpen(true); };
  const openEdit = (rec) => { setEditing(rec); setForm({ ...blank(), ...rec }); setOpen(true); };

  const handleUpload = async (e, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm((f) => ({ ...f, [fieldKey]: file_url }));
      toast({ title: "Imagen cargada" });
    } catch (err) {
      toast({ title: "Error al subir imagen", variant: "destructive" });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if (f.type === "number" && payload[f.key] !== "" && payload[f.key] != null) payload[f.key] = Number(payload[f.key]);
      });
      if (editing) {
        await base44.entities[entityName].update(editing.id, payload);
        toast({ title: "Actualizado" });
      } else {
        await base44.entities[entityName].create({ ...payload, ...(filterByEvento ? { evento_id: evento.id } : {}), ...extraCreateFields });
        toast({ title: "Creado" });
      }
      setOpen(false);
      load();
    } catch (err) {
      toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (rec) => {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await base44.entities[entityName].delete(rec.id);
      toast({ title: "Eliminado" });
      load();
    } catch (err) {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const renderField = (f) => {
    const value = form[f.key];
    const set = (v) => setForm((s) => ({ ...s, [f.key]: v }));
    if (f.type === "textarea") return <Textarea id={f.key} value={value} onChange={(e) => set(e.target.value)} rows={4} />;
    if (f.type === "boolean") return (
      <Switch id={f.key} checked={!!value} onCheckedChange={set} />
    );
    if (f.type === "select") return (
      <select id={f.key} value={value} onChange={(e) => set(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        {(f.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
    if (f.type === "image") return (
      <div className="space-y-2">
        {value && (
          <div className="relative inline-block">
            <img src={value} alt="" className="h-24 w-24 object-cover rounded-md border border-border" />
            <button type="button" onClick={() => set("")} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-3 w-3" /></button>
          </div>
        )}
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm cursor-pointer hover:bg-secondary transition-colors">
          <Upload className="h-4 w-4" /> Subir imagen
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, f.key)} />
        </label>
      </div>
    );
    return <Input id={f.key} type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "time" ? "time" : "text"} value={value} onChange={(e) => set(e.target.value)} />;
  };

  if (filterByEvento && !evento) {
    return <p className="text-muted-foreground">Seleccioná un evento para administrar.</p>;
  }

  return (
    <div>
      <PageHeader title={title} description={description} count={loading ? undefined : records.length}>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Nuevo</Button>
      </PageHeader>

      {loading ? (
        <Spinner />
      ) : records.length === 0 ? (
        <EmptyState icon={Inbox}>{emptyMessage}</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/60">
                <tr>
                  {listColumns.map((c) => <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</th>)}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((rec) => (
                  <tr key={rec.id} className="transition-colors hover:bg-accent/40">
                    {listColumns.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-middle">
                        {c.render ? c.render(rec) : c.type === "image" && rec[c.key] ? (
                          <img src={rec[c.key]} alt="" className="h-11 w-11 rounded-lg object-cover ring-1 ring-border" />
                        ) : c.type === "boolean" ? (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${rec[c.key] ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                            {rec[c.key] ? "Sí" : "No"}
                          </span>
                        ) : (
                          <span className="line-clamp-1">{String(rec[c.key] ?? "")}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(rec)} aria-label="Editar" className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(rec)} aria-label="Eliminar" className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Nuevo"} — {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}{f.required && " *"}</Label>
                {renderField(f)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}