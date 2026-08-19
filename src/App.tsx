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
const NativeSplashScreen = lazy(() => import("./components/NativeSplashScreen"));
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
const RateDeepLink = lazy(() => import("./pages/RateDeepLink"));

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
                <Route path="/feed" element={<Feed />} />
                <Route path="/results" element={<Results />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/mobile-app" element={<MobileApp />} />
                <Route path="/install-guide" element={<InstallGuide />} />
                <Route path="/design-system" element={<DesignSystem />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                {/* Shelf-QR deep link: skips the pitch, lands on the rating flow. */}
                <Route path="/rate/:productId" element={<RateDeepLink />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/add" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                {/* Settings used to be split across four sub-pages behind their
                    own sidebar, duplicating what /account already showed. They
                    redirect rather than 404 so older links still land. */}
                <Route path="/account/*" element={<Navigate to="/account" replace />} />
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
