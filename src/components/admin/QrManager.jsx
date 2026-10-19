import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";

const ITEMS = [
  { key: "artistas", titulo: "Grilla de artistas", path: "/eventos" },
  { key: "gastronomia", titulo: "Gastronomía", path: "/gastronomia" },
];

export default function QrManager() {
  const urlBase = window.location.origin;

  const descargar = (id, nombre) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${nombre}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const imprimir = (id, titulo, url) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const win = window.open("", "_blank", "width=480,height=640");
    if (!win) return;
    win.document.write(
      '<!doctype html><html><head><title>' + titulo + '</title></head>' +
      '<body style="font-family:Arial,sans-serif;text-align:center;padding:32px">' +
      '<h2 style="margin:0 0 6px">' + titulo + '</h2>' +
      '<p style="margin:0 0 20px;color:#555">' + url + '</p>' +
      '<img src="' + canvas.toDataURL("image/png") + '" style="width:300px;height:300px" />' +
      '<script>setTimeout(function(){window.print()},300)<\/script>' +
      '</body></html>'
    );
    win.document.close();
  };

  return (
    <div>
      <PageHeader title="Códigos QR" description="Códigos para imprimir o afichar: al escanearlos, el visitante llega directo a la grilla de artistas o a la gastronomía." />
      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((it) => {
          const url = urlBase + it.path;
          const id = "qr-" + it.key;
          return (
            <div key={it.key} className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <p className="font-heading text-lg font-semibold">{it.titulo}</p>
              <div className="mt-4 rounded-2xl border border-border bg-white p-4 shadow-inner">
                <QRCodeCanvas id={id} value={url} size={180} fgColor="#0c1f14" bgColor="#ffffff" />
              </div>
              <p className="mt-3 break-all text-xs text-muted-foreground">{url}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => descargar(id, "qr-" + it.key)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold transition hover:bg-accent"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar PNG
                </button>
                <button
                  onClick={() => imprimir(id, it.titulo, url)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold transition hover:bg-accent"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimir
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Los códigos usan la dirección actual del sitio. Una vez publicado el app (idealmente con dominio propio), generá e imprimí los códigos desde la versión publicada para que apunten a la dirección definitiva.
      </p>
    </div>
  );
}