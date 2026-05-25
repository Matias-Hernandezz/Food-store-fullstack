import { apiFetch } from "../../../shared/api/client";
import type { PedidoCreate, Pedido, PedidoList, FormaPago } from "../../../shared/types";

export const pedidosApi = {
    crear: (data: PedidoCreate) =>
        apiFetch<Pedido>("/api/v1/pedidos/", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getMisPedidos: () =>
        apiFetch<PedidoList>("/api/v1/pedidos/?limit=50"),

    getFormasPago: () =>
        apiFetch<FormaPago[]>("/api/v1/pedidos/formas-pago"),
};