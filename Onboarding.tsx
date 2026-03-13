import { useState, useEffect, useRef } from 'react';
import { useAppStore, VisualMode, FocusArea, UserIntent } from '@/stores/appStore';
import { ChevronRight, ChevronLeft, Target, Compass, Sparkles, Brain, Zap, Eye, LogOut } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { sounds } from '@/lib/sounds';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';

// ─── Step configs ───

const INTENT_OPTIONS: { value: UserIntent; emoji: string; label: string; desc: string }[] = [
  { value: 'build-awareness', emoji: '🪞', label: 'Build Awareness', desc: 'Understand my patterns and triggers' },
  { value: 'manage-urges', emoji: '🌊', label: 'Manage Urges', desc: 'Stay in control when things get intense' },
  { value: 'track-patterns', emoji: '📊', label: 'Track Patterns', desc: 'See my data and growth over time' },
  { value: 'stay-grounded', emoji: '🧘', label: 'Stay Grounded', desc: 'Daily tools to keep me level' },
  { value: 'all', emoji: '✨', label: 'All of the Above', desc: "I want the full toolkit" },
];

const FOCUS_OPTIONS: { value: FocusArea; emoji: string; label: string }[] = [
  { value: 'emotional-regulation', emoji: '🎭', label: 'Emotional Regulation' },
  { value: 'impulse-control', emoji: '⚡', label: 'Impulse Control' },
  { value: 'stress', emoji: '🌡️', label: 'Stress Management' },
  { value: 'self-awareness', emoji: '🔍', label: 'Self-Awareness' },
  { value: 'shame-resilience', emoji: '🛡️', label: 'Shame Resilience' },
  { value: 'identity', emoji: '🌱', label: 'Identity Growth' },
  { value: 'gratitude', emoji: '💛', label: 'Gratitude' },
  { value: 'restlessness', emoji: '🦎', label: 'Restlessness' },
];

const VISUAL_MODES: { value: VisualMode; icon: string; label: string; desc: string }[] = [
  { value: 'roots', icon: '🌿', label: 'Roots', desc: 'Strength grows underground' },
  { value: 'canopy', icon: '🌳', label: 'Canopy', desc: 'Growth you can see' },
  { value: 'compass', icon: '🧭', label: 'Compass', desc: 'Finding your direction' },
  { value: 'steel', icon: '⚙️', label: 'Steel', desc: 'Forged through the work' },
];

// Steps: 0=Welcome, 1=Philosophy, 2=Neuroscience, 3=Intent, 4=Focus Areas, 5=Visual Mode
const TOTAL_STEPS = 6;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const STEP_LABELS = ['Welcome', 'Philosophy', 'Neuroscience', 'Intent', 'Focus', 'Visual'];

interface OnboardingProps {
  demoMode?: boolean;
}

