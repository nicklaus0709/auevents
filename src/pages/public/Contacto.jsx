import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { toast } from "@/components/ui/use-toast";
import PageHero from "@/components/public/PageHero";
import Spinner from "@/components/public/Spinner";

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

  if (loading) return <Spinner />;

  return (
    <>
      <PageHero
        eyebrow={evento?.nombre}
        title="Contacto"
        subtitle="¿Querés participar como artista o tener un puesto gastronómico? Escribinos."
        image={evento?.hero_image}
      />
      <section className="section max-w-3xl">
        {sent ? (
          <div className="card border-green-300 bg-green-50 py-12 text-center text-green-800">
            <h2 className="mb-2 text-2xl !text-green-900">¡Mensaje enviado!</h2>
            <p className="mb-6">¡Gracias! Recibimos tu mensaje y la Municipalidad se va a comunicar con vos.</p>
            <button className="btn-secondary" onClick={() => setSent(false)}>Enviar otro mensaje</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4 !p-6">
            <div>
              <label className="label" htmlFor="tipo">Motivo</label>
              <select id="tipo" className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="artista">Artista / Músico</option>
                <option value="puesto">Puesto gastronómico</option>
                <option value="otro">Otra consulta</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="nombre">Nombre y apellido</label>
                <input id="nombre" className="input" required autoComplete="name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" className="input" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="telefono">Teléfono / WhatsApp (opcional)</label>
              <input id="telefono" type="tel" className="input" autoComplete="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="mensaje">Mensaje</label>
              <textarea id="mensaje" rows={5} className="input" required value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} />
            </div>
            <button className="btn w-full sm:w-auto" disabled={sending}>{sending ? "Enviando…" : "Enviar mensaje"}</button>
          </form>
        )}
      </section>
    </>
  );
}
