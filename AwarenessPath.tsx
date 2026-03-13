import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { differenceInWeeks, differenceInDays } from 'date-fns';
import { Eye, Tag, Pause, Brain, Compass, Zap, ChevronRight, Check } from 'lucide-react';

interface Phase {
  weeks: string;
  name: string;
  icon: typeof Eye;
  goal: string;
  description: string;
  practices: string[];
  reflection: string;
}

const PHASES: Phase[] = [
  {
    weeks: '1–2',
    name: 'Noticing',
    icon: Eye,
    goal: 'Simply become aware',
    description: 'Focus on recognizing emotions, urges, and body signals. The goal is simply awareness — nothing else.',
    practices: [
      'Check in once daily with how you feel',
      'Notice body sensations during stress',
      'Use the express check-in after urges',
    ],
    reflection: 'What did you notice about your mind this week?',
  },
  {
    weeks: '3–4',
    name: 'Naming',
    icon: Tag,
    goal: 'Identify what you feel',
    description: 'Practice identifying emotions and triggers more clearly. Start recognizing patterns in when and why they arise.',
    practices: [
      'Use "Name It" to label specific emotions',
      'Log triggers when they happen',
      'Notice which emotions repeat most',
    ],
    reflection: 'What emotions showed up most often? When?',
  },
  {
    weeks: '5–6',
    name: 'Pausing',
    icon: Pause,
    goal: 'Interrupt automatic reactions',
    description: 'Practice interrupting the autopilot. This is where the InBetween moment becomes familiar — the tiny gap between impulse and action.',
    practices: [
      'Use Pause Training before reacting',
      'Try the 60-Second Reset during urges',
      'Practice breathing before decisions',
    ],
    reflection: 'Were there moments you paused when you normally wouldn\'t?',
  },
  {
    weeks: '7–8',
    name: 'Understanding',
    icon: Brain,
    goal: 'See the patterns',
    description: 'Begin seeing how certain thoughts, environments, or stressors trigger patterns. Understanding why removes the mystery.',
    practices: [
      'Review your trigger patterns',
      'Read micro-education modules',
      'Reflect on body-emotion connections',
    ],
    reflection: 'What patterns are becoming clearer to you?',
  },
  {
    weeks: '9–10',
    name: 'Choosing',
    icon: Compass,
    goal: 'Practice new responses',
    description: 'Intentionally practice different responses when impulses arise. You know the pattern — now you choose a different direction.',
    practices: [
      'Use the Situation Guide during triggers',
      'Try different grounding tools',
      'Log choices in Behavior Compass',
    ],
    reflection: 'What new responses did you try? How did they feel?',
  },
  {
    weeks: '11–12',
    name: 'Rewiring',
    icon: Zap,
    goal: 'Awareness becomes habit',
    description: 'New responses begin to feel more natural. Awareness is no longer effort — it\'s becoming part of who you are.',
    practices: [
      'Notice when awareness happens automatically',
      'Celebrate moments of natural pausing',
      'Write a letter to your future self',
    ],
    reflection: 'How has your relationship with your impulses changed?',
  },
];

export default function AwarenessPath() {
  const { entries } = useAppStore();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  // Determine current week based on first entry
  const currentWeek = useMemo(() => {
    if (entries.length === 0) return 1;
    const earliest = entries.reduce((min, e) =>
      new Date(e.entryDatetime) < new Date(min.entryDatetime) ? e : min
    );
    const weeks = differenceInWeeks(new Date(), new Date(earliest.entryDatetime));
    return Math.min(Math.max(weeks + 1, 1), 12);
  }, [entries]);

  const getCurrentPhaseIndex = () => {
    if (currentWeek <= 2) return 0;
    if (currentWeek <= 4) return 1;
    if (currentWeek <= 6) return 2;
    if (currentWeek <= 8) return 3;
    if (currentWeek <= 10) return 4;
    return 5;
  };

  const currentPhaseIndex = getCurrentPhaseIndex();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-bold text-foreground">Awareness Path</h3>
          <p className="text-xs text-muted-foreground">12 weeks of growing awareness</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-xs font-bold text-primary">Week {currentWeek}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentWeek / 12) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
        />
      </div>

      {/* Three pillars */}
      <div className="grid grid-cols-3 gap-2 py-2">
        <div className="text-center p-3 rounded-xl bg-card border border-border/50">
          <Eye className="w-4 h-4 text-primary mx-auto mb-1" />
          <span className="text-[10px] font-bold text-foreground">Observe</span>
        </div>
        <div className="text-center p-3 rounded-xl bg-card border border-border/50">
          <Brain className="w-4 h-4 text-primary mx-auto mb-1" />
          <span className="text-[10px] font-bold text-foreground">Understand</span>
        </div>
        <div className="text-center p-3 rounded-xl bg-card border border-border/50">
          <Compass className="w-4 h-4 text-primary mx-auto mb-1" />
          <span className="text-[10px] font-bold text-foreground">Choose</span>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-2">
        {PHASES.map((phase, i) => {
          const isActive = i === currentPhaseIndex;
          const isComplete = i < currentPhaseIndex;
          const isLocked = i > currentPhaseIndex + 1;
          const isExpanded = expandedPhase === i;
          const PhaseIcon = phase.icon;

          return (
            <motion.div
              key={phase.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => !isLocked && setExpandedPhase(isExpanded ? null : i)}
                disabled={isLocked}
                className={`w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.99] ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/12 to-accent/8 border-primary/25 shadow-[var(--shadow-card)]'
                    : isComplete
                    ? 'bg-card border-primary/15'
                    : isLocked
                    ? 'bg-muted/30 border-border/30 opacity-50'
                    : 'bg-card border-border/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isComplete ? 'bg-primary/15' : isActive ? 'bg-primary/15' : 'bg-muted/50'
                  }`}>
                    {isComplete ? (
                      <Check className="w-5 h-5 text-primary" />
                    ) : (
                      <PhaseIcon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        Weeks {phase.weeks}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {phase.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{phase.goal}</p>
                  </div>
                  {!isLocked && (
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-2 space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {phase.description}
                      </p>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Practices
                        </span>
                        {phase.practices.map((practice, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                            {practice}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-primary/8 border border-primary/15">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                          Weekly Reflection
                        </span>
                        <p className="text-sm text-foreground/80 italic">
                          "{phase.reflection}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Core principle */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/8 to-accent/5 border border-primary/15 text-center mt-4">
        <p className="text-xs text-foreground/80 leading-relaxed">
          <span className="font-semibold text-foreground">Observe</span> what's happening inside you.{' '}
          <span className="font-semibold text-foreground">Understand</span> the patterns behind it.{' '}
          <span className="font-semibold text-foreground">Decide</span> how you want to respond.
        </p>
      </div>
    </div>
  );
}
