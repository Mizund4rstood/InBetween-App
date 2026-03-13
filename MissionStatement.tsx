import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface MissionStatementProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export default function MissionStatement({ variant = 'full', className = '' }: MissionStatementProps) {
  if (variant === 'compact') {
    return (
      <p className={`text-xs text-muted-foreground italic leading-relaxed ${className}`}>
        This app exists to help you notice the moment between impulse and action. In that space, awareness creates the freedom to choose.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/8 border border-primary/20 p-6 ${className}`}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Our Mission</span>
        </div>

        <p className="text-base font-serif text-foreground leading-relaxed mb-3">
          InBetween helps people become aware of their impulses and emotional patterns so they can{' '}
          <span className="text-primary font-semibold">pause</span>,{' '}
          <span className="text-primary font-semibold">reflect</span>, and{' '}
          <span className="text-primary font-semibold">choose their direction</span>{' '}
          instead of reacting automatically.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed italic">
          This app exists to help you notice the moment between impulse and action. In that space, awareness creates the freedom to choose.
        </p>
      </div>
    </motion.div>
  );
}
