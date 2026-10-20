import React, { useEffect, useState } from "react";
import { MailPlus, ShieldCheck, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import PageHeader, { Panel, Spinner, EmptyState } from "@/components/admin/PageHeader";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "user", label: "Usuario (sin acceso al panel)" },
];
const rolLabel = (r) => ROLES.find((x) => x.value === r)?.label.split(" (")[0] || r || "—";

export default function UsuariosManager() {
  const { user: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sinLista, setSinLista] = useState(false);
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("admin");
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.User.filter({}, { sort: "-created_date", limit: 200 });
      setUsuarios(items || []);
      setSinLista(false);
    } catch (e) {
      setSinLista(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const invitar = async (e) => {
    e.preventDefault();
    const correo = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(correo)) {
      toast({ title: "Revisá el email", variant: "destructive" });
      return;
    }
    setEnviando(true);
    try {
      await base44.auth.inviteUser(correo, rol);
      toast({ title: "Invitación enviada", description: `${correo} recibirá un correo para entrar como ${rolLabel(rol).toLowerCase()}.` });
      setEmail("");
      cargar();
    } catch (err) {
      toast({ title: "No se pudo enviar la invitación", description: err?.message, variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const cambiarRol = async (u, nuevo) => {
    try {
      await base44.entities.User.update(u.id, { role: nuevo });
      setUsuarios((us) => us.map((x) => (x.id === u.id ? { ...x, role: nuevo } : x)));
      toast({ title: "Rol actualizado", description: `${u.email} ahora es ${rolLabel(nuevo).toLowerCase()}.` });
    } catch (err) {
      toast({ title: "No se pudo cambiar el rol", description: "Probá desde el panel de usuarios de Base44.", variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader title="Usuarios" description="Quién puede entrar al panel de administración. Solo los administradores pueden cargar y editar contenido." count={sinLista || loading ? undefined : usuarios.length} />

      <Panel title="Invitar a una persona" description="Le llega un correo con la invitación. Puede entrar con su cuenta de Google o con email y contraseña." className="mb-6">
        <form onSubmit={invitar} className="grid items-end gap-4 sm:grid-cols-[1fr_16rem_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="inv-email">Email</Label>
            <Input id="inv-email" type="email" required placeholder="nombre@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-rol">Rol</Label>
            <select id="inv-rol" value={rol} onChange={(e) => setRol(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <Button type="submit" disabled={enviando}><MailPlus className="h-4 w-4" /> {enviando ? "Enviando…" : "Enviar invitación"}</Button>
        </form>
      </Panel>

      {loading ? (
        <Spinner />
      ) : sinLista ? (
        <EmptyState icon={Info}>
          No se pudo cargar la lista de usuarios desde acá. Podés invitar igual con el formulario de arriba; para ver o cambiar roles usá el panel de usuarios de Base44.
        </EmptyState>
      ) : usuarios.length === 0 ? (
        <EmptyState icon={ShieldCheck}>Todavía no hay usuarios.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/60">
                <tr>
                  {["Usuario", "Estado", "Rol"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usuarios.map((u) => {
                  const soyYo = u.id === yo?.id || u.email === yo?.email;
                  return (
                    <tr key={u.id} className="transition-colors hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{u.full_name || u.email} {soyYo && <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">Vos</span>}</p>
                        {u.full_name && <p className="text-xs text-muted-foreground">{u.email}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.disabled ? "bg-red-100 text-red-700" : u.is_verified === false ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {u.disabled ? "Deshabilitado" : u.is_verified === false ? "Sin verificar" : "Activo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {soyYo ? (
                          <span className="text-muted-foreground">{rolLabel(u.role)}</span>
                        ) : (
                          <select value={u.role || "user"} onChange={(e) => cambiarRol(u, e.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
                            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label.split(" (")[0]}</option>)}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">Tu propio rol no se puede cambiar desde acá, para no quedarte sin acceso por error.</p>
    </div>
  );
}
