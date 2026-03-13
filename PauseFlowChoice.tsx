import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
import { haptics } from './haptics';
import { sounds } from './sounds';

interface Props {
  feeling: string;
  onDeeper: () => void;
  onDone: () => void;
}

export default function PauseFlowChoice({ feeling, onDeeper, onDone }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
    >
      <div className="text-4xl mb-6">✨</div>
      <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
        You noticed the feeling.
      </h2>
      <p className="text-base text-muted-foreground leading-relaxed max-w-xs mb-10">
        That's the first step. Awareness is where change begins.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => { haptics.medium(); sounds.tap(); onDeeper(); }}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
        >
          <ArrowRight className="w-5 h-5" />
          Continue deeper
        </button>
        <button
          onClick={() => { haptics.light(); sounds.step(); onDone(); }}
          className="w-full py-3.5 rounded-2xl bg-card border border-border text-muted-foreground font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Home className="w-4 h-4" />
          I'm okay for now
        </button>
      </div>
    </motion.div>
  );
}
