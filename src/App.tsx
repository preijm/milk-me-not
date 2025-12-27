
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { Capacitor } from "@capacitor/core";
import NativeSplashScreen from "./components/NativeSplashScreen";
import Home from "./pages/Home";
import Results from "./pages/Results";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AccountSecurity from "./pages/AccountSecurity";
import AccountNotifications from "./pages/AccountNotifications";
import AccountCountry from "./pages/AccountCountry";
import AccountProfile from "./pages/AccountProfile";
import ProductDetails from "./pages/ProductDetails";
import ResetPassword from "./pages/ResetPassword";
import Feed from "./pages/Feed";
import MobileApp from "./pages/MobileApp";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";
import DesignSystem from "./pages/DesignSystem";
import InstallGuide from "./pages/InstallGuide";

const isNativeApp = Capacitor.isNativePlatform();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(isNativeApp);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            {showSplash && (
              <NativeSplashScreen onComplete={() => setShowSplash(false)} />
            )}
            <BrowserRouter>
              <ScrollToTop />
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
              <Route path="/account/country" element={
                <ProtectedRoute>
                  <AccountCountry />
                </ProtectedRoute>
              } />
              <Route path="/account/profile" element={
                <ProtectedRoute>
                  <AccountProfile />
                </ProtectedRoute>
              } />
              <Route path="/feed" element={<Feed />} />
              <Route path="/mobile-app" element={isNativeApp ? <Navigate to="/" replace /> : <MobileApp />} />
              <Route path="/install-guide" element={isNativeApp ? <Navigate to="/" replace /> : <InstallGuide />} />
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
              <Route path="/design-system" element={<DesignSystem />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
