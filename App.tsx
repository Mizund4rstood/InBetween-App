import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "@/stores/appStore";
import { useTimeOnDeviceStore } from "@/stores/timeOnDeviceStore";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { MicroWinProvider } from "@/components/MicroWin";
import { Loader2 } from "lucide-react";

// Eagerly loaded (needed before auth)
import Auth from "@/pages/Auth";
import Onboarding from "@/components/Onboarding";

// Lazy-loaded routes
const Home = lazy(() => import("@/pages/Home"));
const Log = lazy(() => import("@/pages/Log"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Grounding = lazy(() => import("@/pages/Grounding"));
const Settings = lazy(() => import("@/pages/Settings"));
const Research = lazy(() => import("@/pages/Research"));
const GratitudeWall = lazy(() => import("@/pages/GratitudeWall"));
const WhyVault = lazy(() => import("@/pages/WhyVault"));
const Premium = lazy(() => import("@/pages/Premium"));
const WeeklySummary = lazy(() => import("@/pages/WeeklySummary"));
const Reflect = lazy(() => import("@/pages/Reflect"));
const Rewire = lazy(() => import("@/pages/Rewire"));
const CompassHome = lazy(() => import("@/pages/compass/CompassHome"));
const LogTrigger = lazy(() => import("@/pages/compass/LogTrigger"));
const TriggerHistory = lazy(() => import("@/pages/compass/TriggerHistory"));
const Patterns = lazy(() => import("@/pages/compass/Patterns"));
const PauseTraining = lazy(() => import("@/pages/compass/PauseTraining"));
const BehaviorLoop = lazy(() => import("@/pages/compass/BehaviorLoop"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Restlessness = lazy(() => import("@/pages/Restlessness"));
const HowTo = lazy(() => import("@/pages/HowTo"));
const PauseFlow = lazy(() => import("@/pages/PauseFlow"));
const WhyIBuiltThis = lazy(() => import("@/pages/WhyIBuiltThis"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Community = lazy(() => import("@/pages/Community"));
const Music = lazy(() => import("@/pages/Music"));
const Demo = lazy(() => import("@/pages/Demo"));

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const hasOnboarded = useAppStore(s => s.hasOnboarded);
  const activeMode = useAppStore(s => s.activeMode);
  const { startSession, endSession } = useTimeOnDeviceStore();

  // Track time on device
  useEffect(() => {
    startSession();
    const handleVisChange = () => {
      if (document.hidden) endSession();
      else startSession();
    };
    document.addEventListener('visibilitychange', handleVisChange);
    window.addEventListener('beforeunload', endSession);
    return () => {
      endSession();
      document.removeEventListener('visibilitychange', handleVisChange);
      window.removeEventListener('beforeunload', endSession);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  // Allow /reset-password even when not logged in
  const isResetPage = window.location.pathname === '/reset-password' || window.location.hash.includes('type=recovery');

  const isDemoPage = window.location.pathname === '/demo';

  if (!user && !isResetPage && !isDemoPage) {
    return <Auth />;
  }

  if (isDemoPage && !import.meta.env.PROD) {
    return (
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>}>
          <Routes>
            <Route path="/demo" element={<Demo />} />
            <Route path="*" element={<Navigate to="/demo" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  }

  if (isResetPage && !hasOnboarded) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (!hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>}>
          <Routes>
            {/* Ground mode */}
            <Route path="/" element={activeMode === 'compass' ? <Navigate to="/compass" replace /> : <Home />} />
            <Route path="/log" element={<Log />} />
            <Route path="/grounding" element={<Grounding />} />
            <Route path="/summary" element={<WeeklySummary />} />
            <Route path="/reflect" element={<Reflect />} />
            <Route path="/rewire" element={<Rewire />} />
            {/* Hidden but accessible via direct URL */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/wall" element={<GratitudeWall />} />
            <Route path="/vault" element={<WhyVault />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/research" element={<Research />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/restlessness" element={<Restlessness />} />
            <Route path="/how-to" element={<HowTo />} />
            <Route path="/pause" element={<PauseFlow />} />
            <Route path="/why" element={<WhyIBuiltThis />} />
            <Route path="/community" element={<Community />} />
            <Route path="/music" element={<Music />} />

            {/* Compass mode */}
            <Route path="/compass" element={<CompassHome />} />
            <Route path="/compass/log" element={<LogTrigger />} />
            <Route path="/compass/history" element={<TriggerHistory />} />
            <Route path="/compass/patterns" element={<Patterns />} />
            <Route path="/compass/pause" element={<PauseTraining />} />
            <Route path="/compass/loop" element={<BehaviorLoop />} />

            {/* Shared */}
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <MicroWinProvider />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
