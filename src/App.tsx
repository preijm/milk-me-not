
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MyResults from "./pages/MyResults";
import Account from "./pages/Account";
import ProductDetails from "./pages/ProductDetails";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Navigate to="/results" replace />} />
            <Route path="/results" element={<Results />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/add" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<Auth />} />
            <Route path="/my-results" element={<MyResults />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
