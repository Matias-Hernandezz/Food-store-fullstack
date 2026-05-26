// src/shared/types/index.ts

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginInput {
    email: string;
    password: string;
}

export interface UsuarioCreate {
    nombre: string;
    apellido: string;
    email: string;
    celular?: string;
    password: string;
}

export interface UsuarioRead {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    celular: string | null;
    roles: string[];
    deleted_at: string | null;
}

// ── Catálogo ──────────────────────────────────────────────────────────────────
export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
    imagen_url: string | null;
    parent_id: number | null;
}

export interface Ingrediente {
    id: number;
    nombre: string;
    descripcion?: string;
    categoria_id?: number;
    es_alergeno: boolean;
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagenes_url: string | null;   // ← plural, no imagen_url
    disponible: boolean;
    stock_cantidad: number;
    categoria_ids: number[];
    categoria?: Categoria;  // ← array de ids, no objeto
    ingrediente_ids?: number[];
}

export interface ProductoList {
    data: Producto[];
    total: number;
}

// ── Carrito ───────────────────────────────────────────────────────────────────
export interface ItemCarritoInput {
    producto_id: number;
    cantidad: number;
}

// ── Pedidos ───────────────────────────────────────────────────────────────────
export interface PedidoCreate {
    forma_pago_codigo: string;
    notas?: string;
    items: ItemCarritoInput[];
}

export interface DetallePedido {
    producto_id: number;
    cantidad: number;
    nombre_snapshot: string;
    precio_snapshot: number | string; // Decimal de Pydantic llega como string
    subtotal: number | string;
}

export interface Pedido {
    id: number;
    estado_codigo: string;
    forma_pago_codigo: string;
    subtotal: number | string;
    descuento: number | string;
    costo_envio: number | string;
    total: number | string;
    notas: string | null;
    created_at: string;
    detalles: DetallePedido[];
}

export interface PedidoList {
    data: Pedido[];
    total: number;
}

export interface FormaPago {
    codigo: string;
    descripcion: string;
    habilitado: boolean;
}

// ── Helper: convierte Decimal de Python a number ──────────────────────────────
export const toNumber = (val: number | string): number => Number(val);