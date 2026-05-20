import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { CategoriaTable } from "../components/CategoriaTable";
import { CategoriaForm } from "../components/CategoriaForm";
import { useCategorias } from "../hooks/useCategoria";
import type { Categoria } from "../../../shared/types";

export function CategoriasPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);

  const { data, isLoading, isError } = useCategorias();

  function handleEdit(cat: Categoria) {
    setEditing(cat);
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
          <h1 className="text-xl font-bold text-zinc-100">Categorías</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Gestioná las categorías de tus productos</p>
        </div>
        <Button onClick={handleNew}>+ Nueva categoría</Button>
      </div>

      <CategoriaTable
        data={data?.data ?? []}
        total={data?.total ?? 0}
        isLoading={isLoading}
        isError={isError}
        onEdit={handleEdit}
      />

      <CategoriaForm
        open={formOpen}
        onClose={handleClose}
        editing={editing}
        categorias={data?.data ?? []}
      />
    </div>
  );
}