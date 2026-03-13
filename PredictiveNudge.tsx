import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { callReflect } from '@/lib/reflectService';
import { calculateStreak } from '@/lib/analytics';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';
import ListenButton from '@/components/ListenButton';

interface PredictiveNudge {
  message: string;
  toolkit: string[];
  confidence: string;
}

export default function PredictiveNudgeCard() {
  const { entries } = useAppStore();
  const streak = calculateStreak(entries.map(e => e.entryDatetime));
  const [nudge, setNudge] = useState<PredictiveNudge | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked || entries.length < 7) return;
    setChecked(true);
    setLoading(true);

    callReflect({
      type: 'predictive_nudge',
      entries: entries.slice(0, 30),
      streak,
    })
      .then(result => {
        try {
          const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.nudge) setNudge(parsed.nudge);
        } catch {
          // No nudge if parse fails
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entries.length]);

  if (!nudge && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 via-card to-card border border-accent/15 shadow-[var(--shadow-card)]"
    >
      {loading ? (
        <div className="flex items-center gap-2 py-1">
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
          <span className="text-[11px] text-muted-foreground">Checking patterns...</span>
        </div>
      ) : nudge && (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-accent/10 shrink-0 mt-0.5">
            <Shield className="w-4 h-4 text-accent" />
          </div>
           <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">Heads-up</p>
                <ListenButton text={nudge.message} />
              </div>
            <p className="text-[11px] text-foreground leading-relaxed">{nudge.message}</p>
            {nudge.toolkit.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {nudge.toolkit.map(tool => (
                  <span key={tool} className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold capitalize">
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
