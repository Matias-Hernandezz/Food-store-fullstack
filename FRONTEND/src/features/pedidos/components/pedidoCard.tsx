// features/pedidos/components/PedidoCard.tsx
import type { Pedido } from "../api/pedidosApi";
import { ESTADO_LABEL, ESTADO_COLOR, ESTADOS_FSM } from "../hooks/usePedidos";

interface Props {
    pedido: Pedido;
    onAvanzar: (id: number, estado: string) => void;
    loading: boolean;
}

export function PedidoCard({ pedido, onAvanzar, loading }: Props) {
    const siguientes = ESTADOS_FSM[pedido.estado_codigo] ?? [];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <span className="text-xs text-gray-400 font-mono">#{pedido.id}</span>
                    <p className="text-sm font-semibold text-gray-800">
                        Usuario #{pedido.usuario_id}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(pedido.created_at).toLocaleString("es-AR")}
                    </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_COLOR[pedido.estado_codigo]}`}>
                    {ESTADO_LABEL[pedido.estado_codigo]}
                </span>
            </div>

            {/* Detalles */}
            <div className="border-t border-gray-50 pt-3 mb-3 space-y-1">
                {pedido.detalles.map((d) => (
                    <div key={d.producto_id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                            {d.cantidad}x {d.nombre_snapshot}
                        </span>
                        <span className="text-gray-800 font-medium">
                            ${Number(d.subtotal).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mb-4">
                <span>Total</span>
                <span className="text-[#c8722a]">${Number(pedido.total).toFixed(2)}</span>
            </div>

            {/* Botones FSM */}
            {siguientes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {siguientes.map((estado) => (
                        <button
                            key={estado}
                            disabled={loading}
                            onClick={() => onAvanzar(pedido.id, estado)}
                            className={`flex-1 text-xs font-bold py-2 px-3 rounded-xl transition-all
                ${estado === "CANCELADO"
                                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                    : "bg-[#c8722a] text-white hover:bg-[#a85e1f]"
                                } disabled:opacity-50`}
                        >
                            → {ESTADO_LABEL[estado]}
                        </button>
                    ))}
                </div>
            )}

            {siguientes.length === 0 && (
                <p className="text-xs text-center text-gray-400 italic">Estado terminal</p>
            )}
        </div>
    );
}