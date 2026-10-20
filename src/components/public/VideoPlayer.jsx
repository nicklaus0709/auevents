import React from "react";
import { videoEmbed } from "@/lib/ambiente";

/** Reproduce un video de YouTube, Vimeo o Facebook (embebido) o un archivo de video subido. */
export default function VideoPlayer({ url, titulo }) {
  const v = videoEmbed(url);
  if (!v) return null;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-stone-200">
      {v.tipo === "iframe" ? (
        <iframe
          src={v.src}
          title={titulo || "Video"}
          loading="lazy"
          className="h-full w-full border-0"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <video src={v.src} controls preload="metadata" className="h-full w-full object-contain" aria-label={titulo || "Video"} />
      )}
    </div>
  );
}
