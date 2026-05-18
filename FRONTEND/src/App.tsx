import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminLayout } from "./shared/components/AdminLayout";
import { CategoriasPage } from "./features/categoria/pages/CategoriasPage";
import { ProductosPage } from "./features/producto/pages/ProductosPage";
import { IngredientesPage } from "./features/ingrediente/pages/IngredientesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/categorias" replace />} />
          <Route
            path="/admin/*"
            element={
              <AdminLayout>
                <Routes>
                  <Route path="categorias" element={<CategoriasPage />} />
                  <Route path="productos" element={<ProductosPage />} />
                  <Route path="ingredientes" element={<IngredientesPage />} />
                  <Route path="*" element={<Navigate to="categorias" replace />} />
                </Routes>
              </AdminLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
