import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { calculateStreak, isToday } from '@/lib/analytics';
import { generateInsights } from '@/lib/insights';
import { fireMilestone } from '@/lib/confetti';
import { haptics } from '@/lib/haptics';
import { sounds } from '@/lib/sounds';
import GratitudeGenerator from '@/components/GratitudeGenerator';
import ExpressCheckin from '@/components/ExpressCheckin';
import GardenView from '@/components/GardenView';
import NearMilestoneBoost from '@/components/NearMilestoneBoost';
import GentleRecovery from '@/components/GentleRecovery';
import PredictiveNudge from '@/components/PredictiveNudge';
import IdentityShiftCard from '@/components/IdentityShiftCard';
import SteadinessCard from '@/components/SteadinessCard';
import PauseRatioCard from '@/components/PauseRatioCard';
import BehaviorCompass from '@/components/BehaviorCompass';
import PatternMirror from '@/components/PatternMirror';
import ProgressStory from '@/components/ProgressStory';
import MoodColoringWidget from '@/components/MoodColoringWidget';
import BehaviorProgressDashboard from '@/components/BehaviorProgressDashboard';
import Fireflies from '@/components/Fireflies';
import SixtySecondReset from '@/components/SixtySecondReset';
import SituationGuide from '@/components/SituationGuide';
import ToolInsights from '@/components/ToolInsights';
import NameTheFeeling from '@/components/NameTheFeeling';
import MicroEducation from '@/components/MicroEducation';
import ScienceBehindThePause from '@/components/ScienceBehindThePause';
import DailyAnchor from '@/components/DailyAnchor';
import MomentCompanion from '@/components/MomentCompanion';
import MissionStatement from '@/components/MissionStatement';
import AwarenessPath from '@/components/AwarenessPath';
import PatternAwareness from '@/components/PatternAwareness';
import WeeklyReflection from '@/components/WeeklyReflection';
import AwarenessReminder from '@/components/AwarenessReminder';
import TransitionBanner from '@/components/TransitionBanner';
import PauseCounter from '@/components/PauseCounter';
import CompanionMessages from '@/components/CompanionMessages';
import { Compass, Flame, Sun, Moon, Heart, Trophy, TrendingUp, Zap, Sparkles, ArrowRight, RotateCcw, HelpCircle, Tag, BookOpen, Brain } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MILESTONES = [7, 30, 60, 100, 365];

function getMilestone(streak: number): number | null {
  return MILESTONES.includes(streak) ? streak : null;
}

function getMilestoneMessage(days: number): string {
  switch (days) {
    case 7: return '🔥 One week. You showed up every day. Not luck.';
    case 30: return '🌟 A month of checking in. Building something real.';
    case 60: return '💎 Two months. This is who you are now.';
    case 100: return '🏆 100 days. You changed the wiring.';
    case 365: return '👑 One year. Not the same person who started.';
    default: return `🎉 ${days} days of staying level!`;
  }
}

const PROGRESS_STAGES = [
  { min: 0, name: 'Foundation' },
  { min: 3, name: 'Building' },
  { min: 7, name: 'Consistent' },
  { min: 14, name: 'Established' },
  { min: 30, name: 'Solid' },
];

function getNextStage(streak: number) {
  for (const s of PROGRESS_STAGES) {
    const away = s.min - streak;
    if (away > 0 && away <= 3) {
      return { name: s.name, daysAway: away };
    }
  }
  return null;
}

function getLastEntryDaysAgo(entries: { entryDatetime: string }[]): number {
  if (entries.length === 0) return 0;
  const latest = new Date(entries[0].entryDatetime);
  return Math.floor((Date.now() - latest.getTime()) / 86400000);
}

