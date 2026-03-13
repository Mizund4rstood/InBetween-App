import { motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { sounds } from '@/lib/sounds';

const FEELINGS = [
  { label: 'Stressed', emoji: '😰' },
  { label: 'Angry', emoji: '😤' },
  { label: 'Overwhelmed', emoji: '🌊' },
  { label: 'Urge / Craving', emoji: '⚡', isUrge: true },
  { label: 'Sad', emoji: '😔' },
  { label: 'Other', emoji: '💭' },
];

interface Props {
  onSelect: (feeling: string, isUrge: boolean) => void;
}

export default function PauseFlowAwareness({ onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
    >
      <div className="text-4xl mb-6">🪞</div>
      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
        Right now I feel…
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Tap the one that fits. No wrong answer.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {FEELINGS.map((f) => (
          <motion.button
            key={f.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              haptics.medium();
              sounds.step();
              onSelect(f.label, !!f.isUrge);
            }}
            className="p-4 rounded-2xl bg-card border border-border/50 flex flex-col items-center gap-2 active:bg-muted transition-colors shadow-[var(--shadow-card)]"
          >
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-sm font-medium text-foreground">{f.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
