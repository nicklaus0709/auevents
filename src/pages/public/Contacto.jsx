import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function Contacto() {
  const { evento, loading } = useEvento();
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", tipo: "artista", mensaje: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!evento) return;
    setSending(true);
    try {
      await base44.entities.MensajeContacto.create({ ...form, evento_id: evento.id });
      setSent(true);
      setForm({ nombre: "", email: "", telefono: "", tipo: "artista", mensaje: "" });
      toast({ title: "Mensaje enviado", description: "Nos comunicaremos con vos a la brevedad." });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el mensaje. Intentá nuevamente.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{evento?.nombre}</span>
        <h1 className="font-heading font-bold text-4xl md:text-5xl mt-2">Contacto</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          ¿Querés participar como artista o tener un puesto gastronómico? Escribinos.
        </p>
      </header>

      {sent ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: evento?.color_acento || "hsl(var(--accent))" }} />
          <h2 className="font-heading font-semibold text-2xl mb-2">¡Mensaje enviado!</h2>
          <p className="text-muted-foreground mb-6">Gracias por tu interés. Nos comunicaremos con vos pronto.</p>
          <Button variant="outline" onClick={() => setSent(false)}>Enviar otro mensaje</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-xl p-6 md:p-8">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre y apellido *</Label>
              <Input id="nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Quiero participar como</Label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="artista">Artista / Músico</option>
              <option value="puesto">Puesto gastronómico</option>
              <option value="otro">Otra consulta</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje *</Label>
            <Textarea id="mensaje" required rows={5} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} />
          </div>
          <Button type="submit" disabled={sending} className="w-full sm:w-auto">
            {sending ? "Enviando..." : "Enviar mensaje"}
            {!sending && <Send className="h-4 w-4 ml-2" />}
          </Button>
        </form>
      )}
    </div>
  );
}