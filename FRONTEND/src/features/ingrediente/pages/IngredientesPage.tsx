import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { IngredienteTable } from "../../components/ingrediente/IngredienteTable";
import { IngredienteForm } from "../../components/ingrediente/IngredienteForm";
import { useIngredientes } from "../hooks/useIngrediente";
import type { Ingrediente } from "../../types";

export function IngredientesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ingrediente | null>(null);

  const { data, isLoading, isError } = useIngredientes();

  function handleEdit(ing: Ingrediente) {
    setEditing(ing);
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
          <h1 className="text-xl font-bold text-zinc-100">Ingredientes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Administrá los ingredientes y alérgenos</p>
        </div>
        <Button onClick={handleNew}>+ Nuevo ingrediente</Button>
      </div>

      <IngredienteTable
        data={data?.data ?? []}
        total={data?.total ?? 0}
        isLoading={isLoading}
        isError={isError}
        onEdit={handleEdit}
      />

      <IngredienteForm
        open={formOpen}
        onClose={handleClose}
        editing={editing}
      />
    </div>
  );
}
