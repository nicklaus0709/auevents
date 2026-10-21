import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { formatMoney } from "@/lib/formato";
import { toast } from "@/components/ui/use-toast";
import PageHero from "@/components/public/PageHero";
import { Navigate } from "react-router-dom";
import { txt, parseMontos, mostrarBonos } from "@/lib/textos";
import Spinner from "@/components/public/Spinner";

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

  if (loading) return <Spinner />;
  if (evento && !mostrarBonos(evento)) return <Navigate to="/" replace />;
  const MONTOS = parseMontos(evento);

  return (
    <>
      <PageHero
        eyebrow={evento?.nombre}
        title={txt(evento, "bonos_titulo")}
        subtitle={txt(evento, "bonos_subtitulo")}
        image={evento?.hero_image}
      />
      <section className="section max-w-3xl">
        {solicitud ? (
          <div className="card !p-8 text-center">
            <h2 className="mb-2 text-2xl">¡Solicitud registrada!</h2>
            <p className="mb-1 text-stone-600">Tu código de seguimiento es:</p>
            <p className="mb-6 font-mono text-xl font-bold tracking-wider text-brand">{solicitud.codigo}</p>
            <p className="mx-auto mb-6 max-w-md text-sm text-stone-600">
              Para confirmar tu bono, realizá el pago de <strong>{formatMoney(solicitud.monto)}</strong> a través de Mercado Pago y luego enviá el comprobante por WhatsApp con tu código.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {evento?.mp_link && (
                <a href={evento.mp_link} target="_blank" rel="noopener noreferrer" className="btn !px-6 !py-3">
                  Pagar en Mercado Pago <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              {evento?.whatsapp_url && (
                <a href={evento.whatsapp_url} target="_blank" rel="noopener noreferrer" className="btn-secondary !px-6 !py-3">
                  Enviar comprobante por WhatsApp
                </a>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-6 !p-6 md:!p-8">
            <div>
              <span className="label" id="monto-label">Elegí el monto de tu colaboración</span>
              <div role="radiogroup" aria-labelledby="monto-label" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {MONTOS.map((m) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!custom && form.monto === m}
                    key={m}
                    onClick={() => { setForm({ ...form, monto: m }); setCustom(""); }}
                    className={`rounded-xl border-2 px-3 py-4 font-titulo text-lg font-bold transition ${
                      !custom && form.monto === m ? "border-brand bg-brand/10 text-brand" : "border-stone-200 hover:border-brand/40"
                    }`}
                  >
                    {formatMoney(m)}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="label" htmlFor="custom">Otro monto</label>
                <input id="custom" type="number" min="1" className="input" placeholder="Ingresá un monto personalizado" value={custom} onChange={(e) => setCustom(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="bnombre">Nombre y apellido</label>
                <input id="bnombre" className="input" required autoComplete="name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="bemail">Email</label>
                <input id="bemail" type="email" className="input" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="btelefono">Teléfono</label>
              <input id="btelefono" type="tel" className="input" autoComplete="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>

            <div className="border-t border-stone-100 pt-4">
              <p className="mb-3 text-sm text-stone-600">
                Total a colaborar: <strong className="text-2xl font-extrabold text-brand">{formatMoney(montoFinal || 0)}</strong>
              </p>
              <button type="submit" disabled={sending} className="btn w-full sm:w-auto">
                {sending ? "Registrando…" : "Registrar mi colaboración"}
              </button>
              <p className="mt-3 text-xs text-stone-500">
                Al registrar vas a recibir un código de seguimiento y el link de Mercado Pago para completar el pago.
              </p>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
