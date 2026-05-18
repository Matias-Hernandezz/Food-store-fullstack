import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin/categorias", label: "Categorías", icon: "🏷️" },
  { to: "/admin/productos", label: "Productos", icon: "🍔" },
  { to: "/admin/ingredientes", label: "Ingredientes", icon: "🧅" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-zinc-800">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Panel Admin</p>
          <h2 className="text-lg font-bold text-zinc-100 mt-0.5">Gestión</h2>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">v1.0.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
