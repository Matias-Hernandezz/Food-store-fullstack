import { useState, Fragment } from "react";
import { Button, Badge, ConfirmDialog, SkeletonRow, ErrorState, EmptyState, SearchInput } from "../../../shared/components/ui";
import { useDeleteCategoria } from "../hooks/useCategoria";
import type { Categoria } from "../../../shared/types";
 
interface CategoriaTableProps {
  data: Categoria[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onEdit: (c: Categoria) => void;
}
 
export function CategoriaTable({ data, total, isLoading, isError, onEdit }: CategoriaTableProps) {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const deleteMutation = useDeleteCategoria();
 
  const padres = data.filter((c) => c.parent_id === null);
  const hijas = data.filter((c) => c.parent_id !== null);
 
  const hayBusqueda = search.trim().length > 0;
  const filtradas = hayBusqueda
    ? data.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()))
    : [];
 
  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
 
  function getHijas(parentId: number) {
    return hijas.filter((c) => c.parent_id === parentId);
  }
 
  async function handleConfirmDelete() {
    if (deleteId === null) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  }
 
  const AccionesCell = ({ cat }: { cat: Categoria }) => (
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" onClick={() => onEdit(cat)} className="text-xs px-3 py-1">
        Editar
      </Button>
      <Button variant="danger" onClick={() => setDeleteId(cat.id)} className="text-xs px-3 py-1">
        Eliminar
      </Button>
    </div>
  );
 
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar categoría..." />
        <span className="text-xs text-zinc-500 whitespace-nowrap">{total} registros</span>
      </div>
 
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-800/60 text-zinc-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">ID</th>
              <th className="text-left px-4 py-3 font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold">Descripción</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
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
 
            {!isLoading && !isError && data.length === 0 && (
              <tr><td colSpan={5}><EmptyState message="No se encontraron categorías" /></td></tr>
            )}
 
            {/* Vista búsqueda — plana */}
            {!isLoading && !isError && hayBusqueda && (
              filtradas.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message="Sin resultados" /></td></tr>
              ) : (
                filtradas.map((cat) => (
                  <tr key={cat.id} className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{cat.id}</td>
                    <td className="px-4 py-3 text-zinc-100 font-medium">
                      {cat.parent_id !== null && <span className="text-zinc-600 mr-2">↳</span>}
                      {cat.nombre}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">
                      {cat.descripcion ?? <span className="text-zinc-600 italic">sin descripción</span>}
                    </td>
                    <td className="px-4 py-3">
                      {cat.deleted_at ? <Badge variant="danger">Inactiva</Badge> : <Badge variant="success">Activa</Badge>}
                    </td>
                    <td className="px-4 py-3"><AccionesCell cat={cat} /></td>
                  </tr>
                ))
              )
            )}
 
            {/* Vista árbol — sin búsqueda */}
            {!isLoading && !isError && !hayBusqueda && padres.map((padre) => {
              const subcats = getHijas(padre.id);
              const isOpen = expanded.has(padre.id);
              return (
                <Fragment key={padre.id}>
                  <tr className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{padre.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {subcats.length > 0 ? (
                          <button
                            onClick={() => toggleExpand(padre.id)}
                            className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-all cursor-pointer text-xs"
                          >
                            {isOpen ? "▼" : "▶"}
                          </button>
                        ) : (
                          <span className="w-5 h-5" />
                        )}
                        <span className="text-zinc-100 font-semibold">{padre.nombre}</span>
                        {subcats.length > 0 && (
                          <span className="text-xs text-zinc-500">({subcats.length})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">
                      {padre.descripcion ?? <span className="text-zinc-600 italic">sin descripción</span>}
                    </td>
                    <td className="px-4 py-3">
                      {padre.deleted_at ? <Badge variant="danger">Inactiva</Badge> : <Badge variant="success">Activa</Badge>}
                    </td>
                    <td className="px-4 py-3"><AccionesCell cat={padre} /></td>
                  </tr>
 
                  {isOpen && subcats.map((hija) => (
                    <tr key={hija.id} className="border-t border-zinc-800/50 bg-zinc-900/40 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-600 font-mono text-xs">{hija.id}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 pl-7">
                          <span className="text-zinc-600 text-xs">└</span>
                          <span className="text-zinc-300">{hija.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500 max-w-xs truncate text-xs">
                        {hija.descripcion ?? <span className="text-zinc-600 italic">sin descripción</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        {hija.deleted_at ? <Badge variant="danger">Inactiva</Badge> : <Badge variant="success">Activa</Badge>}
                      </td>
                      <td className="px-4 py-2.5"><AccionesCell cat={hija} /></td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
 
      <ConfirmDialog
        open={deleteId !== null}
        message="¿Estás seguro que querés eliminar esta categoría? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}