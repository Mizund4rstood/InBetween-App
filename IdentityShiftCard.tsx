import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { callReflect } from '@/lib/reflectService';
import { calculateStreak } from '@/lib/analytics';
import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';
import ListenButton from '@/components/ListenButton';
import MediaSourceBadges from '@/components/MediaSourceBadges';

export default function IdentityShiftCard() {
  const { entries } = useAppStore();
  const streak = calculateStreak(entries.map(e => e.entryDatetime));
  const [shift, setShift] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked || entries.length < 10) return;
    setChecked(true);
    setLoading(true);

    callReflect({
      type: 'identity_shift',
      entries,
      streak,
    })
      .then(setShift)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entries.length]);

  if (!shift && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/10 shadow-[var(--shadow-card)]"
    >
      {loading ? (
        <div className="flex items-center gap-2 py-1">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-[11px] text-muted-foreground">Reading your data...</span>
        </div>
      ) : shift && (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0 mt-0.5">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">The shift</p>
              <ListenButton text={shift} />
            </div>
            <p className="text-[11px] text-foreground leading-relaxed font-serif">{shift}</p>
            <MediaSourceBadges />
          </div>
        </div>
      )}
    </motion.div>
  );
}
