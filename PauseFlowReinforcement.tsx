import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { haptics } from './haptics';
import { sounds } from './sounds';
import { supabase } from './client';

interface Props {
  onContinue: () => void;
  todayCount: number;
}

export default function PauseFlowReinforcement({ onContinue, todayCount }: Props) {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowCheck(true);
      haptics.success();
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
    >
      {/* Check animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8"
      >
        {showCheck && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Check className="w-10 h-10 text-primary" strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>

      <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
        Small pauses create big changes.
      </h2>
      
      <p className="text-sm text-muted-foreground mb-2">Pause logged ✔</p>

      {todayCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 px-5 py-2.5 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
        >
          <p className="text-sm font-medium text-foreground">
            You created space <span className="text-primary font-bold">{todayCount}</span> {todayCount === 1 ? 'time' : 'times'} today.
          </p>
        </motion.div>
      )}

      <button
        onClick={() => { haptics.light(); onContinue(); }}
        className="mt-10 px-8 py-3.5 rounded-2xl bg-card border border-border font-medium text-muted-foreground flex items-center gap-2 active:scale-[0.98] transition-all"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
