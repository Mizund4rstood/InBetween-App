import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from './appStore';
import { useCompassStore } from './compassStore';
import { calculateStreak } from './analytics';

interface Stage {
  week: number;
  label: string;
  identity: string;
  description: string;
  emoji: string;
}

const JOURNEY_STAGES: Stage[] = [
  {
    week: 1,
    label: 'Reacting',
    identity: 'Someone who notices',
    description: 'You started paying attention. That is already different.',
    emoji: '👁️',
  },
  {
    week: 3,
    label: 'Pausing',
    identity: 'Someone who pauses',
    description: 'The gap between impulse and action is growing.',
    emoji: '⏸️',
  },
  {
    week: 6,
    label: 'Choosing',
    identity: 'Someone who chooses',
    description: 'You are responding, not reacting. The wiring is shifting.',
    emoji: '🧭',
  },
  {
    week: 12,
    label: 'Rewiring',
    identity: 'Someone rewired',
    description: 'The old patterns do not run you anymore. You do.',
    emoji: '⚡',
  },
];

interface ProgressStoryProps {
  variant?: 'full' | 'compact';
}

export default function ProgressStory({ variant = 'full' }: ProgressStoryProps) {
  const { entries } = useAppStore();
  const { choices, triggers } = useCompassStore();

  const { currentStage, weeksActive, progress } = useMemo(() => {
    // Calculate weeks since first activity
    const allDates = [
      ...entries.map(e => new Date(e.entryDatetime)),
      ...triggers.map(t => new Date(t.created_at)),
      ...choices.map(c => new Date(c.created_at)),
    ].filter(d => !isNaN(d.getTime()));

    if (allDates.length === 0) {
      return { currentStage: 0, weeksActive: 0, progress: 0 };
    }

    const earliest = Math.min(...allDates.map(d => d.getTime()));
    const now = Date.now();
    const weeksActive = Math.floor((now - earliest) / (7 * 24 * 60 * 60 * 1000)) + 1;

    // Determine current stage based on weeks
    let currentStage = 0;
    if (weeksActive >= 12) currentStage = 3;
    else if (weeksActive >= 6) currentStage = 2;
    else if (weeksActive >= 3) currentStage = 1;
    else currentStage = 0;

    // Calculate progress within current stage
    const stageWeeks = [1, 3, 6, 12];
    const currentWeekTarget = stageWeeks[currentStage];
    const prevWeekTarget = currentStage > 0 ? stageWeeks[currentStage - 1] : 0;
    const progress = Math.min(100, ((weeksActive - prevWeekTarget) / (currentWeekTarget - prevWeekTarget)) * 100);

    return { currentStage, weeksActive, progress };
  }, [entries, triggers, choices]);

  const current = JOURNEY_STAGES[currentStage];
  const hasStarted = entries.length > 0 || triggers.length > 0 || choices.length > 0;

  if (!hasStarted) {
    return (
      <div className="p-5 rounded-3xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 shadow-[var(--shadow-card)] text-center">
        <div className="text-4xl mb-4">🌱</div>
        <h3 className="font-serif font-bold text-lg mb-2">Your Story Begins</h3>
        <p className="text-sm text-muted-foreground">
          Every journey starts with showing up. <br />
          Log your first check-in to begin.
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{current.emoji}</div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Week {weeksActive}
            </p>
            <p className="text-sm font-bold text-foreground">{current.identity}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-serif font-bold text-primary">{current.label}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 shadow-[var(--shadow-card)]">
      {/* Current stage highlight */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
        >
          <span className="text-xl">{current.emoji}</span>
          <span className="text-sm font-bold text-primary">Week {weeksActive}</span>
        </motion.div>
        <h3 className="text-xl font-serif font-bold text-foreground mb-1">
          {current.identity}
        </h3>
        <p className="text-sm text-muted-foreground">
          {current.description}
        </p>
      </div>

      {/* Journey timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        <div
          className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-primary to-compass transition-all duration-1000"
          style={{ height: `${((currentStage + 1) / JOURNEY_STAGES.length) * 100}%` }}
        />

        {/* Stages */}
        <div className="space-y-4 relative">
          {JOURNEY_STAGES.map((stage, idx) => {
            const isPast = idx < currentStage;
            const isCurrent = idx === currentStage;
            const isFuture = idx > currentStage;

            return (
              <motion.div
                key={stage.week}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-4 ${isFuture ? 'opacity-40' : ''}`}
              >
                {/* Node */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)] scale-110'
                      : isPast
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">{stage.emoji}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                      {stage.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Week {stage.week}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stage.identity}
                  </p>
                </div>

                {/* Checkmark for completed */}
                {isPast && (
                  <div className="w-5 h-5 rounded-full bg-compass/20 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Encouragement */}
      {currentStage < JOURNEY_STAGES.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-3 rounded-xl bg-compass/5 border border-compass/10 text-center"
        >
          <p className="text-xs text-muted-foreground">
            <span className="text-compass font-semibold">
              {JOURNEY_STAGES[currentStage + 1].week - weeksActive > 0
                ? `${JOURNEY_STAGES[currentStage + 1].week - weeksActive} week${JOURNEY_STAGES[currentStage + 1].week - weeksActive !== 1 ? 's' : ''}`
                : 'Almost there'}
            </span>
            {' '}until you become <span className="font-medium text-foreground">{JOURNEY_STAGES[currentStage + 1].identity}</span>
          </p>
        </motion.div>
      )}

      {currentStage === JOURNEY_STAGES.length - 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-compass/10 to-accent/10 border border-primary/20 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            🎯 You have completed the rewiring journey.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The old patterns do not run you anymore. You do.
          </p>
        </motion.div>
      )}
    </div>
  );
}
