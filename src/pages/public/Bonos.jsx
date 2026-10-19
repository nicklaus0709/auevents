import React, { useState } from "react";
import { Heart, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const MONTOS = [2000, 5000, 10000, 20000];

export default function Bonos() {
  const { evento, loading } = useEvento();
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", monto: 5000 });
  const [custom, setCustom] = useState("");
  const [sending, setSending] = useState(false);
  const [solicitud, setSolicitud] = useState(null);

  const montoFinal = custom ? Number(custom) : form.monto;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!evento) return;
    if (!montoFinal || montoFinal <= 0) {
      toast({ title: "Indicá un monto válido", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const codigo = "BONO-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const rec = await base44.entities.SolicitudBono.create({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        monto: montoFinal,
        evento_id: evento.id,
        codigo,
      });
      setSolicitud({ ...rec, codigo });
      toast({ title: "Solicitud registrada", description: "Continuá con el pago en Mercado Pago." });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo registrar la solicitud.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <header className="mb-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary mb-4">
          <Heart className="h-7 w-7" style={{ color: evento?.color_acento || "hsl(var(--accent))" }} />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{evento?.nombre}</span>
        <h1 className="font-heading font-bold text-4xl md:text-5xl mt-2">Bonos de Colaboración</h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-xl mx-auto">
          Apoyá el evento de la comunidad de Capioví con tu colaboración. Todos los bonos ayudan a sostener la fiesta.
        </p>
      </header>

      {solicitud ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: evento?.color_acento || "hsl(var(--accent))" }} />
          <h2 className="font-heading font-semibold text-2xl mb-2">¡Solicitud registrada!</h2>
          <p className="text-muted-foreground mb-1">Tu código de seguimiento es:</p>
          <p className="font-mono font-bold text-xl mb-6 tracking-wider">{solicitud.codigo}</p>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Para confirmar tu bono, realizá el pago de <strong>${solicitud.monto.toLocaleString("es-AR")}</strong> a través de Mercado Pago y luego enviá el comprobante por WhatsApp con tu código.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {evento?.mp_link && (
              <a href={evento.mp_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-accent-foreground font-semibold rounded-md hover:opacity-90 transition-opacity">
                Pagar en Mercado Pago <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
            {evento?.whatsapp_url && (
              <a href={evento.whatsapp_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-border font-semibold rounded-md hover:bg-secondary transition-colors">
                Enviar comprobante por WhatsApp
              </a>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 md:p-8">
          <div>
            <Label>Elegí el monto de tu colaboración</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {MONTOS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => { setForm({ ...form, monto: m }); setCustom(""); }}
                  className={`px-3 py-4 rounded-lg border-2 font-heading font-semibold transition-colors ${
                    !custom && form.monto === m ? "border-foreground bg-secondary" : "border-border hover:border-foreground/40"
                  }`}
                >
                  ${m.toLocaleString("es-AR")}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Label htmlFor="custom">Otro monto</Label>
              <Input
                id="custom"
                type="number"
                min="1"
                placeholder="Ingresá un monto personalizado"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="bnombre">Nombre y apellido *</Label>
              <Input id="bnombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bemail">Email *</Label>
              <Input id="bemail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="btelefono">Teléfono</Label>
            <Input id="btelefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Total a colaborar: <strong className="text-foreground text-lg">${montoFinal.toLocaleString("es-AR")}</strong>
            </p>
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? "Registrando..." : "Registrar y continuar al pago"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Al registrar vas a recibir un código de seguimiento y el link de Mercado Pago para completar el pago.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}