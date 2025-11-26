import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/DashboardFieldService";
import Manufacturing from "./pages/Manufacturing";
import Testing from "./pages/Testing";
import Field from "./pages/Field";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";
import DashboardManufacturing from "./pages/DashboardManufacturing";
import DashboardTesting from "./pages/DashboardTesting";
import DashboardSales from "./pages/DashboardSales";
import Chat from "./pages/Chat";
import Recent from "./pages/Recent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/fieldservice" replace />} />
          <Route path="/dashboard/fieldservice" element={<Dashboard />} />
          <Route path="/dashboard/manufacturing" element={<DashboardManufacturing />} />
          <Route path="/dashboard/testing" element={<DashboardTesting />} />
          <Route path="/dashboard/sales" element={<DashboardSales />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/manufacturing" element={<Manufacturing />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/field" element={<Field />} />
          <Route path="/sales" element={<Sales />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
