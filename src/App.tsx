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
                <main>
                <Suspense fallback={<PageFallback />}>
                <Routes>
                <Route path="/" element={<Home />} />
...
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
                </main>
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
