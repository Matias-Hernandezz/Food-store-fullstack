import { useState } from "react";
import { Button, Badge, ConfirmDialog, SkeletonRow, ErrorState, EmptyState, SearchInput } from "../../shared/components/ui";
import { useDeleteIngrediente } from "../../hooks/useIngrediente";
import type { Ingrediente } from "../../types";

interface IngredienteTableProps {
  data: Ingrediente[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onEdit: (i: Ingrediente) => void;
}

export function IngredienteTable({ data, total, isLoading, isError, onEdit }: IngredienteTableProps) {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteMutation = useDeleteIngrediente();

  const filtered = data.filter((i) =>
    i.nombre.toLowerCase().includes(search.toLowerCase())
  );

  async function handleConfirmDelete() {
    if (deleteId === null) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar ingrediente..." />
        <span className="text-xs text-zinc-500 whitespace-nowrap">{total} registros</span>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-800/60 text-zinc-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">ID</th>
              <th className="text-left px-4 py-3 font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold">Descripción</th>
              <th className="text-left px-4 py-3 font-semibold">Alérgeno</th>
              <th className="text-right px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-zinc-800">
                  <td colSpan={5}><SkeletonRow /></td>
                </tr>
              ))}
            {isError && (
              <tr><td colSpan={5}><ErrorState /></td></tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr><td colSpan={5}><EmptyState message="No se encontraron ingredientes" /></td></tr>
            )}
            {!isLoading && !isError && filtered.map((ing) => (
              <tr
                key={ing.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{ing.id}</td>
                <td className="px-4 py-3 text-zinc-100 font-medium">{ing.nombre}</td>
                <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">
                  {ing.descripcion ?? <span className="text-zinc-600 italic">sin descripción</span>}
                </td>
                <td className="px-4 py-3">
                  {ing.es_alergeno ? (
                    <Badge variant="warning">⚠ Alérgeno</Badge>
                  ) : (
                    <Badge variant="default">No</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => onEdit(ing)} className="text-xs px-3 py-1">
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setDeleteId(ing.id)}
                      className="text-xs px-3 py-1"
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        message="¿Estás seguro que querés eliminar este ingrediente? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