export default function Onboarding({ demoMode = false }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedIntent, setSelectedIntent] = useState<UserIntent | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<FocusArea[]>([]);
  const [selectedMode, setSelectedMode] = useState<VisualMode>('roots');

  const setOnboarded = useAppStore(s => s.setOnboarded);
  const setVisualMode = useAppStore(s => s.setVisualMode);
  const setFocusAreas = useAppStore(s => s.setFocusAreas);
  const setUserIntent = useAppStore(s => s.setUserIntent);
  const { signOut } = useAuth();

  const jumpToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      haptics.light();
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      haptics.light();
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const toggleFocus = (area: FocusArea) => {
    haptics.light();
    setSelectedFocus(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleFinish = () => {
    if (selectedIntent) setUserIntent(selectedIntent);
    setFocusAreas(selectedFocus);
    setVisualMode(selectedMode);
    setOnboarded();
    haptics.celebration();
  };

  const handleSkip = () => {
    setVisualMode('roots');
    setOnboarded();
  };

  const canProceed = step === 0 || step === 1 || step === 2 || step === 5 || (step === 3 && selectedIntent) || (step === 4 && selectedFocus.length > 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sage-light/60 via-background to-background transition-all duration-700 relative overflow-hidden">
      {!demoMode && (
        <button
          onClick={() => signOut()}
          className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/90 border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-semibold">Log out</span>
        </button>
      )}

      {/* Demo mode step picker */}
      {demoMode && (
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-center gap-1.5 flex-wrap">
          {STEP_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => jumpToStep(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                step === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/90 border border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {i}: {label}
            </button>
          ))}
        </div>
      )}

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-40 -left-16 w-40 h-40 rounded-full bg-compass/5 blur-3xl animate-float-slow" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full flex flex-col items-center text-center"
          >
            {step === 0 && <WelcomeStep />}
            {step === 1 && <PhilosophyStep />}
            {step === 2 && <NeuroscienceStep />}
            {step === 3 && (
              <IntentStep selected={selectedIntent} onSelect={(v) => { haptics.light(); setSelectedIntent(v); }} />
            )}
            {step === 4 && (
              <FocusStep selected={selectedFocus} onToggle={toggleFocus} />
            )}
            {step === 5 && (
              <VisualStep selected={selectedMode} onSelect={(v) => { haptics.light(); setSelectedMode(v); }} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="w-full max-w-sm space-y-4 pb-8 relative z-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === step ? 'w-10 bg-primary shadow-[var(--shadow-glow-primary)]' : i < step ? 'w-2 bg-primary/40' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={goBack}
              className="px-5 py-4 rounded-2xl bg-muted/60 text-foreground font-semibold text-sm flex items-center gap-1 active:scale-[0.98] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={step === TOTAL_STEPS - 1 ? handleFinish : goNext}
            disabled={!canProceed}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 shadow-[var(--shadow-glow-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === TOTAL_STEPS - 1 ? "Let's Go" : 'Next'}
            {step < TOTAL_STEPS - 1 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={handleSkip}
          className="w-full py-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Skip setup
        </button>

        <p className="text-[10px] text-muted-foreground/50 text-center tracking-wide">
          by The Space Inbetween The Versions
        </p>
        <p className="text-xs text-muted-foreground/70 text-center px-4">
          A self-awareness tool. Not a substitute for professional support.
        </p>
      </div>
    </div>
  );
}

// ─── Step Components ───

function WelcomeStep() {
  return (
    <>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 15 }}
        className="mb-8"
      >
        <div className="relative">
          <div className="p-8 rounded-full bg-primary/10 shadow-[var(--shadow-soft)]">
            <Sparkles className="w-16 h-16 text-primary" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/5"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      <h1 className="text-4xl font-serif font-bold mb-3 text-foreground tracking-tight">
        Welcome to InBetween
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 max-w-xs"
      >
        <p className="text-base text-muted-foreground leading-relaxed">
          There is always a moment between impulse and action.
        </p>
        <p className="text-base text-foreground leading-relaxed font-medium">
          In that moment, awareness gives you a choice.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-2"
        >
          <p className="text-sm text-primary font-semibold tracking-wide">
            Pause. Notice. Choose.
          </p>
        </motion.div>
      </motion.div>

      <p className="text-xs text-muted-foreground/60 mt-6">Takes about 30 seconds to set up</p>
    </>
  );
}

function PhilosophyStep() {
  return (
    <div className="space-y-6 max-w-xs">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">
          The InBetween Moment
        </h2>
      </motion.div>

      {/* Visual: Impulse → Gap → Action */}
      <div className="flex items-center justify-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center"
        >
          <span className="text-xl">⚡</span>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="w-16 h-1 bg-gradient-to-r from-destructive/30 via-primary to-accent/30 rounded-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30"
        >
          <span className="text-xs font-bold text-primary">The Gap</span>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="w-16 h-1 bg-gradient-to-r from-primary/30 via-accent to-accent/30 rounded-full" />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center"
        >
          <span className="text-xl">🎯</span>
        </motion.div>
      </div>

      <div className="text-center flex justify-between px-2 text-[10px] text-muted-foreground font-semibold">
        <span>IMPULSE</span>
        <span>YOUR CHOICE</span>
        <span>ACTION</span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="space-y-3 pt-2"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          Most people think behavior is automatic. <span className="text-foreground font-medium">It isn't.</span>
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This app helps you find the gap, expand it, and live in it.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="p-3 rounded-xl bg-primary/8 border border-primary/15"
      >
        <p className="text-xs text-foreground/80 leading-relaxed italic">
          Emotions are signals. They don't have to be instructions.
        </p>
      </motion.div>
    </div>
  );
}

const NEURO_FACTS = [
  {
    icon: Brain,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    title: 'Your brain has a habit loop',
    detail: 'Trigger → Craving → Response → Reward. This loop runs automatically — but it can be interrupted.',
  },
  {
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'Urges peak and pass',
    detail: 'Neuroscience shows most urges last 60–90 seconds. If you can ride the wave, the intensity drops naturally.',
  },
  {
    icon: Eye,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Awareness rewires the brain',
    detail: 'Each time you notice an impulse without acting on it, you strengthen your prefrontal cortex — the part that chooses.',
  },
];

function UrgeWaveCurve() {
  // SVG path for a bell-curve style urge wave peaking around 60-90s
  const wavePath = "M 0 80 C 20 80, 30 78, 50 60 C 70 40, 80 15, 100 10 C 120 5, 140 8, 160 25 C 180 42, 200 65, 230 72 C 260 78, 280 80, 300 80";

  // Count-up timer synced to the 6s animation cycle (represents 0–300s / 5 min)
  const [elapsed, setElapsed] = useState(0);
  const [isPeak, setIsPeak] = useState(false);
  const wasPeakRef = useRef(false);

  useEffect(() => {
    const CYCLE = 6000;
    const START_DELAY = 800;
    const TICK = 50;
    let startTime: number;
    let frameId: number;
    let started = false;

    const delayTimeout = setTimeout(() => {
      startTime = performance.now();
      started = true;
    }, START_DELAY);

    // Haptic pulse at peak
    const peakTimeout = setTimeout(() => {
      haptics.medium();
      const interval = setInterval(() => haptics.medium(), CYCLE);
      (window as any).__urgeHapticInterval = interval;
    }, START_DELAY + 1200);

    const tick = () => {
      if (started) {
        const now = performance.now();
        const cycleMs = (now - startTime) % CYCLE;
        const mapped = Math.round((cycleMs / CYCLE) * 300);
        setElapsed(mapped);
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(peakTimeout);
      cancelAnimationFrame(frameId);
      if ((window as any).__urgeHapticInterval) {
        clearInterval((window as any).__urgeHapticInterval);
        delete (window as any).__urgeHapticInterval;
      }
    };
  }, []);

  // Detect entering / exiting peak zone and fire feedback
  useEffect(() => {
    const isPeakNow = elapsed >= 60 && elapsed <= 90;
    if (isPeakNow && !wasPeakRef.current) {
      wasPeakRef.current = true;
      setIsPeak(true);
      sounds.peakEnter();
      haptics.medium();
    } else if (!isPeakNow && wasPeakRef.current) {
      wasPeakRef.current = false;
      setIsPeak(false);
      sounds.peakExit();
      haptics.light();
    }
  }, [elapsed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`p-4 rounded-2xl border transition-all duration-700 ease-in-out ${
        isPeak
          ? 'border-amber-400/40 bg-amber-400/[0.07] shadow-[0_0_30px_-5px_hsl(var(--warm)/0.18)]'
          : 'border-border/50 bg-card/50 shadow-none'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-sm font-bold text-foreground">Urges peak and pass</p>
      </div>
      <div className="relative">
        <svg viewBox="0 0 300 90" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          <line x1="0" y1="80" x2="300" y2="80" className="stroke-border/30" strokeWidth="1" />
          <line x1="100" y1="0" x2="100" y2="85" className="stroke-border/20" strokeWidth="1" strokeDasharray="4 4" />

          {/* Animated wave fill */}
          <motion.path
            d={wavePath + " L 300 90 L 0 90 Z"}
            fill="hsl(var(--warm) / 0.08)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          />

          {/* Animated wave stroke */}
          <motion.path
            d={wavePath}
            fill="none"
            stroke="hsl(var(--warm))"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8, duration: 2, ease: "easeInOut" }}
          />

          {/* Peak marker with glow pulse when dot passes */}
          <circle
            cx="100"
            cy="10"
            r="12"
            fill="none"
            stroke="hsl(var(--warm))"
            strokeWidth="2"
            opacity="0"
            style={{ animation: 'peakGlow 6s ease-in-out 0.8s infinite' }}
          />

          {/* Expanding glow rings — pulse outward when entering the peak zone */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={`peak-glow-ring-${i}`}
              cx="100"
              cy="10"
              r="4"
              fill="none"
              stroke="hsl(var(--warm))"
              strokeWidth="1.5"
              style={{ transformOrigin: '100px 10px' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={isPeak ? {
                scale: [1, 2.2 + i * 0.9, 1],
                opacity: [0.75, 0, 0.75],
              } : {
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 1.6,
                delay: i * 0.48,
                repeat: isPeak ? Infinity : 0,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Static peak dot — glows brighter during peak zone */}
          <motion.circle
            cx="100"
            cy="10"
            r="4"
            fill="hsl(var(--warm))"
            initial={{ scale: 0, opacity: 0 }}
            animate={isPeak ? {
              scale: [1, 1.35, 1],
              opacity: [1, 0.85, 1],
            } : {
              scale: 1,
              opacity: 1,
            }}
            transition={isPeak ? {
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            } : {
              delay: 1.5,
              type: 'spring',
              damping: 10,
            }}
          />

          {/* "RIDE IT" label during peak zone */}
          <AnimatePresence>
            {isPeak && (
              <motion.text
                x="100"
                y="38"
                textAnchor="middle"
                className="text-[8px] font-bold tracking-wider fill-warm"
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.4 }}
              >
                RIDE IT
              </motion.text>
            )}
          </AnimatePresence>

          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const endX = Math.round(100 + Math.cos(rad) * 20);
            const endY = Math.round(10 + Math.sin(rad) * 20);
            return (
              <circle
                key={`particle-${i}`}
                cx="100"
                cy="10"
                r="1.5"
                fill="hsl(var(--warm))"
                opacity="0"
              >
                <animate attributeName="cx" values={`100;100;${endX};${endX}`} keyTimes="0;0.2;0.35;1" dur="6s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="cy" values={`10;10;${endY};${endY}`} keyTimes="0;0.2;0.35;1" dur="6s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0;0.8;0" keyTimes="0;0.2;0.28;0.45" dur="6s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="r" values="1.5;1.5;2.5;0.5" keyTimes="0;0.2;0.3;0.45" dur="6s" begin="0.8s" repeatCount="indefinite" />
              </circle>
            );
          })}

          {/* Traveling pulsing dot — slows at peak via keyPoints/keyTimes */}
          <motion.circle
            r="5"
            fill="hsl(var(--warm))"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 1, 0.6] }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <animateMotion
              dur="6s"
              begin="0.8s"
              repeatCount="indefinite"
              keyPoints="0;0.25;0.33;0.42;0.65;1"
              keyTimes="0;0.2;0.35;0.55;0.75;1"
              calcMode="spline"
              keySplines="0.4 0 0.6 1;0.1 0 0.2 1;0.1 0 0.2 1;0.4 0 0.6 1;0.4 0 0.6 1"
              path="M 0 80 C 20 80, 30 78, 50 60 C 70 40, 80 15, 100 10 C 120 5, 140 8, 160 25 C 180 42, 200 65, 230 72 C 260 78, 280 80, 300 80"
            />
          </motion.circle>
          {/* Pulsing glow ring around traveling dot */}
          <motion.circle
            r="10"
            fill="none"
            stroke="hsl(var(--warm))"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0, 0.4, 0] }}
            transition={{ delay: 0.8, duration: 2, repeat: Infinity }}
          >
            <animateMotion
              dur="6s"
              begin="0.8s"
              repeatCount="indefinite"
              keyPoints="0;0.25;0.33;0.42;0.65;1"
              keyTimes="0;0.2;0.35;0.55;0.75;1"
              calcMode="spline"
              keySplines="0.4 0 0.6 1;0.1 0 0.2 1;0.1 0 0.2 1;0.4 0 0.6 1;0.4 0 0.6 1"
              path="M 0 80 C 20 80, 30 78, 50 60 C 70 40, 80 15, 100 10 C 120 5, 140 8, 160 25 C 180 42, 200 65, 230 72 C 260 78, 280 80, 300 80"
            />
          </motion.circle>

          {/* "This is where you choose" callout — fades in when dot is at peak */}
          <foreignObject x="120" y="-5" width="140" height="30">
            <div
              style={{
                animation: 'peakCallout 6s ease-in-out 0.8s infinite',
                opacity: 0,
                fontSize: '8px',
                fontStyle: 'italic',
                textAlign: 'left',
                color: 'hsl(var(--foreground) / 0.8)',
              }}
            >
              This is where you choose
            </div>
          </foreignObject>

          {/* Labels */}
          <motion.text
            x="100"
            y="6"
            textAnchor="middle"
            className="fill-foreground text-[8px] font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            PEAK
          </motion.text>

          <text x="5" y="76" className="fill-muted-foreground text-[7px]">0s</text>
          <text x="88" y="95" className="fill-amber-400 text-[7px] font-semibold">60-90s</text>
          <text x="270" y="76" className="fill-muted-foreground text-[7px]">5 min</text>
        </svg>

        {/* Annotation */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 text-center"
        >
          Most urges last <span className="text-amber-400 font-semibold">60–90 seconds</span>. Ride the wave, and it passes.
        </motion.p>

        {/* Count-up timer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-1.5 mt-2"
        >
          <div className={`font-mono text-xs tabular-nums transition-all duration-500 ease-out ${
            elapsed >= 60 && elapsed <= 90 
              ? 'text-amber-400 font-semibold' 
              : 'text-foreground/70'
          }`}>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-muted-foreground">/ 5:00</span>
          {elapsed >= 60 && elapsed <= 90 && (
            <span className="text-[9px] text-amber-400 font-medium ml-1 animate-fade-in">
              Peak zone
            </span>
          )}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-3 w-full flex items-center gap-2"
        >
          <Progress
            value={(elapsed / 300) * 100}
            className={`flex-1 h-2 transition-all duration-500 ease-out ${
              elapsed >= 60 && elapsed <= 90 
                ? '[&>div]:bg-amber-400 [&>div]:shadow-[0_0_8px_hsl(45_93%_58%_/_0.4)] [&>div]:transition-all [&>div]:duration-500 [&>div]:ease-out' 
                : '[&>div]:transition-all [&>div]:duration-500 [&>div]:ease-out'
            }`}
            aria-label="Urge wave progress"
          />
          <span className={`text-xs tabular-nums w-8 text-right transition-all duration-500 ease-out ${
            elapsed >= 60 && elapsed <= 90 
              ? 'text-amber-400 font-semibold' 
              : 'text-muted-foreground'
          }`}>
            {Math.round((elapsed / 300) * 100)}%
          </span>
        </motion.div>

        {/* Dev-only debug readout */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center space-y-0.5"
          >
            <div className="text-[10px] font-mono text-yellow-600 dark:text-yellow-400">
              <span className="font-semibold">DEBUG:</span>{' '}
              elapsed={elapsed}s | progress={Math.round((elapsed / 300) * 100)}%
            </div>
            <div className="text-[10px] font-mono text-yellow-600 dark:text-yellow-400">
              isPeakZone={elapsed >= 60 && elapsed <= 90 ? 'true' : 'false'} | peakProgress={elapsed >= 60 && elapsed <= 90 ? Math.round(((elapsed - 60) / 30) * 100) : 0}%
            </div>
            <div className="text-[10px] font-mono text-yellow-600 dark:text-yellow-400">
              animState={elapsed < 60 ? 'rising' : elapsed <= 90 ? 'PEAK' : 'falling'} | color={elapsed >= 60 && elapsed <= 90 ? 'amber' : 'primary'}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function NeuroscienceStep() {
  const habitFact = NEURO_FACTS[0];
  const awarenessFact = NEURO_FACTS[2];
  const HabitIcon = habitFact.icon;
  const AwarenessIcon = awarenessFact.icon;

  return (
    <div className="space-y-4 max-w-xs">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="inline-flex p-4 rounded-full bg-violet-500/10 mb-4">
          <Brain className="w-10 h-10 text-violet-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2 text-foreground">
          Why This Works
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This isn't willpower. It's neuroscience.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 p-3.5 rounded-2xl border border-border/50 bg-card/50 text-left"
      >
        <div className={`shrink-0 w-10 h-10 rounded-xl ${habitFact.bg} flex items-center justify-center`}>
          <HabitIcon className={`w-5 h-5 ${habitFact.color}`} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">{habitFact.title}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{habitFact.detail}</p>
        </div>
      </motion.div>

      <UrgeWaveCurve />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3 p-3.5 rounded-2xl border border-border/50 bg-card/50 text-left"
      >
        <div className={`shrink-0 w-10 h-10 rounded-xl ${awarenessFact.bg} flex items-center justify-center`}>
          <AwarenessIcon className={`w-5 h-5 ${awarenessFact.color}`} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">{awarenessFact.title}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{awarenessFact.detail}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="p-3 rounded-xl bg-primary/8 border border-primary/15 text-center"
      >
        <p className="text-xs text-foreground/80 leading-relaxed italic">
          "I learned how to catch the moment where choice becomes possible."
        </p>
      </motion.div>
    </div>
  );
}

function IntentStep({ selected, onSelect }: { selected: UserIntent | null; onSelect: (v: UserIntent) => void }) {
  return (
    <>
      <div className="mb-6 p-4 rounded-full bg-compass/10">
        <Target className="w-10 h-10 text-compass" />
      </div>
      <h2 className="text-2xl font-serif font-bold mb-2 text-foreground tracking-tight">
        What brings you here?
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        This helps us show you the right tools first.
      </p>
      <div className="w-full space-y-2">
        {INTENT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] flex items-center gap-3 ${
              selected === opt.value
                ? 'bg-primary/12 border-primary/30 shadow-[var(--shadow-card)]'
                : 'border-border/50 hover:border-primary/20 bg-card/50'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div>
              <span className={`text-sm font-bold block ${
                selected === opt.value ? 'text-primary' : 'text-foreground'
              }`}>{opt.label}</span>
              <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function FocusStep({ selected, onToggle }: { selected: FocusArea[]; onToggle: (a: FocusArea) => void }) {
  return (
    <>
      <div className="mb-6 p-4 rounded-full bg-accent/10">
        <Compass className="w-10 h-10 text-accent" />
      </div>
      <h2 className="text-2xl font-serif font-bold mb-2 text-foreground tracking-tight">
        What do you want to work on?
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Pick as many as you want. You can change these later.
      </p>
      <div className="w-full grid grid-cols-2 gap-2">
        {FOCUS_OPTIONS.map(opt => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.97] ${
                isSelected
                  ? 'bg-primary/12 border-primary/30 shadow-[var(--shadow-card)]'
                  : 'border-border/50 hover:border-primary/20 bg-card/50'
              }`}
            >
              <span className="text-xl block mb-1">{opt.emoji}</span>
              <span className={`text-xs font-bold block leading-tight ${
                isSelected ? 'text-primary' : 'text-foreground'
              }`}>{opt.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        {selected.length} selected
      </p>
    </>
  );
}

function VisualStep({ selected, onSelect }: { selected: VisualMode; onSelect: (v: VisualMode) => void }) {
  return (
    <>
      <h2 className="text-2xl font-serif font-bold mb-2 text-foreground tracking-tight">
        Pick Your Style
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        How do you want to see your progress? Same data, different look.
      </p>
      <div className="w-full grid grid-cols-2 gap-3">
        {VISUAL_MODES.map(mode => (
          <button
            key={mode.value}
            onClick={() => onSelect(mode.value)}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.97] ${
              selected === mode.value
                ? 'bg-primary/15 border-primary/30 shadow-[var(--shadow-card)]'
                : 'border-border/50 hover:border-primary/20'
            }`}
          >
            <span className="text-3xl block mb-2">{mode.icon}</span>
            <span className={`text-sm font-bold block ${
              selected === mode.value ? 'text-primary' : 'text-foreground'
            }`}>{mode.label}</span>
            <span className="text-[10px] text-muted-foreground">{mode.desc}</span>
          </button>
        ))}
      </div>
    </>
  );
}
