// features/usuarios/pages/UsuariosPage.tsx
import { useState } from "react";
import { useUsuarios, useAsignarRol, useQuitarRol, useSoftDeleteUsuario } from "../hooks/useUsuarios";

const ROLES = ["ADMIN", "STOCK", "PEDIDOS", "CLIENT"];

const ROL_COLOR: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  STOCK: "bg-blue-100 text-blue-700",
  PEDIDOS: "bg-purple-100 text-purple-700",
  CLIENT: "bg-green-100 text-green-700",
};

export function UsuariosPage() {
  const { data: usuarios, isLoading } = useUsuarios();
  const { mutate: asignar } = useAsignarRol();
  const { mutate: quitar } = useQuitarRol();
  const { mutate: eliminar } = useSoftDeleteUsuario();
  const [confirmarId, setConfirmarId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#c8722a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activos = usuarios?.filter((u) => !u.deleted_at) ?? [];
  const eliminados = usuarios?.filter((u) => u.deleted_at) ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 text-sm mt-1">{activos.length} usuarios activos</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Usuario</th>
              <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Email</th>
              <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Roles</th>
              <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activos.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-800 text-sm">{u.nombre} {u.apellido}</p>
                  <p className="text-xs text-gray-400">#{u.id}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        onClick={() => quitar({ id: u.id, rol: r })}
                        title="Click para quitar"
                        className={`text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer hover:opacity-70 transition-opacity ${ROL_COLOR[r] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {r} ✕
                      </span>
                    ))}
                    {/* Selector para agregar rol */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          asignar({ id: u.id, rol: e.target.value });
                          e.target.value = "";
                        }
                      }}
                      className="text-xs border border-dashed border-gray-300 rounded-full px-2 py-0.5 text-gray-400 cursor-pointer focus:outline-none"
                    >
                      <option value="">+ rol</option>
                      {ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {confirmarId === u.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { eliminar(u.id); setConfirmarId(null); }}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmarId(null)}
                        className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmarId(u.id)}
                      className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {activos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">👥</p>
            <p>No hay usuarios activos</p>
          </div>
        )}
      </div>

      {/* Eliminados */}
      {eliminados.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            Eliminados ({eliminados.length})
          </h2>
          <div className="space-y-2">
            {eliminados.map((u) => (
              <div key={u.id} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 opacity-60">
                <span className="text-sm text-gray-500">{u.nombre} {u.apellido} — {u.email}</span>
                <span className="text-xs text-red-400">Eliminado</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}