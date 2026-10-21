import React, { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/** Galería tipo mosaico con visor a pantalla completa (Radix Dialog: atrapa el foco y lo devuelve a la miniatura; teclado: ← → Esc). */
export default function Gallery({ images, alt }) {
  const [current, setCurrent] = useState(null);
  const close = useCallback(() => setCurrent(null), []);
  const move = useCallback((d) => setCurrent((c) => (c === null ? c : (c + d + images.length) % images.length)), [images.length]);

  const img = current !== null ? images[current] : null;

  return (
    <>
      <ul className="columns-2 gap-3 sm:gap-4 md:columns-3">
        {images.map((g, i) => (
          <li key={g.id} className="mb-3 break-inside-avoid sm:mb-4">
            <button onClick={() => setCurrent(i)} className="group relative block w-full overflow-hidden rounded-2xl" aria-label={`Ampliar: ${g.titulo || alt}`}>
              <img src={g.imagen_url} alt={g.titulo || alt} loading="lazy" className="w-full object-cover transition duration-500 group-hover:scale-105" />
              {g.titulo && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {g.titulo}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent
          aria-describedby={undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") move(1);
            if (e.key === "ArrowLeft") move(-1);
          }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          className="left-0 top-0 flex h-full max-w-none translate-x-0 translate-y-0 items-center justify-center border-0 bg-black/90 p-4 text-white data-[state=closed]:animate-none data-[state=open]:animate-none sm:rounded-none"
        >
          <DialogTitle className="sr-only">{img?.titulo || alt}</DialogTitle>
          {images.length > 1 && (
            <>
              <button onClick={() => move(-1)} aria-label="Foto anterior" className="absolute left-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronLeft className="h-6 w-6" aria-hidden="true" /></button>
              <button onClick={() => move(1)} aria-label="Foto siguiente" className="absolute right-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronRight className="h-6 w-6" aria-hidden="true" /></button>
            </>
          )}
          {img && (
            <figure className="max-h-full max-w-5xl text-center">
              <img src={img.imagen_url} alt={img.titulo || alt} className="mx-auto max-h-[80vh] rounded-xl object-contain" />
              {img.titulo && <figcaption className="mt-3 text-sm font-medium text-white">{img.titulo}</figcaption>}
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
