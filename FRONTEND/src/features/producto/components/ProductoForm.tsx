import { useState, useEffect } from "react";
import { Button, Input, Textarea, Modal } from "../../../shared/components/ui";
import { useCreateProducto, useUpdateProducto } from "../hooks/useProducto";
import type { Producto, ProductoCreate, Categoria, Ingrediente } from "../../../shared/types";

interface ProductoFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Producto | null;
  categorias: Categoria[];
  ingredientes: Ingrediente[];
}

const EMPTY: ProductoCreate = {
  nombre: "",
  descripcion: "",
  precio_base: 0,
  imagenes_url: "",
  stock_cantidad: 0,
  disponible: true,
  categoria_ids: [],
  ingrediente_ids: [],
};

export function ProductoForm({ open, onClose, editing, categorias, ingredientes }: ProductoFormProps) {
  const [form, setForm] = useState<ProductoCreate>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [busquedaIng, setBusquedaIng] = useState("");

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editing) {
      setForm({
        nombre: editing.nombre,
        descripcion: editing.descripcion ?? "",
        precio_base: parseFloat(editing.precio_base),
        imagenes_url: editing.imagenes_url ?? "",
        stock_cantidad: editing.stock_cantidad,
        disponible: editing.disponible,
        categoria_ids: editing.categoria_ids ?? [],
        ingrediente_ids: editing.ingrediente_ids ?? [],
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setBusquedaIng("");
  }, [editing, open]);

  function validate() {
    const e: typeof errors = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (form.nombre.length < 3) e.nombre = "Mínimo 3 caracteres";
    if (form.precio_base < 0) e.precio_base = "El precio no puede ser negativo";
    if ((form.stock_cantidad ?? 0) < 0) e.stock_cantidad = "El stock no puede ser negativo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const payload = {
      ...form,
      descripcion: form.descripcion || null,
      imagenes_url: form.imagenes_url || null,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setErrors({ nombre: msg });
    }
  }

  function toggleCategoria(id: number) {
    setForm((prev) => ({
      ...prev,
      categoria_ids: prev.categoria_ids.includes(id)
        ? prev.categoria_ids.filter((c) => c !== id)
        : [...prev.categoria_ids, id],
    }));
  }

  function toggleIngrediente(id: number) {
    setForm((prev) => ({
      ...prev,
      ingrediente_ids: (prev.ingrediente_ids ?? []).includes(id)
        ? (prev.ingrediente_ids ?? []).filter((i) => i !== id)
        : [...(prev.ingrediente_ids ?? []), id],
    }));
  }

  const ingredientesFiltrados = ingredientes.filter((ing) =>
    ing.nombre.toLowerCase().includes(busquedaIng.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar producto" : "Nuevo producto"}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">

        <Input
          label="Nombre *"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          error={errors.nombre}
          placeholder="Ej: Hamburguesa Doble Queso"
          maxLength={150}
        />

        <Textarea
          label="Descripción"
          value={form.descripcion ?? ""}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Descripción del producto"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Precio base *"
            type="number"
            min={0}
            step={0.01}
            value={form.precio_base === 0 ? "" : form.precio_base}
            onChange={(e) =>
              setForm({ ...form, precio_base: e.target.value === "" ? 0 : parseFloat(e.target.value) })
            }
            error={errors.precio_base}
            placeholder="0.00"
          />
          <Input
            label="Stock"
            type="number"
            min={0}
            value={form.stock_cantidad === 0 ? "" : form.stock_cantidad}
            onChange={(e) =>
              setForm({ ...form, stock_cantidad: e.target.value === "" ? 0 : parseInt(e.target.value) })
            }
            error={errors.stock_cantidad}
            placeholder="0"
          />
        </div>

        <Input
          label="URL de imagen"
          value={form.imagenes_url ?? ""}
          onChange={(e) => setForm({ ...form, imagenes_url: e.target.value })}
          placeholder="https://..."
        />

        {/* Toggle disponible */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, disponible: !form.disponible })}
            className={`
              relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer
              ${form.disponible ? "bg-emerald-500" : "bg-zinc-700"}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                transition-transform duration-200
                ${form.disponible ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </button>
          <span className="text-sm text-zinc-300">
            {form.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>

        {/* Categorías multiselect */}
        {categorias.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Categorías
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
              {categorias.map((cat) => {
                const selected = form.categoria_ids.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategoria(cat.id)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                      ${selected
                        ? "bg-orange-500 text-white"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                      }
                    `}
                  >
                    {cat.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ingredientes con buscador */}
        {ingredientes.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Ingredientes
              {(form.ingrediente_ids ?? []).length > 0 && (
                <span className="ml-2 normal-case text-orange-400 font-normal">
                  {(form.ingrediente_ids ?? []).length} seleccionado(s)
                </span>
              )}
            </label>

            {/* Buscador */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">🔍</span>
              <input
                type="text"
                value={busquedaIng}
                onChange={(e) => setBusquedaIng(e.target.value)}
                placeholder="Buscar ingrediente..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-orange-500 transition-all"
              />
            </div>

            {/* Pills filtrados */}
            <div className="flex flex-wrap gap-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700 max-h-36 overflow-y-auto">
              {ingredientesFiltrados.length === 0 ? (
                <p className="text-xs text-zinc-600 italic">Sin resultados para "{busquedaIng}"</p>
              ) : (
                ingredientesFiltrados.map((ing) => {
                  const selected = (form.ingrediente_ids ?? []).includes(ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => toggleIngrediente(ing.id)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                        ${selected
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                        }
                        ${ing.es_alergeno ? "ring-1 ring-amber-500/50" : ""}
                      `}
                    >
                      {ing.nombre}{ing.es_alergeno && " ⚠"}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={isPending} type="button">
            {editing ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}