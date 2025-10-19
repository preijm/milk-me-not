
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import Home from "./pages/Home";
import Results from "./pages/Results";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MyResults from "./pages/MyResults";
import Account from "./pages/Account";
import AccountSecurity from "./pages/AccountSecurity";
import AccountNotifications from "./pages/AccountNotifications";
import ProductDetails from "./pages/ProductDetails";
import ResetPassword from "./pages/ResetPassword";
import Feed from "./pages/Feed";
import Wishlist from "./pages/Wishlist";
import MobileApp from "./pages/MobileApp";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Navigate to="/results" replace />} />
              <Route path="/results" element={<Results />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/add" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/add-product" element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              } />
              <Route path="/my-results" element={
                <ProtectedRoute>
                  <MyResults />
                </ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />  
                </ProtectedRoute>
              } />
              <Route path="/account/security" element={
                <ProtectedRoute>
                  <AccountSecurity />
                </ProtectedRoute>
              } />
              <Route path="/account/notifications" element={
                <ProtectedRoute>
                  <AccountNotifications />
                </ProtectedRoute>
              } />
              <Route path="/feed" element={<Feed />} />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
              <Route path="/mobile-app" element={<MobileApp />} />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
