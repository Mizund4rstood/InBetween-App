import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from './appStore';
import { computeCoreMetrics } from './metrics';
import { Shield } from 'lucide-react';

/**
 * Pause Ratio — the ONE metric that matters.
 * Shows on the home page. Minimal. Clear.
 */
export default function PauseRatioCard() {
  const { entries, groundingSessions } = useAppStore();

  const metrics = useMemo(
    () => computeCoreMetrics(entries, groundingSessions),
    [entries, groundingSessions]
  );

  const { pauseRatio } = metrics;

  if (pauseRatio.total < 2) return null;

  const pct = Math.round(pauseRatio.ratio * 100);
  const trend = pauseRatio.weekOverWeek;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/10 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Pause Ratio
          </span>
        </div>
        {trend !== null && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              trend > 0
                ? 'bg-primary/10 text-primary'
                : trend < 0
                  ? 'bg-accent/10 text-accent'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {trend > 0 ? '+' : ''}{Math.round(trend * 100)}% this week
          </span>
        )}
      </div>

      <div className="flex items-end gap-3 mb-2">
        <p className="text-4xl font-serif font-bold text-foreground">{pct}%</p>
        <p className="text-xs text-muted-foreground pb-1">
          of the time you pause or choose
        </p>
      </div>

      {/* Mini bar */}
      <div className="h-2 rounded-full bg-border/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="h-full rounded-full bg-primary/60"
        />
      </div>

      <div className="flex items-center gap-4 mt-2">
        <span className="text-[10px] text-muted-foreground">
          ✋ {pauseRatio.paused} paused
        </span>
        <span className="text-[10px] text-muted-foreground">
          🧭 {pauseRatio.chose} chose
        </span>
        <span className="text-[10px] text-muted-foreground">
          ⚡ {pauseRatio.reacted} reacted
        </span>
      </div>
    </motion.div>
  );
}