function ParallaxBlobs() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
      <div
        className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-primary/15 animate-morph animate-drift"
        style={{ filter: 'blur(50px)', transform: `translateY(${scrollY * 0.08}px)` }}
      />
      <div
        className="absolute top-32 -left-16 w-56 h-56 rounded-full bg-accent/20 animate-morph-alt animate-float-slow"
        style={{ filter: 'blur(45px)', transform: `translateY(${scrollY * -0.05}px)` }}
      />
      <div
        className="absolute top-[45%] -right-20 w-64 h-64 rounded-full bg-sky/12 animate-morph animate-float-reverse"
        style={{ filter: 'blur(50px)', transform: `translateY(${scrollY * 0.12}px)` }}
      />
      <div
        className="absolute top-[65%] -left-10 w-48 h-48 rounded-full bg-lavender/12 animate-morph-alt animate-drift-reverse"
        style={{ filter: 'blur(40px)', transform: `translateY(${scrollY * -0.07}px)` }}
      />
      <div
        className="absolute bottom-0 right-10 w-60 h-60 rounded-full bg-warm/12 animate-morph animate-float-slow"
        style={{ filter: 'blur(45px)', transform: `translateY(${scrollY * 0.1}px)` }}
      />
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [showGenerator, setShowGenerator] = useState(false);
  const [showExpress, setShowExpress] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showSituationGuide, setShowSituationGuide] = useState(false);
  const [resetType, setResetType] = useState<'breathe' | 'ground' | 'reframe' | null>(null);
  const [showNameFeeling, setShowNameFeeling] = useState(false);
  const [showMicroEd, setShowMicroEd] = useState(false);
  const [showScience, setShowScience] = useState(false);
  const celebratedRef = useRef<number | null>(null);
  const { entries } = useAppStore();
  
  const streak = calculateStreak(entries.map(e => e.entryDatetime));
  const todayEntries = entries.filter(e => isToday(e.entryDatetime));
  const todayMood = todayEntries.length > 0
    ? Math.round(todayEntries.reduce((s, e) => s + e.mood, 0) / todayEntries.length * 10) / 10
    : null;

  const lastEntryDaysAgo = getLastEntryDaysAgo(entries);
  const isReturning = entries.length > 0 && streak === 0 && todayEntries.length === 0;
  const isPaused = isReturning || (lastEntryDaysAgo >= 2 && todayEntries.length === 0);

  const insights = useMemo(() => generateInsights(entries), [entries]);
  const nextFlowerStage = getNextStage(streak);
  const milestone = getMilestone(streak);

  useEffect(() => {
    if (milestone && celebratedRef.current !== milestone && todayEntries.length > 0) {
      celebratedRef.current = milestone;
      setShowMilestone(true);
      haptics.celebration();
      sounds.celebrate();
      fireMilestone();
      setTimeout(() => setShowMilestone(false), 5000);
    }
  }, [milestone, todayEntries.length]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 18 ? Sun : Moon;

  if (showReset) {
    return <SixtySecondReset onClose={() => setShowReset(false)} initialType={resetType || undefined} />;
  }

  if (showSituationGuide) {
    return (
      <SituationGuide
        onClose={() => setShowSituationGuide(false)}
        onStartReset={(type) => {
          setShowSituationGuide(false);
          setResetType(type);
          setShowReset(true);
        }}
      />
    );
  }

  if (showNameFeeling) {
    return <NameTheFeeling onClose={() => setShowNameFeeling(false)} />;
  }

  if (showMicroEd) {
    return <MicroEducation onClose={() => setShowMicroEd(false)} />;
  }

  if (showScience) {
    return <ScienceBehindThePause onClose={() => setShowScience(false)} />;
  }

  if (showExpress) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <ExpressCheckin onClose={() => setShowExpress(false)} onNavigate={(path) => { setShowExpress(false); navigate(path); }} />
      </div>
    );
  }

  if (showGenerator) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <GratitudeGenerator onClose={() => setShowGenerator(false)} onNavigate={(path) => { setShowGenerator(false); navigate(path); }} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in relative">
      <Fireflies sizeMultiplier={1.4} brightnessMultiplier={1.4} />
      <ParallaxBlobs />
      {/* Header */}
      <div className="pt-10 pb-6 relative">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', damping: 20 }}
          className="text-4xl font-serif font-bold text-foreground tracking-tight"
        >
          InBetween
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-primary font-medium mt-1.5 tracking-wide"
        >
          Pause. Notice. Choose.
        </motion.p>

        {/* Identity statement */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-primary/8 via-card to-accent/5 border border-primary/15"
        >
          <p className="text-sm text-foreground/80 leading-relaxed">
            Most reactions happen automatically. But there is always a small moment between impulse and action.{' '}
            <span className="text-foreground font-medium">InBetween helps you notice that moment so you can choose your direction.</span>
          </p>
        </motion.div>

        {/* Three pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-2 mt-4"
        >
          {[
            { label: 'Notice', sub: 'Awareness' },
            { label: 'Learn', sub: 'Understanding' },
            { label: 'Choose', sub: 'Choice' },
          ].map((pillar, i) => (
            <div key={pillar.label} className="flex items-center gap-2">
              <div className="text-center">
                <span className="text-xs font-bold text-primary tracking-wide">{pillar.label}</span>
                <span className="block text-[9px] text-muted-foreground">{pillar.sub}</span>
              </div>
              {i < 2 && <span className="text-muted-foreground/30 text-xs">→</span>}
            </div>
          ))}
        </motion.div>

        <p className="text-[10px] text-muted-foreground/50 mt-3 tracking-wide">
          by The Space Inbetween The Versions
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 18 }}
          className="group relative p-5 rounded-2xl bg-gradient-to-br from-primary/12 via-card/80 to-card border border-primary/15 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 overflow-hidden"
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/8 animate-morph blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/15">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Streak</span>
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{streak === 0 ? 'ready to start' : streak === 1 ? 'day checking in' : 'days straight'}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', damping: 18 }}
          className="group relative p-5 rounded-2xl bg-gradient-to-br from-accent/12 via-card/80 to-card border border-accent/15 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 overflow-hidden"
        >
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/10 animate-morph-alt blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-accent/15">
                <Heart className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Mood</span>
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">
              {todayMood !== null ? todayMood : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todayEntries.length} check-in{todayEntries.length !== 1 ? 's' : ''} today
            </p>
          </div>
        </motion.div>
      </div>

      {/* Personalized transition banner */}
      <TransitionBanner
        onShowReset={() => { setResetType(null); setShowReset(true); }}
        onShowNameFeeling={() => setShowNameFeeling(true)}
        onShowExpress={() => setShowExpress(true)}
      />

      {/* Pause Counter — gentle awareness reinforcement */}
      <div className="mb-6">
        <PauseCounter />
      </div>

      {/* Gentle recovery mode */}
      {isReturning && (
        <div className="mb-6">
          <GentleRecovery lastEntryDaysAgo={lastEntryDaysAgo} />
        </div>
      )}

      {/* Mission Statement */}
      <MissionStatement variant="compact" className="mb-6 text-center" />

      {/* Moment Companion — time-aware guidance */}
      <MomentCompanion 
        className="mb-6"
        onAction={(action) => {
          haptics.medium();
          switch (action) {
            case 'set-intention':
            case 'reflect':
              // DailyAnchor handles these — scroll or show it
              break;
            case 'find-space':
            case 'triggered':
              setShowSituationGuide(true);
              break;
            case 'stay-present':
              setResetType('ground');
              setShowReset(true);
              break;
            case 'check-in':
              setShowExpress(true);
              break;
          }
        }}
      />

      {/* Daily Anchor — morning/evening prompt */}
      <div className="mb-6">
        <DailyAnchor />
      </div>

      {/* Awareness reinforcement — one per session */}
      <div className="mb-6">
        <AwarenessReminder />
      </div>

      {/* Companion Messages — gentle rotating nudges */}
      <div className="mb-6">
        <CompanionMessages />
      </div>

      {/* PILLAR 1: NOTICE — Awareness */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-2 flex items-center gap-2"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Notice</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
      </motion.div>
      <p className="text-[10px] text-muted-foreground text-center mb-4">Slow down. Observe what's happening inside you.</p>

      {/* Quick Tools Grid — Notice tools */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 18 }}
          onClick={() => { haptics.medium(); setResetType(null); setShowReset(true); }}
          className="p-4 rounded-2xl bg-gradient-to-br from-destructive/15 to-primary/10 border border-destructive/25 shadow-[var(--shadow-card)] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
        >
          <RotateCcw className="w-6 h-6 text-destructive" />
          <span className="text-sm font-bold">60s Reset</span>
          <span className="text-[10px] text-muted-foreground">Quick intervention</span>
        </motion.button>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: 'spring', damping: 18 }}
          onClick={() => { haptics.medium(); setShowNameFeeling(true); }}
          className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 shadow-[var(--shadow-card)] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
        >
          <Tag className="w-6 h-6 text-primary" />
          <span className="text-sm font-bold">Name It</span>
          <span className="text-[10px] text-muted-foreground">Label the feeling</span>
        </motion.button>
      </div>

      {/* Grounding tools */}
      <div className="mb-6">
        <SteadinessCard />
      </div>
      <div className="mb-6">
        <MoodColoringWidget />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* PILLAR 2: LEARN — Understanding */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-2 flex items-center gap-2"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/20" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Learn</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/20" />
      </motion.div>
      <p className="text-[10px] text-muted-foreground text-center mb-4">Understand your patterns. See what drives your reactions.</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', damping: 18 }}
          onClick={() => { haptics.medium(); setShowMicroEd(true); }}
          className="p-4 rounded-2xl bg-gradient-to-br from-accent/15 to-primary/10 border border-accent/25 shadow-[var(--shadow-card)] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
        >
          <BookOpen className="w-6 h-6 text-accent" />
          <span className="text-sm font-bold">Learn</span>
          <span className="text-[10px] text-muted-foreground">Mind basics</span>
        </motion.button>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.43, type: 'spring', damping: 18 }}
          onClick={() => { haptics.medium(); setShowScience(true); }}
          className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/15 to-primary/10 border border-violet-400/25 shadow-[var(--shadow-card)] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
        >
          <Brain className="w-6 h-6 text-violet-500" />
          <span className="text-sm font-bold">Science</span>
          <span className="text-[10px] text-muted-foreground">The Pause</span>
        </motion.button>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.46, type: 'spring', damping: 18 }}
          onClick={() => navigate('/reflect')}
          className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 shadow-[var(--shadow-card)] active:scale-[0.98] transition-all flex flex-col items-center gap-2"
        >
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-sm font-bold">Reflect</span>
          <span className="text-[10px] text-muted-foreground">AI insights</span>
        </motion.button>
      </div>

      {/* What You're Learning — pattern insights */}
      <div className="mb-6">
        <ToolInsights />
      </div>

      {/* Weekly Reflection Summary */}
      <div className="mb-6">
        <WeeklyReflection />
      </div>

      {/* Pattern Awareness — reward loop education */}
      <div className="mb-6">
        <PatternAwareness />
      </div>

      {/* Pattern Mirror — AI behavioral analysis */}
      <div className="mb-6">
        <PatternMirror />
      </div>

      {/* 12-Week Awareness Path */}
      <div className="mb-6 p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
        <AwarenessPath />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* PILLAR 3: CHOOSE — Choice */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-2 flex items-center gap-2"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-compass/20" />
        <span className="text-[10px] font-bold text-compass uppercase tracking-[0.2em]">Choose</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-compass/20" />
      </motion.div>
      <p className="text-[10px] text-muted-foreground text-center mb-4">Decide your direction. You're in the driver's seat.</p>

      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45, type: 'spring', damping: 18 }}
        onClick={() => { haptics.medium(); setShowSituationGuide(true); }}
        className="w-full p-4 rounded-2xl bg-gradient-to-br from-compass/15 to-primary/10 border border-compass/25 shadow-[var(--shadow-card)] active:scale-[0.98] transition-all flex items-center gap-4 mb-6"
      >
        <HelpCircle className="w-7 h-7 text-compass" />
        <div className="text-left flex-1">
          <span className="text-sm font-bold">I Need Help Right Now</span>
          <p className="text-[10px] text-muted-foreground">Guided journey: notice → accept → choose</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </motion.button>

      {/* Behavior Compass — visible direction indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-compass/8 via-card to-card border border-compass/15 shadow-[var(--shadow-card)]"
      >
        <BehaviorCompass size="md" />
      </motion.div>

      {/* Pause Ratio — THE primary metric */}
      <div className="mb-6">
        <PauseRatioCard />
      </div>

      {/* Identity shift — AI-powered */}
      <div className="mb-6">
        <IdentityShiftCard />
      </div>

      {/* Unified behavior progress */}
      <div className="mb-6">
        <BehaviorProgressDashboard />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* Supporting tools */}
      {/* ═══════════════════════════════════════════ */}

      {/* Near milestone boost */}
      <div className="mb-6">
        <NearMilestoneBoost streak={streak} nextFlowerStage={nextFlowerStage} />
      </div>

      {/* Tree */}
      <div className="mb-6">
        <GardenView entries={entries} streak={streak} isResting={isPaused} />
      </div>

      {/* Predictive nudge — AI-powered */}
      <div className="mb-6">
        <PredictiveNudge />
      </div>

      {/* Milestone celebration banner */}
      <AnimatePresence>
        {showMilestone && milestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 border border-primary/20 shadow-[var(--shadow-glow-primary)] text-center"
          >
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-lg font-serif font-bold">{getMilestoneMessage(milestone)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pattern insights */}
      {insights.length > 0 && (
        <div className="mb-6 space-y-2">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-3.5 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] flex items-start gap-3"
            >
              <span className="text-lg shrink-0">{insight.emoji}</span>
              <div>
                <p className="text-[11px] text-foreground leading-relaxed">{insight.message}</p>
                <div className="flex items-center gap-1 mt-1">
                  {['low', 'medium', 'high'].map(level => (
                    <div
                      key={level}
                      className={`w-1 h-1 rounded-full ${
                        (['low', 'medium', 'high'].indexOf(level) <= ['low', 'medium', 'high'].indexOf(insight.confidence))
                          ? 'bg-primary'
                          : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Feeling Restless quick-access */}
      <motion.button
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate('/restlessness')}
        className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-accent/15 via-card to-primary/10 border border-accent/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] active:scale-[0.98] transition-all duration-300 flex items-center gap-3"
      >
        <span className="text-2xl">🦎</span>
        <div className="text-left flex-1">
          <span className="text-sm font-bold text-foreground">Feeling Restless?</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Body scan · Movement · Fidget · Reframe</p>
        </div>
        <Zap className="w-4 h-4 text-accent" />
      </motion.button>

      {/* CTA buttons — Express + Deep */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => setShowExpress(true)}
          className="group p-5 rounded-3xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 shadow-[var(--shadow-glow-primary)] hover:shadow-[var(--shadow-elevated)]"
        >
          <Zap className="w-6 h-6" />
          <span className="text-sm font-bold">Quick Check-In</span>
          <span className="text-[10px] opacity-80">30 seconds</span>
        </button>
        <button
          onClick={() => setShowGenerator(true)}
          className="group p-5 rounded-3xl bg-card border border-border/50 text-foreground flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
        >
          <Compass className="w-6 h-6 text-primary" />
          <span className="text-sm font-bold">Full Check-In</span>
          <span className="text-[10px] text-muted-foreground">2 minutes</span>
        </button>
      </div>

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-serif font-semibold">Today's Check-Ins</h2>
          </div>
          <div className="space-y-3">
            {todayEntries.slice(0, 3).map((entry, idx) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-[var(--shadow-card)] animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    😊 {entry.mood}/10
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                    😰 {entry.stress}/10
                  </span>
                  {entry.regulationState && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground font-semibold capitalize">
                      {entry.regulationState}
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {entry.items.slice(0, 3).map(item => (
                    <li key={item.id} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5 text-lg leading-none">·</span>
                      {item.text}
                    </li>
                  ))}
                  {entry.items.length > 3 && (
                    <li className="text-xs text-muted-foreground pl-5">
                      +{entry.items.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
          </div>
          <div className="relative">
            <div className="text-5xl mb-5 animate-float">🧭</div>
            <p className="text-foreground font-serif text-lg font-semibold">Start paying attention</p>
            <p className="text-sm text-muted-foreground mt-2">Tap "Check Your Bearings" — takes 30 seconds</p>
          </div>
        </div>
      )}
    </div>
  );
}
