import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from './haptics';

export type MicroWinType = 
  | 'pause_used'
  | 'aligned_choice'
  | 'chose_differently'
  | 'trigger_logged'
  | 'stayed_with_discomfort'
  | 'interrupted_spiral'
  | 'showed_up'
  | 'grounding_complete'
  | 'streak_continued'
  | 'first_of_day';

interface MicroWinProps {
  type: MicroWinType;
  context?: string; // e.g., "45 seconds", "3 days"
  onDismiss?: () => void;
  autoHide?: boolean;
  delay?: number;
}

const MICRO_WINS: Record<MicroWinType, { messages: string[]; emoji: string }> = {
  pause_used: {
    messages: [
      "You chose pause over reaction.",
      "The pause muscle got stronger.",
      "Space created. That's the work.",
      "You didn't just react. You chose.",
    ],
    emoji: "⏸️",
  },
  aligned_choice: {
    messages: [
      "Values-aligned. The compass points north.",
      "You chose who you want to be.",
      "That choice reflects your values.",
      "Aligned. This is who you're becoming.",
    ],
    emoji: "🧭",
  },
  chose_differently: {
    messages: [
      "You broke the pattern.",
      "Different choice, different wiring.",
      "The old loop didn't win this time.",
      "You chose differently. That's everything.",
    ],
    emoji: "🔄",
  },
  trigger_logged: {
    messages: [
      "Awareness logged. Pattern forming.",
      "You noticed. That's the intervention.",
      "Trigger captured. Data is power.",
      "Seeing the trigger is half the battle.",
    ],
    emoji: "👁️",
  },
  stayed_with_discomfort: {
    messages: [
      "You stayed with discomfort.",
      "Didn't run. Didn't numb. Just stayed.",
      "Tolerance built. Window expanded.",
      "You sat with it. That's regulation.",
    ],
    emoji: "🪨",
  },
  interrupted_spiral: {
    messages: [
      "You interrupted a spiral.",
      "Caught it before it caught you.",
      "The loop didn't complete.",
      "Spiral stopped. Awareness won.",
    ],
    emoji: "🌀",
  },
  showed_up: {
    messages: [
      "You showed up. That's the hardest part.",
      "Present. That's already a win.",
      "Here again. Building the habit.",
      "Showing up is the practice.",
    ],
    emoji: "✨",
  },
  grounding_complete: {
    messages: [
      "Nervous system: regulated.",
      "Body came back online.",
      "Grounded. Ready to respond.",
      "You gave yourself what you needed.",
    ],
    emoji: "🌱",
  },
  streak_continued: {
    messages: [
      "Another day. The wiring changes.",
      "Consistency compounds.",
      "One more link in the chain.",
      "You keep showing up.",
    ],
    emoji: "🔥",
  },
  first_of_day: {
    messages: [
      "First check-in of the day.",
      "Starting the day aware.",
      "Day begun with intention.",
      "Morning awareness activated.",
    ],
    emoji: "☀️",
  },
};

export default function MicroWin({ type, context, onDismiss, autoHide = true, delay = 0 }: MicroWinProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const winData = MICRO_WINS[type];

  useEffect(() => {
    // Pick random message
    const messages = winData.messages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);

    // Show after delay
    const showTimer = setTimeout(() => {
      setVisible(true);
      haptics.light();
    }, delay);

    // Auto-hide
    let hideTimer: NodeJS.Timeout;
    if (autoHide) {
      hideTimer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, delay + 3500);
    }

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [type, delay, autoHide]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm"
        >
          <div 
            className="p-4 rounded-2xl bg-card/95 backdrop-blur-lg border border-primary/20 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.3)] flex items-center gap-3"
            onClick={() => {
              setVisible(false);
              onDismiss?.();
            }}
          >
            <span className="text-2xl shrink-0">{winData.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">
                {message}
              </p>
              {context && (
                <p className="text-xs text-muted-foreground mt-0.5">{context}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for triggering micro-wins from anywhere
import { create } from 'zustand';

interface MicroWinState {
  queue: Array<{ type: MicroWinType; context?: string; id: string }>;
  trigger: (type: MicroWinType, context?: string) => void;
  dismiss: (id: string) => void;
}

export const useMicroWinStore = create<MicroWinState>((set) => ({
  queue: [],
  trigger: (type, context) => {
    const id = `${type}-${Date.now()}`;
    set((s) => ({ queue: [...s.queue, { type, context, id }] }));
  },
  dismiss: (id) => {
    set((s) => ({ queue: s.queue.filter((w) => w.id !== id) }));
  },
}));

// Provider component to render the queue
export function MicroWinProvider() {
  const { queue, dismiss } = useMicroWinStore();

  // Only show one at a time, first in queue
  const current = queue[0];

  if (!current) return null;

  return (
    <MicroWin
      key={current.id}
      type={current.type}
      context={current.context}
      onDismiss={() => dismiss(current.id)}
    />
  );
}
