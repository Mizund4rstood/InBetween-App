import { useMemo, useEffect, useState } from 'react';
import { useCompassStore } from './compassStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass } from 'lucide-react';

interface BehaviorCompassProps {
  /** Show immediate feedback overlay after a choice */
  showFeedback?: boolean;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
}

const FEEDBACK_MESSAGES = {
  aligned: [
    "You chose awareness instead of reaction.",
    "Values-aligned. You're becoming who you want to be.",
    "Intentional choice logged. Compass pointing north.",
    "You paused and chose differently. That's growth.",
    "Aligned with your values. The needle moves north.",
  ],
  reactive: [
    "Noticed the pattern. That's the first step.",
    "Awareness without judgment. You're learning.",
    "The compass drifted south, but you're still navigating.",
    "Reactivity logged. The map is forming.",
    "South today doesn't erase yesterday's north.",
  ],
};

export default function BehaviorCompass({ showFeedback = true, size = 'md' }: BehaviorCompassProps) {
  const { choices, fetchChoices } = useCompassStore();
  const [feedbackState, setFeedbackState] = useState<{ message: string; aligned: boolean } | null>(null);
  const [prevChoiceCount, setPrevChoiceCount] = useState(choices.length);

  useEffect(() => {
    fetchChoices();
  }, []);

  // Calculate compass direction: -90 (south) to 90 (north)
  const { direction, weeklyTrend, alignmentRate } = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekChoices = choices.filter(c => new Date(c.created_at) >= oneWeekAgo);
    const totalChoices = weekChoices.length;

    if (totalChoices === 0) {
      return { direction: 0, weeklyTrend: 0, alignmentRate: 0 };
    }

    const alignedCount = weekChoices.filter(c => c.aligned_with_values).length;
    const alignmentRate = alignedCount / totalChoices;

    // Map 0-1 to -75 to 75 degrees (leave room at extremes)
    const direction = (alignmentRate - 0.5) * 150;

    // Calculate trend: compare first half of week to second half
    const midWeek = new Date();
    midWeek.setDate(midWeek.getDate() - 3.5);

    const firstHalf = weekChoices.filter(c => new Date(c.created_at) < midWeek);
    const secondHalf = weekChoices.filter(c => new Date(c.created_at) >= midWeek);

    const firstRate = firstHalf.length > 0 ? firstHalf.filter(c => c.aligned_with_values).length / firstHalf.length : 0;
    const secondRate = secondHalf.length > 0 ? secondHalf.filter(c => c.aligned_with_values).length / secondHalf.length : 0;

    const weeklyTrend = secondRate - firstRate; // -1 to 1

    return { direction, weeklyTrend, alignmentRate };
  }, [choices]);

  // Detect new choice and show feedback
  useEffect(() => {
    if (choices.length > prevChoiceCount && showFeedback) {
      const latestChoice = choices[0];
      const isAligned = latestChoice?.aligned_with_values ?? false;
      const messages = isAligned ? FEEDBACK_MESSAGES.aligned : FEEDBACK_MESSAGES.reactive;
      const message = messages[Math.floor(Math.random() * messages.length)];

      setFeedbackState({ message, aligned: isAligned });

      const timer = setTimeout(() => setFeedbackState(null), 3500);
      return () => clearTimeout(timer);
    }
    setPrevChoiceCount(choices.length);
  }, [choices.length, prevChoiceCount, showFeedback]);

  const sizeClasses = {
    sm: 'w-28 h-28',
    md: 'w-40 h-40',
    lg: 'w-52 h-52',
  };

  const compassSize = sizeClasses[size];

  return (
    <div className="relative flex flex-col items-center">
      {/* Compass Container */}
      <div className={`relative ${compassSize}`}>
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-compass/20 via-primary/10 to-accent/15 blur-xl animate-pulse" />

        {/* Compass body */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-card via-card to-muted border-2 border-compass/20 shadow-[0_8px_32px_-8px_hsl(var(--compass)/0.25)] flex items-center justify-center overflow-hidden">
          {/* Cardinal points */}
          <span className="absolute top-2 text-[10px] font-bold text-compass tracking-wider">N</span>
          <span className="absolute bottom-2 text-[10px] font-semibold text-muted-foreground tracking-wider">S</span>
          <span className="absolute left-3 text-[10px] font-semibold text-muted-foreground">W</span>
          <span className="absolute right-3 text-[10px] font-semibold text-muted-foreground">E</span>

          {/* Inner dial markings */}
          <div className="absolute inset-4 rounded-full border border-border/30" />
          <div className="absolute inset-8 rounded-full border border-border/20" />

          {/* Compass needle */}
          <motion.div
            className="absolute w-1.5 h-[45%] origin-bottom"
            style={{ bottom: '50%' }}
            animate={{ rotate: -direction }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          >
            {/* North (aligned) end - vibrant */}
            <div className="w-full h-1/2 bg-gradient-to-t from-compass to-compass-dark rounded-t-full shadow-[0_0_8px_hsl(var(--compass)/0.5)]" />
          </motion.div>

          <motion.div
            className="absolute w-1.5 h-[45%] origin-top"
            style={{ top: '50%' }}
            animate={{ rotate: -direction }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          >
            {/* South (reactive) end - muted */}
            <div className="w-full h-1/2 bg-gradient-to-b from-destructive/60 to-destructive/40 rounded-b-full" />
          </motion.div>

          {/* Center pivot */}
          <div className="absolute w-4 h-4 rounded-full bg-card border-2 border-compass shadow-lg z-10" />
        </div>
      </div>

      {/* Weekly trend indicator */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-compass" />
          <span className="text-sm font-semibold text-foreground">
            {alignmentRate > 0.7 ? 'Heading North' : alignmentRate > 0.4 ? 'Finding Direction' : alignmentRate > 0 ? 'Recalibrating' : 'Set Your Course'}
          </span>
        </div>
        {choices.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {Math.round(alignmentRate * 100)}% aligned this week
            {weeklyTrend > 0.1 && <span className="text-compass ml-1">↑ improving</span>}
            {weeklyTrend < -0.1 && <span className="text-destructive/70 ml-1">↓ drifting</span>}
          </p>
        )}
      </div>

      {/* Feedback overlay */}
      <AnimatePresence>
        {feedbackState && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 p-3 rounded-2xl text-center shadow-lg border ${
              feedbackState.aligned
                ? 'bg-compass/10 border-compass/20 text-compass'
                : 'bg-accent/10 border-accent/20 text-foreground'
            }`}
          >
            <p className="text-sm font-medium leading-relaxed">{feedbackState.message}</p>
            <motion.div
              className={`mt-2 text-lg ${feedbackState.aligned ? '' : 'opacity-70'}`}
              animate={{ y: feedbackState.aligned ? [-2, 2, -2] : [2, -2, 2] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              {feedbackState.aligned ? '🧭↑' : '🧭↓'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
