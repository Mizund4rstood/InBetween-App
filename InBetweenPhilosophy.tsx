import { motion } from 'framer-motion';

interface InBetweenPhilosophyProps {
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
}

export default function InBetweenPhilosophy({ variant = 'full', className = '' }: InBetweenPhilosophyProps) {
  if (variant === 'minimal') {
    return (
      <p className={`text-sm text-muted-foreground italic ${className}`}>
        Between impulse and action, there is a space. That space is your power.
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 ${className}`}>
        <p className="text-sm font-medium text-foreground leading-relaxed">
          Most people think behavior is automatic. <span className="text-primary font-semibold">It isn't.</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          There's always a tiny gap between impulse and action. That's where you live now.
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      {/* The moment visualization */}
      <div className="relative mx-auto mb-8 flex items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center"
        >
          <span className="text-2xl">⚡</span>
          <span className="absolute -bottom-6 text-[10px] text-muted-foreground font-semibold">IMPULSE</span>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative"
        >
          <div className="w-24 h-1 bg-gradient-to-r from-destructive/30 via-primary to-compass/30 rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs font-bold text-primary">
              The InBetween
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-16 h-16 rounded-2xl bg-compass/10 flex items-center justify-center"
        >
          <span className="text-2xl">🎯</span>
          <span className="absolute -bottom-6 text-[10px] text-muted-foreground font-semibold">ACTION</span>
        </motion.div>
      </div>

      <div className="mt-12 space-y-4 max-w-xs mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-serif font-bold text-foreground"
        >
          The Moment That Matters
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          Most people think behavior is automatic. <br />
          <span className="text-foreground font-medium">It isn't.</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          Between every impulse and every action, there's a <span className="text-primary font-semibold">tiny gap</span>.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-sm text-foreground font-medium leading-relaxed"
        >
          This app helps you find that gap. <br />
          Expand it. <br />
          And live in it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 }}
          className="pt-4"
        >
          <p className="text-xs text-primary/80 font-semibold tracking-wide uppercase">
            That's the InBetween.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
