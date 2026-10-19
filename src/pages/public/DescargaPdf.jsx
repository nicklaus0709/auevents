import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useEvento } from "@/lib/eventoContext";
import { generarPdf, TIPOS_PDF } from "@/lib/pdf";
import { esNavidad, hexToRgbTriplet } from "@/lib/formato";

/** Destino de los códigos QR: arma el PDF con los datos actuales y lo descarga solo. */
export default function DescargaPdf() {
  const { tipo } = useParams();
  const { evento, loading } = useEvento();
  const def = TIPOS_PDF[tipo];
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error
  const iniciado = useRef(false);

  const descargar = async () => {
    setEstado("cargando");
    try {
      const { doc, filename } = await generarPdf(tipo, evento);
      doc.save(filename);
      setEstado("listo");
    } catch (e) {
      setEstado("error");
    }
  };

  useEffect(() => {
    if (loading || !evento || !def || iniciado.current) return;
    iniciado.current = true;
    descargar();
  }, [loading, evento?.id]);

  const theme = {
    "--brand": hexToRgbTriplet(evento?.color_primario, "193 18 31"),
    "--brand2": hexToRgbTriplet(evento?.color_acento, "21 128 61"),
  };

  let contenido;
  if (!def) {
    contenido = <Mensaje icono={<AlertCircle className="h-10 w-10 text-brand" />} titulo="No encontramos ese documento" texto="Revisá que el código QR sea el correcto." />;
  } else if (loading) {
    contenido = <Mensaje icono={<Loader2 className="h-10 w-10 animate-spin text-brand" />} titulo="Cargando…" />;
  } else if (!evento) {
    contenido = <Mensaje icono={<AlertCircle className="h-10 w-10 text-brand" />} titulo="Todavía no hay eventos publicados" texto="Volvé a intentarlo más tarde." />;
  } else if (estado === "cargando") {
    contenido = <Mensaje icono={<Loader2 className="h-10 w-10 animate-spin text-brand" />} titulo={`Preparando ${def.titulo.toLowerCase()}…`} texto="En unos segundos se descarga el PDF." />;
  } else if (estado === "error") {
    contenido = (
      <Mensaje icono={<AlertCircle className="h-10 w-10 text-brand" />} titulo="No pudimos generar el PDF" texto="Probá de nuevo en un momento.">
        <button onClick={descargar} className="btn mt-6">Reintentar</button>
      </Mensaje>
    );
  } else {
    contenido = (
      <Mensaje icono={<CheckCircle2 className="h-10 w-10 text-brand2" />} titulo="¡Listo!" texto={`Se descargó ${def.titulo.toLowerCase()} de ${evento.nombre}. Si no empezó solo, tocá el botón.`}>
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <button onClick={descargar} className="btn"><FileDown className="h-4 w-4" /> Descargar de nuevo</button>
          <Link to={`${def.ruta}?evento=${encodeURIComponent(evento.slug || evento.id)}`} className="btn-secondary">Ver en el sitio</Link>
        </div>
      </Mensaje>
    );
  }

  return (
    <div className={`public-site flex min-h-screen items-center justify-center px-4 ${esNavidad(evento) ? "navidad" : ""}`} style={theme}>
      <div className="card w-full max-w-md !p-8 text-center shadow-xl">
        {evento?.nombre && <p className="eyebrow !mb-4">{evento.nombre}</p>}
        {contenido}
      </div>
    </div>
  );
}

function Mensaje({ icono, titulo, texto, children }) {
  return (
    <>
      <div className="mb-4 flex justify-center">{icono}</div>
      <h1 className="text-2xl">{titulo}</h1>
      {texto && <p className="mt-2 text-stone-600">{texto}</p>}
      {children}
    </>
  );
}
