import { motion } from 'framer-motion';
import { Play, Compass } from 'lucide-react';
import { haptics } from './haptics';
import { sounds } from './sounds';

interface Props {
  onStart: () => void;
  onSkip: () => void;
}

export default function PauseFlowEntry({ onStart, onSkip }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
    >
      {/* Soft glowing orb */}
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-full bg-primary/10 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-primary/15" />
        <div className="absolute inset-5 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-2xl">🌿</span>
        </div>
      </div>

      <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
        Pause for a moment.
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed max-w-xs mb-12">
        You're in the space between impulse and choice.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => { haptics.medium(); sounds.tap(); onStart(); }}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
        >
          <Play className="w-5 h-5" />
          Start 60-second reset
        </button>
        <button
          onClick={() => { haptics.light(); onSkip(); }}
          className="w-full py-3.5 rounded-2xl bg-card border border-border text-muted-foreground font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Compass className="w-4 h-4" />
          Skip → Go to Compass
        </button>
      </div>
    </motion.div>
  );
}
