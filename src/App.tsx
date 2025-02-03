import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import About from "./pages/About";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => {
  const [results, setResults] = useState([
    {
      id: 1,
      brand: "Happy Cows",
      type: "Whole Milk",
      rating: 4,
      notes: "Creamy and rich, with a smooth finish",
      date: "2024-02-20",
    },
    {
      id: 2,
      brand: "Green Meadows",
      type: "2% Reduced Fat",
      rating: 3,
      notes: "Light and refreshing, but lacking depth",
      date: "2024-02-19",
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard results={results} />} />
            <Route path="/results" element={<Results results={results} />} />
            <Route path="/add" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;