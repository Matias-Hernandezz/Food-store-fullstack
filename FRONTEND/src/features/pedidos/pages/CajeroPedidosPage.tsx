// features/pedidos/pages/CajeroPedidosPage.tsx
import { useState } from "react";
import { usePedidos, useAvanzarEstado, ESTADO_LABEL, ESTADO_COLOR } from "../hooks/usePedidos";
import { PedidoCard } from "../components/pedidoCard";

const FILTROS = ["TODOS", "PENDIENTE", "CONFIRMADO", "EN_PREP", "EN_CAMINO", "ENTREGADO", "CANCELADO"];

export function CajeroPedidosPage() {
    const [filtro, setFiltro] = useState("TODOS");
    const { data, isLoading, error } = usePedidos();
    const { mutate: avanzar, isPending } = useAvanzarEstado();

    const pedidos = data?.data ?? [];
    const filtrados = filtro === "TODOS"
        ? pedidos
        : pedidos.filter((p) => p.estado_codigo === filtro);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#c8722a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                ⚠️ Error al cargar pedidos
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {data?.total ?? 0} pedidos en total • se actualiza cada 30s
                </p>
            </div>

            {/* Filtros por estado */}
            <div className="flex gap-2 flex-wrap mb-6">
                {FILTROS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-all
              ${filtro === f
                                ? "bg-[#c8722a] text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-[#c8722a]"
                            }`}
                    >
                        {f === "TODOS" ? "Todos" : ESTADO_LABEL[f]}
                        {f !== "TODOS" && (
                            <span className="ml-1 opacity-70">
                                ({pedidos.filter((p) => p.estado_codigo === f).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Grid de pedidos */}
            {filtrados.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📋</p>
                    <p>No hay pedidos en este estado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtrados.map((pedido) => (
                        <PedidoCard
                            key={pedido.id}
                            pedido={pedido}
                            loading={isPending}
                            onAvanzar={(id, estado) => avanzar({ id, estado })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}