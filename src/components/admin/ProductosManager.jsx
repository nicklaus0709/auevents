import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEvento } from "@/lib/eventoContext";
import CrudManager from "@/components/admin/CrudManager";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";

export default function ProductosManager() {
  const { evento } = useEvento();
  const [puestos, setPuestos] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!evento) return;
      try {
        const { items } = await base44.entities.PuestoGastronomico.filter({ evento_id: evento.id }, { sort: "numero", limit: 100 });
        if (mounted) setPuestos(items || []);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [evento?.id]);

  if (!evento) return <p className="text-muted-foreground">Seleccioná un evento.</p>;
  if (puestos.length === 0) {
    return (
      <div>
        <PageHeader title="Productos" description="Productos de cada puesto gastronómico." />
        <EmptyState>Primero creá al menos un puesto gastronómico para poder cargar productos.</EmptyState>
      </div>
    );
  }

  return (
    <CrudManager
      entityName="Producto"
      title="Productos"
      description="Productos de cada puesto gastronómico."
      emptyMessage="Aún no hay productos cargados."
      fields={[
        { key: "puesto_id", label: "Puesto", type: "select", required: true, options: puestos.map((p) => ({ value: p.id, label: `N°${p.numero ?? "—"} ${p.nombre}` })) },
        { key: "nombre", label: "Nombre", type: "text", required: true },
        { key: "descripcion", label: "Descripción", type: "textarea" },
        { key: "precio", label: "Precio", type: "number" },
        { key: "imagen_url", label: "Imagen", type: "image" },
      ]}
      listColumns={[
        { key: "nombre", label: "Producto" },
        { key: "puesto_id", label: "Puesto", render: (r) => { const p = puestos.find((x) => x.id === r.puesto_id); return p ? `N°${p.numero ?? "—"} ${p.nombre}` : "—"; } },
        { key: "precio", label: "Precio", render: (r) => `$${(r.precio || 0).toLocaleString("es-AR")}` },
      ]}
    />
  );
}