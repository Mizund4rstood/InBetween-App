import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "./toaster";
import { Toaster as Sonner } from "./sonner";
import { TooltipProvider } from "./tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "./appStore";
import { useTimeOnDeviceStore } from "./timeOnDeviceStore";
import { AuthProvider, useAuth } from "./useAuth";
import Layout from "./Layout";
import { MicroWinProvider } from "./MicroWin";
import { Loader2 } from "lucide-react";

// Eagerly loaded (needed before auth)
import Auth from "./Auth";
import Onboarding from "./Onboarding";

// Lazy-loaded routes
const Home = lazy(() => import("./Home"));
const Log = lazy(() => import("./Log"));
const Analytics = lazy(() => import("./Analytics"));
const Grounding = lazy(() => import("./Grounding"));
const Settings = lazy(() => import("./Settings"));
const Research = lazy(() => import("./Research"));
const GratitudeWall = lazy(() => import("./GratitudeWall"));
const WhyVault = lazy(() => import("./WhyVault"));
const Premium = lazy(() => import("./Premium"));
const WeeklySummary = lazy(() => import("./WeeklySummary"));
const Reflect = lazy(() => import("./Reflect"));
const Rewire = lazy(() => import("./Rewire"));
const CompassHome = lazy(() => import("./CompassHome"));
const LogTrigger = lazy(() => import("./LogTrigger"));
const TriggerHistory = lazy(() => import("./TriggerHistory"));
const Patterns = lazy(() => import("./Patterns"));
const PauseTraining = lazy(() => import("./PauseTraining"));
const BehaviorLoop = lazy(() => import("./BehaviorLoop"));
const ResetPassword = lazy(() => import("./ResetPassword"));
const Restlessness = lazy(() => import("./Restlessness"));
const HowTo = lazy(() => import("./HowTo"));
const PauseFlow = lazy(() => import("./PauseFlow"));
const WhyIBuiltThis = lazy(() => import("./WhyIBuiltThis"));
const NotFound = lazy(() => import("./NotFound"));
const Community = lazy(() => import("./Community"));
const Music = lazy(() => import("./Music"));
const Demo = lazy(() => import("./Demo"));

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
