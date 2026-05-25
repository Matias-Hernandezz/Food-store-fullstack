import { useNavigate } from "react-router-dom";
import { useCarrito } from "../store/carritoStore";

export function CarritoPage() {
    const navigate = useNavigate();
    const { items, quitar, cambiarCantidad, total } = useCarrito();

    const subtotal = total();
    const envio = subtotal > 0 ? 4.5 : 0;
    const totalFinal = subtotal + envio;

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f5ede6" }}>
            <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
                <h1 className="text-xl font-black text-[#c8722a]" style={{ fontFamily: "Georgia, serif" }}>
                    Sahara
                </h1>
                {items.length > 0 && (
                    <span className="ml-auto bg-[#c8722a] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {items.length}
                    </span>
                )}
            </div>

            <div className="px-5 py-6 max-w-lg mx-auto">
                <h2 className="text-3xl font-black text-[#2d1e0f] mb-1">Your Basket</h2>
                <p className="text-gray-500 text-sm mb-6">
                    {items.length} curated items from the Sahara collection.
                </p>

                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">🛍️</p>
                        <p className="text-gray-500 mb-6">Tu canasta está vacía</p>
                        <button onClick={() => navigate("/")}
                            className="bg-[#c8722a] text-white font-bold px-6 py-3 rounded-xl">
                            Ver menú
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={item.producto_id} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                            {item.imagen_url ? (
                                                <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <p className="font-bold text-[#2d1e0f]">{item.nombre}</p>
                                                <p className="text-[#c8722a] font-bold">
                                                    ${(item.precio * item.cantidad).toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">${item.precio.toFixed(2)} c/u</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-3 border border-gray-200 rounded-full px-3 py-1">
                                                    <button onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                                                        className="text-gray-600 font-bold w-5 text-center">−</button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                                                    <button onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                                                        className="text-gray-600 font-bold w-5 text-center">+</button>
                                                </div>
                                                <button onClick={() => quitar(item.producto_id)}
                                                    className="text-gray-300 hover:text-red-400 transition-colors ml-auto">
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mb-3">
                                <span>Delivery Fee</span><span>${envio.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-black text-[#2d1e0f] text-lg border-t border-gray-100 pt-3">
                                <span>Total</span>
                                <span className="text-[#c8722a]">${totalFinal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button onClick={() => navigate("/realizar-pedido")}
                            className="w-full bg-[#c8722a] hover:bg-[#a85e1f] text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-colors shadow-lg shadow-[#c8722a]/20">
                            Continuar al Pago
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-2">Secure checkout powered by Sahara Pay</p>
                    </>
                )}
            </div>
        </div>
    );
}