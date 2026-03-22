import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Trilha from "@/pages/Trilha";
import Simulador from "@/pages/Simulador";
import Historico from "@/pages/Historico";
import Mercado from "@/pages/Mercado";
import Carteira from "@/pages/Carteira";
import Chatbot from "@/pages/Chatbot";
import Ranking from "@/pages/Ranking";
import Perfil from "@/pages/Perfil";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trilha" element={<Trilha />} />
                <Route path="/simulador" element={<Simulador />} />
                <Route path="/mercado" element={<Mercado />} />
                <Route path="/carteira" element={<Carteira />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/historico" element={<Historico />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/perfil" element={<Perfil />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
