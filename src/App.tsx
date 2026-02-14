import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import SurfacesPage from "@/pages/admin/SurfacesPage";
import PlantesPage from "@/pages/admin/PlantesPage";
import VannesPage from "@/pages/admin/VannesPage";
import TypesPlantePage from "@/pages/admin/TypesPlantePage";
import ClientsPage from "@/pages/admin/ClientsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/surfaces" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="surfaces" element={<SurfacesPage />} />
            <Route path="plantes" element={<PlantesPage />} />
            <Route path="vannes" element={<VannesPage />} />
            <Route path="types-plante" element={<TypesPlantePage />} />
            <Route path="clients" element={<ClientsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
