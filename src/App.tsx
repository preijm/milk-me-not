import { useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { VersionProvider } from "@/contexts/VersionContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { VersionCheck } from "@/components/version/VersionCheck";
import { isNativeApp } from "@/lib/platformDetection";
import NativeSplashScreen from "./components/NativeSplashScreen";
const Home = lazy(() => import("./pages/Home"));
import { Loader } from "lucide-react";

// Lazy-loaded routes for code splitting
const Results = lazy(() => import("./pages/Results"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const AccountSecurity = lazy(() => import("./pages/AccountSecurity"));
const AccountNotifications = lazy(() => import("./pages/AccountNotifications"));
const AccountCountry = lazy(() => import("./pages/AccountCountry"));
const AccountProfile = lazy(() => import("./pages/AccountProfile"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Feed = lazy(() => import("./pages/Feed"));
const MobileApp = lazy(() => import("./pages/MobileApp"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));
const InstallGuide = lazy(() => import("./pages/InstallGuide"));
const FAQ = lazy(() => import("./pages/FAQ"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader className="h-8 w-8 animate-spin text-primary" />
  </div>
);
const isNative = isNativeApp();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(isNative);
  
  // Block rendering of the app entirely until splash is done to prevent layout flash
  if (showSplash) {
    return <NativeSplashScreen onComplete={() => setShowSplash(false)} />;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <VersionProvider>
            <TooltipProvider>
              <BrowserRouter>
                <ScrollToTop />
                <VersionCheck />
                <Suspense fallback={<PageFallback />}>
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
              <Route path="/mobile-app" element={isNative ? <Navigate to="/" replace /> : <MobileApp />} />
              <Route path="/install-guide" element={isNative ? <Navigate to="/" replace /> : <InstallGuide />} />
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
              <Route path="/faq" element={<FAQ />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <Toaster />
            </BrowserRouter>
          </TooltipProvider>
          </VersionProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
