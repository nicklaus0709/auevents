import React, { useState } from "react";
import { useEvento } from "@/lib/eventoContext";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, FileDown, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { generarPdf } from "@/lib/pdf";
import PageHeader from "@/components/admin/PageHeader";

const ITEMS = [
  { key: "artistas", titulo: "Grilla de artistas", detalle: "PDF ordenado por fecha y horario" },
  { key: "gastronomia", titulo: "Gastronomía", detalle: "PDF ordenado por número de puesto" },
];

const botonCls = "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold transition hover:bg-accent disabled:opacity-60";

export default function QrManager() {
  const { evento } = useEvento();
  const [generando, setGenerando] = useState(null);
  const urlBase = window.location.origin;
  // El link lleva el evento: al escanear, el celular descarga el PDF actualizado de ese evento
  const queryEvento = evento ? `?evento=${encodeURIComponent(evento.slug || evento.id)}` : "";

  const descargarPng = (id, nombre) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${nombre}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const verPdf = async (key) => {
    if (!evento) return;
    setGenerando(key);
    try {
      const { doc, filename } = await generarPdf(key, evento);
      doc.save(filename);
    } catch (e) {
      toast({ title: "No se pudo generar el PDF", variant: "destructive" });
    } finally {
      setGenerando(null);
    }
  };

  const imprimir = (id, titulo) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const win = window.open("", "_blank", "width=480,height=640");
    if (!win) return;
    win.document.write(
      '<!doctype html><html><head><title>' + titulo + '</title></head>' +
      '<body style="font-family:Arial,sans-serif;text-align:center;padding:32px">' +
      '<h2 style="margin:0 0 6px">' + titulo + '</h2>' +
      '<p style="margin:0 0 20px;color:#555">Escaneá el código para descargar el PDF</p>' +
      '<img src="' + canvas.toDataURL("image/png") + '" style="width:300px;height:300px" />' +
      '<script>setTimeout(function(){window.print()},300)<\/script>' +
      '</body></html>'
    );
    win.document.close();
  };

  if (!evento) return <p className="text-muted-foreground">Seleccioná un evento.</p>;

  return (
    <div>
      <PageHeader
        title="Códigos QR"
        description="Códigos para imprimir o afichar. Al escanearlos, el celular descarga un PDF con la información cargada en ese momento: no hace falta volver a imprimirlos si cambiás los datos."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((it) => {
          const url = `${urlBase}/pdf/${it.key}${queryEvento}`;
          const id = "qr-" + it.key;
          return (
            <div key={it.key} className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <p className="font-heading text-lg font-semibold">{it.titulo}</p>
              <p className="text-xs text-muted-foreground">{it.detalle}</p>
              <div className="mt-4 rounded-2xl border border-border bg-white p-4 shadow-inner">
                <QRCodeCanvas id={id} value={url} size={180} fgColor="#0c1f14" bgColor="#ffffff" />
              </div>
              <p className="mt-3 break-all text-xs text-muted-foreground">{url}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button onClick={() => verPdf(it.key)} disabled={generando === it.key} className={botonCls}>
                  {generando === it.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />} Probar PDF
                </button>
                <button onClick={() => descargarPng(id, "qr-" + it.key)} className={botonCls}>
                  <Download className="h-3.5 w-3.5" /> Descargar QR
                </button>
                <button onClick={() => imprimir(id, it.titulo)} className={botonCls}>
                  <Printer className="h-3.5 w-3.5" /> Imprimir
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Los códigos usan la dirección actual del sitio. Una vez publicada la app (idealmente con dominio propio), generá e imprimí los códigos desde la versión publicada para que apunten a la dirección definitiva.
      </p>
    </div>
  );
}
