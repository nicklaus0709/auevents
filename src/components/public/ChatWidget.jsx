import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import { formatDia } from "@/lib/formato";
import { txt } from "@/lib/textos";
import { ordenarAlojamientos } from "@/lib/alojamientos";

/** Responde con los datos publicados (grilla, puestos, bonos), sin servicios externos. */
function reply(question, evento, c) {
  const m = question.toLowerCase();
  const has = (...w) => w.some((x) => m.includes(x));

  if (has("artista", "grilla", "horario", "show", "música", "musica", "programa", "cuando", "cuándo", "escenario", "actividad")) {
    if (!c.artistas.length) return "Todavía no se cargó la programación. ¡Volvé pronto!";
    return "Esta es la programación:\n" + c.artistas.slice(0, 12).map((a) => `• ${formatDia(a.fecha)}${a.hora_inicio ? ` ${a.hora_inicio} hs` : ""}: ${a.nombre}${a.escenario ? ` (${a.escenario})` : ""}`).join("\n");
  }
  if (has("comida", "gastro", "puesto", "comer", "bebida", "menu", "menú", "precio", "hambre")) {
    if (!c.puestos.length) return "Todavía no se cargaron los puestos gastronómicos.";
    const prodsDe = (p) => c.productos.filter((pr) => pr.puesto_id === p.id);
    const found = c.puestos.filter((p) => prodsDe(p).some((pr) => m.split(/\s+/).some((w) => w.length > 3 && (pr.nombre || "").toLowerCase().includes(w))));
    const list = (found.length ? found : c.puestos).slice(0, 8);
    return (found.length ? "Encontré estos puestos:\n" : "Estos son los puestos gastronómicos:\n") +
      list.map((p) => `• Puesto ${p.numero ?? "-"} · ${p.nombre}: ${prodsDe(p).slice(0, 4).map((pr) => pr.nombre).join(", ")}`).join("\n");
  }
  if (has("alojamiento", "hotel", "hospedaje", "hostería", "hosteria", "cabaña", "cabana", "dormir", "quedarme", "hospedar", "camping")) {
    if (!c.alojamientos.length) return "Todavía no se cargaron los alojamientos.";
    return "Estos son los alojamientos:\n" + c.alojamientos.slice(0, 10).map((x) => `• ${x.nombre}${x.direccion ? ` - ${x.direccion}` : ""}`).join("\n") + '\nMirá el detalle y el mapa en la sección "Alojamientos".';
  }
  if (has("bono", "colabor", "comprar", "pagar", "pago")) return 'Podés registrar tu bono de colaboración desde la sección "Bonos".';
  if (has("contacto", "whatsapp", "telefono", "teléfono", "municipalidad", "participar")) return "Escribinos desde la sección Contacto.";
  return "Puedo ayudarte con la programación, los puestos de comida y los bonos. ¿Qué querés saber?";
}

export default function ChatWidget() {
  const { evento } = useEvento();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [data, setData] = useState({ artistas: [], puestos: [], productos: [], alojamientos: [] });
  const [msgs, setMsgs] = useState(() => [{ role: "bot", text: txt(evento, "chat_saludo") }]);
  const end = useRef(null);

  // Los datos se cargan recién cuando se abre el chat por primera vez
  useEffect(() => {
    if (!open || !evento) return;
    let mounted = true;
    (async () => {
      try {
        const [a, p, pr, al] = await Promise.all([
          base44.entities.Artista.filter({ evento_id: evento.id }, { sort: "orden", limit: 100 }),
          base44.entities.PuestoGastronomico.filter({ evento_id: evento.id }, { sort: "numero", limit: 100 }),
          base44.entities.Producto.filter({ evento_id: evento.id }, { limit: 500 }),
          base44.entities.Alojamiento.filter({ evento_id: evento.id }, { limit: 100 }).catch(() => ({ items: [] })),
        ]);
        if (mounted) setData({ artistas: a.items || [], puestos: p.items || [], productos: pr.items || [], alojamientos: ordenarAlojamientos(al.items || []) });
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [open, evento?.id]);

  if (!evento) return null;

  function send(e) {
    e.preventDefault();
    const text = input.trim().slice(0, 300);
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: reply(text, evento, data) }]);
    setInput("");
    setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir chat de ayuda"
        className="no-print fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-xl transition hover:scale-110"
      >
        {open ? "✕" : "🤖"}
      </button>
      {open && (
        <div className="no-print fixed inset-x-3 bottom-20 z-40 flex h-[28rem] max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-96" role="dialog" aria-label="Asistente del evento">
          <div className="bg-brand px-4 py-3 text-sm font-bold text-white">Asistente del evento</div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <p className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 ${m.role === "user" ? "bg-brand text-white" : "bg-stone-100"}`}>{m.text}</p>
              </div>
            ))}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-stone-200 p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={300} placeholder="Escribí tu consulta…" className="input" aria-label="Mensaje" />
            <button className="btn">Enviar</button>
          </form>
        </div>
      )}
    </>
  );
}
