import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { toast } from "@/components/ui/use-toast";
import { Mail, Phone, Trash2, Inbox } from "lucide-react";
import PageHeader, { Spinner, EmptyState } from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const ESTADOS = [
  { value: "nuevo", label: "Nuevo", color: "bg-blue-100 text-blue-700" },
  { value: "leido", label: "Leído", color: "bg-amber-100 text-amber-700" },
  { value: "respondido", label: "Respondido", color: "bg-green-100 text-green-700" },
];

const TIPOS = { artista: "Artista", puesto: "Puesto gastronómico", otro: "Otro" };

export default function MensajesManager() {
  const { evento } = useEvento();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aEliminar, setAEliminar] = useState(null);

  const load = async () => {
    if (!evento) return;
    setLoading(true);
    try {
      const { items } = await base44.entities.MensajeContacto.filter({ evento_id: evento.id }, { sort: "-created_date", limit: 200 });
      setMensajes(items || []);
    } catch (e) {
      toast({ title: "Error al cargar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [evento?.id]);

  const cambiarEstado = async (m, estado) => {
    try {
      await base44.entities.MensajeContacto.update(m.id, { estado });
      setMensajes((ms) => ms.map((x) => (x.id === m.id ? { ...x, estado } : x)));
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const eliminar = async () => {
    const m = aEliminar;
    setAEliminar(null);
    if (!m) return;
    try {
      await base44.entities.MensajeContacto.delete(m.id);
      setMensajes((ms) => ms.filter((x) => x.id !== m.id));
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (!evento) return <p className="text-muted-foreground">Seleccioná un evento.</p>;

  return (
    <div>
      <PageHeader title="Mensajes de contacto" description="Solicitudes de artistas y puestos gastronómicos." count={loading ? undefined : mensajes.length} />

      {loading ? (
        <Spinner />
      ) : mensajes.length === 0 ? (
        <EmptyState icon={Inbox}>No hay mensajes todavía.</EmptyState>
      ) : (
        <div className="space-y-3">
          {mensajes.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-semibold">{m.nombre}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{TIPOS[m.tipo] || m.tipo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${(ESTADOS.find((e) => e.value === m.estado) || ESTADOS[0]).color}`}>{(ESTADOS.find((e) => e.value === m.estado) || ESTADOS[0]).label}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-muted-foreground">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-foreground"><Mail className="h-3.5 w-3.5" /> {m.email}</a>
                    {m.telefono && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {m.telefono}</span>}
                    <span>{new Date(m.created_date).toLocaleString("es-AR")}</span>
                  </div>
                  <p className="text-sm mt-3 text-foreground/80 whitespace-pre-line">{m.mensaje}</p>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <select
                    value={m.estado}
                    onChange={(e) => cambiarEstado(m, e.target.value)}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                  >
                    {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                  <button onClick={() => setAEliminar(m)} aria-label={`Eliminar mensaje de ${m.nombre}`} className="mt-1 rounded-lg p-2 text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!aEliminar}
        onOpenChange={(o) => { if (!o) setAEliminar(null); }}
        title="¿Eliminar este mensaje?"
        description={aEliminar ? `Se elimina el mensaje de ${aEliminar.nombre}. Esta acción no se puede deshacer.` : undefined}
        onConfirm={eliminar}
      />
    </div>
  );
}