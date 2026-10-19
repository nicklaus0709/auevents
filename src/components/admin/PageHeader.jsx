import React from "react";

/** Encabezado común de cada sección del panel: título, descripción y acciones a la derecha. */
export default function PageHeader({ title, description, count, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-3 font-heading text-2xl font-bold tracking-tight">
          {title}
          {typeof count === "number" && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-xs font-semibold text-primary">{count}</span>
          )}
        </h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

/** Contenedor blanco con borde y sombra suave. */
export function Panel({ title, description, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="font-heading text-base font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Spinner() {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-[3px] border-border border-t-primary" />
    </div>
  );
}

export function EmptyState({ icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 py-16 text-center text-muted-foreground">
      {Icon && <Icon className="mx-auto mb-3 h-9 w-9 opacity-40" />}
      {children}
    </div>
  );
}
