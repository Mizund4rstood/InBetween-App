import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface InBetweenBannerProps {
  className?: string;
}

export default function InBetweenBanner({ className = '' }: InBetweenBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-card to-accent/8 border border-primary/20 p-4 ${className}`}
    >
      {/* Subtle pulse animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <div className="relative flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/15 shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            Between impulse and action, there's a{' '}
            <span className="text-primary font-bold">space</span>.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This app helps you find it, expand it, and live in it.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
