import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AdminLayout from "@/components/AdminLayout";
import SurfacesPage from "@/pages/admin/SurfacesPage";
import PlantesPage from "@/pages/admin/PlantesPage";
import VannesPage from "@/pages/admin/VannesPage";
import TypesPlantePage from "@/pages/admin/TypesPlantePage";
import ClientsPage from "@/pages/admin/ClientsPage";
import SolsPage from "@/pages/admin/SolsPage";
import ClimatsPage from "@/pages/admin/ClimatsPage";
import WizardPage from "@/pages/admin/WizardPage";
import TravailPage from "@/pages/admin/TravailPage";
import ClientDetailPage from "@/pages/admin/ClientDetailPage";
import SurfaceDetailPage from "@/pages/admin/SurfaceDetailPage";
import SubscriptionsPage from "@/pages/admin/SubscriptionsPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/admin/travail" replace />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="surfaces" element={<SurfacesPage />} />
                <Route path="plantes" element={<PlantesPage />} />
                <Route path="vannes" element={<VannesPage />} />
                <Route path="types-plante" element={<TypesPlantePage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="sols" element={<SolsPage />} />
                <Route path="climats" element={<ClimatsPage />} />
                <Route path="wizard" element={<WizardPage />} />
                <Route path="travail" element={<TravailPage />} />
                <Route path="travail/client/:clientId" element={<ClientDetailPage />} />
                <Route path="travail/surface/:surfaceId" element={<SurfaceDetailPage />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
