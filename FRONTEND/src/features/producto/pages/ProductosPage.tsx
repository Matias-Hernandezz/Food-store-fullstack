import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { ProductoTable } from "../components/ProductoTable";
import { ProductoForm } from "../components/ProductoForm";
import { useProductos } from "../../hooks/useProducto";
import { useCategorias } from "../../hooks/useCategoria";
import { useIngredientes } from "../../ingrediente/hooks/useIngrediente";
import type { Producto } from "../../types";

export function ProductosPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);

  const { data: productos, isLoading, isError } = useProductos();
  const { data: categorias } = useCategorias();
  const { data: ingredientes } = useIngredientes();

  function handleEdit(prod: Producto) {
    setEditing(prod);
    setFormOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Productos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Gestioná el catálogo de productos</p>
        </div>
        <Button onClick={handleNew}>+ Nuevo producto</Button>
      </div>

      <ProductoTable
        data={productos?.data ?? []}
        total={productos?.total ?? 0}
        isLoading={isLoading}
        isError={isError}
        onEdit={handleEdit}
      />

      <ProductoForm
        open={formOpen}
        onClose={handleClose}
        editing={editing}
        categorias={categorias?.data ?? []}
        ingredientes={ingredientes?.data ?? []}
      />
    </div>
  );
}
