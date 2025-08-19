
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BookRide from "./pages/BookRide";
import RideHistory from "./pages/RideHistory";
import RideTracking from "./pages/RideTracking";
import PrivateDrivers from "./pages/PrivateDrivers";
import OfferRide from "./pages/OfferRide";
import RequestRide from "./pages/RequestRide";
import RideConfirmation from "./pages/RideConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book-ride" element={<BookRide />} />
            <Route path="/ride-history" element={<RideHistory />} />
            <Route path="/ride-tracking" element={<RideTracking />} />
            <Route path="/private-drivers" element={<PrivateDrivers />} />
            <Route path="/offer-ride" element={<OfferRide />} />
            <Route path="/request-ride" element={<RequestRide />} />
            <Route path="/ride-confirmation" element={<RideConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
