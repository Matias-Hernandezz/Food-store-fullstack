import { useState } from "react";
import { Button, Badge, ConfirmDialog, SkeletonRow, ErrorState, EmptyState, SearchInput } from "../../../shared/components/ui";
import { useDeleteProducto } from "../../hooks/useProducto";
import type { Producto } from "../../types";

interface ProductoTableProps {
  data: Producto[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onEdit: (p: Producto) => void;
}

export function ProductoTable({ data, total, isLoading, isError, onEdit }: ProductoTableProps) {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteMutation = useDeleteProducto();

  const filtered = data.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  async function handleConfirmDelete() {
    if (deleteId === null) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  }

  function formatPrice(value: string | number) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(Number(value));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar producto..." />
        <span className="text-xs text-zinc-500 whitespace-nowrap">{total} registros</span>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-800/60 text-zinc-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">ID</th>
              <th className="text-left px-4 py-3 font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold">Precio</th>
              <th className="text-left px-4 py-3 font-semibold">Stock</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="text-right px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-zinc-800">
                  <td colSpan={6}><SkeletonRow /></td>
                </tr>
              ))}
            {isError && (
              <tr><td colSpan={6}><ErrorState /></td></tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr><td colSpan={6}><EmptyState message="No se encontraron productos" /></td></tr>
            )}
            {!isLoading && !isError && filtered.map((prod) => (
              <tr
                key={prod.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{prod.id}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-zinc-100 font-medium">{prod.nombre}</p>
                    {prod.descripcion && (
                      <p className="text-zinc-500 text-xs truncate max-w-xs">{prod.descripcion}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-orange-400 font-semibold font-mono">
                  {formatPrice(prod.precio_base)}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-sm ${prod.stock_cantidad === 0 ? "text-red-400" : "text-zinc-300"}`}>
                    {prod.stock_cantidad}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {prod.disponible ? (
                      <Badge variant="success">Disponible</Badge>
                    ) : (
                      <Badge variant="danger">No disponible</Badge>
                    )}
                    {prod.deleted_at && <Badge variant="danger">Eliminado</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => onEdit(prod)} className="text-xs px-3 py-1">
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setDeleteId(prod.id)}
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
        message="¿Estás seguro que querés eliminar este producto? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
