import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

const ESTADOS = [
  { value: "pendiente", label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  { value: "pagado", label: "Pagado", color: "bg-blue-100 text-blue-700" },
  { value: "verificado", label: "Verificado", color: "bg-green-100 text-green-700" },
  { value: "anulado", label: "Anulado", color: "bg-red-100 text-red-700" },
];

export default function BonosManager() {
  const { evento } = useEvento();
  const [bonos, setBonos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, monto: 0 });

  const load = async () => {
    if (!evento) return;
    setLoading(true);
    try {
      const { items } = await base44.entities.SolicitudBono.filter({ evento_id: evento.id }, { sort: "-created_date", limit: 200 });
      setBonos(items || []);
      const verificados = (items || []).filter((b) => b.estado === "verificado");
      setStats({ total: verificados.length, monto: verificados.reduce((s, b) => s + (b.monto || 0), 0) });
    } catch (e) {
      toast({ title: "Error al cargar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [evento?.id]);

  const cambiarEstado = async (b, estado) => {
    try {
      await base44.entities.SolicitudBono.update(b.id, { estado });
      setBonos((bs) => bs.map((x) => (x.id === b.id ? { ...x, estado } : x)));
      load();
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const eliminar = async (b) => {
    if (!confirm("¿Eliminar esta solicitud de bono?")) return;
    try {
      await base44.entities.SolicitudBono.delete(b.id);
      setBonos((bs) => bs.filter((x) => x.id !== b.id));
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (!evento) return <p className="text-muted-foreground">Seleccioná un evento.</p>;

  return (
    <div>
      <h2 className="font-heading font-bold text-2xl mb-1">Bonos de colaboración</h2>
      <p className="text-muted-foreground text-sm mb-6">Solicitudes y estado de pago de los bonos.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Bonos verificados</p>
          <p className="font-heading font-bold text-2xl mt-1">{stats.total}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total recaudado</p>
          <p className="font-heading font-bold text-2xl mt-1">${stats.monto.toLocaleString("es-AR")}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Solicitudes totales</p>
          <p className="font-heading font-bold text-2xl mt-1">{bonos.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center"><div className="w-7 h-7 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto" /></div>
      ) : bonos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">No hay solicitudes de bonos todavía.</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left font-medium px-4 py-3 text-muted-foreground">Código</th>
                  <th className="text-left font-medium px-4 py-3 text-muted-foreground">Nombre</th>
                  <th className="text-left font-medium px-4 py-3 text-muted-foreground">Contacto</th>
                  <th className="text-left font-medium px-4 py-3 text-muted-foreground">Monto</th>
                  <th className="text-left font-medium px-4 py-3 text-muted-foreground">Fecha</th>
                  <th className="text-left font-medium px-4 py-3 text-muted-foreground">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bonos.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{b.codigo || "—"}</td>
                    <td className="px-4 py-3">{b.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.email}{b.telefono && ` · ${b.telefono}`}</td>
                    <td className="px-4 py-3 font-medium">${(b.monto || 0).toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(b.created_date).toLocaleDateString("es-AR")}</td>
                    <td className="px-4 py-3">
                      <select
                        value={b.estado}
                        onChange={(e) => cambiarEstado(b, e.target.value)}
                        className={`h-8 text-xs rounded-md border-0 px-2 font-medium ${(ESTADOS.find((s) => s.value === b.estado) || ESTADOS[0]).color}`}
                      >
                        {ESTADOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right"><button onClick={() => eliminar(b)} className="p-1.5 hover:bg-secondary rounded text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}