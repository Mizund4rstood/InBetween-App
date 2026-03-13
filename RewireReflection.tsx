import { useState, useEffect } from 'react';
import { useRewireStore } from './rewireStore';
import { callReflect } from './reflectService';
import { motion } from 'framer-motion';
import { Brain, Loader2, RefreshCw } from 'lucide-react';
import ListenButton from './ListenButton';
import MediaSourceBadges from './MediaSourceBadges';

export default function RewireReflection() {
  const { urges, getPhase, getWeek, getMetrics, activeUrgeTypes } = useRewireStore();
  const [reflection, setReflection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const phase = getPhase();
  const week = getWeek();
  const metrics = getMetrics();

  // Auto-fetch on mount if enough data
  useEffect(() => {
    if (fetched || urges.length < 3) return;
    fetchReflection();
  }, [urges.length]);

  const fetchReflection = async () => {
    setLoading(true);
    setError(null);
    setFetched(true);

    try {
      const result = await callReflect({
        type: 'rewire_reflection',
        // Pack data into the payload fields the edge function expects
        entries: urges.slice(0, 50) as any, // urge entries
        streak: week, // current week
        regulationHistory: [JSON.stringify({
          phase,
          totalUrges: metrics.totalUrges,
          avgDelaySec: metrics.avgDelaySec,
          avgDelaySecRecent: metrics.avgDelaySecRecent,
          delayStrengthScore: metrics.delayStrengthScore,
          replacementRate: metrics.replacementRate,
          replacementRateRecent: metrics.replacementRateRecent,
          actedOnUrgeRate: metrics.actedOnUrgeRate,
          actedOnUrgeRateRecent: metrics.actedOnUrgeRateRecent,
          topReplacements: metrics.topReplacements,
          avgIntensity: metrics.avgIntensity,
          avgIntensityRecent: metrics.avgIntensityRecent,
        })],
        groundingSessions: activeUrgeTypes as any,
      });
      setReflection(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reflection');
    } finally {
      setLoading(false);
    }
  };

  // Don't show if not enough data
  if (urges.length < 3 && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/10 shadow-[var(--shadow-card)]"
    >
      {loading ? (
        <div className="flex items-center gap-2 py-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-[11px] text-muted-foreground">Reading your patterns...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-between py-2">
          <span className="text-[11px] text-muted-foreground">{error}</span>
          <button onClick={fetchReflection} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ) : reflection ? (
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0 mt-0.5">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Week {week} read</p>
              <div className="flex items-center gap-1.5">
                <ListenButton text={reflection} />
                <button
                  onClick={fetchReflection}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-foreground leading-relaxed font-serif whitespace-pre-line">{reflection}</p>
            <MediaSourceBadges />
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
