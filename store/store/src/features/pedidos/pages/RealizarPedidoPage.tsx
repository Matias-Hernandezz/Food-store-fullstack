
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../carrito/store/carritoStore";
import { useFormasPago, useCrearPedido } from "../hooks/usePedidos";
import { useAuth } from "../../auth/context/AuthContext";


export function RealizarPedidoPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, total, limpiar } = useCarrito();
    const { data: formasPago } = useFormasPago();
    const { mutate: crearPedido, isPending, error } = useCrearPedido();
    const [formaPago, setFormaPago] = useState("");
    const [notas, setNotas] = useState("");

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5ede6" }}>
                <div className="text-center px-6">
                    <p className="text-5xl mb-4">🔐</p>
                    <h2 className="text-xl font-bold text-[#2d1e0f] mb-2">Necesitás iniciar sesión</h2>
                    <p className="text-gray-500 text-sm mb-6">Para realizar tu pedido primero iniciá sesión.</p>
                    <button onClick={() => navigate("/login", { state: { from: "/realizar-pedido" } })}
                        className="bg-[#c8722a] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#a85e1f] transition-colors">
                        Iniciar sesión
                    </button>
                </div>
            </div>
        );
    }

    const handleConfirmar = () => {
        if (!formaPago) return;
        crearPedido(
            {
                forma_pago_codigo: formaPago,
                notas: notas || undefined,
                items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
            },
            {
                onSuccess: () => {
                    limpiar();
                    navigate("/pedidos");
                },
            }
        );
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f5ede6" }}>
            <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
                <h1 className="font-bold text-[#2d1e0f]">Confirmar Pedido</h1>
            </div>

            <div className="px-5 py-6 max-w-lg mx-auto space-y-4">
                {/* Resumen */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-[#2d1e0f] mb-3">Tu pedido</h3>
                    {items.map((i) => (
                        <div key={i.producto_id} className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">{i.cantidad}x {i.nombre}</span>
                            <span className="font-medium">${(i.precio * i.cantidad).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-[#c8722a]">${total().toFixed(2)}</span>
                    </div>
                </div>

                {/* Forma de pago */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-[#2d1e0f] mb-3">Forma de pago</h3>
                    <div className="space-y-2">
                        {(formasPago ?? []).map((fp) => (
                            <label key={fp.codigo}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${formaPago === fp.codigo ? "border-[#c8722a] bg-[#c8722a]/5" : "border-gray-100 hover:border-gray-200"}`}>
                                <input type="radio" name="forma_pago" value={fp.codigo}
                                    checked={formaPago === fp.codigo} onChange={() => setFormaPago(fp.codigo)}
                                    className="accent-[#c8722a]" />
                                <span className="text-sm font-medium text-gray-700">{fp.descripcion}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Notas */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-[#2d1e0f] mb-3">Notas (opcional)</h3>
                    <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                        placeholder="Instrucciones especiales, alergias..."
                        className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#c8722a] resize-none"
                        rows={3} />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        ⚠️ {(error as Error).message}
                    </div>
                )}

                <button onClick={handleConfirmar}
                    disabled={!formaPago || isPending || items.length === 0}
                    className="w-full bg-[#c8722a] hover:bg-[#a85e1f] disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-colors
                     shadow-lg shadow-[#c8722a]/20">
                    {isPending ? "Procesando..." : "Confirmar Pedido"}
                </button>
            </div>
        </div>
    );
}