import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Calendar, Heart, Zap, TrendingUp, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Pattern {
  id: string;
  type: 'TIME_BASED' | 'DAY_BASED' | 'EMOTION_TRIGGER' | 'REGULATION_SUCCESS' | 'CHOICE_PATTERN' | 'MOOD_CYCLE';
  title: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  suggestion?: string;
  dataPoints?: number;
}

interface PatternsResponse {
  patterns: Pattern[];
  summary?: string;
  dataPoints?: number;
  threshold?: number;
  message?: string;
  analyzedAt?: string;
  error?: string;
}

const PATTERN_ICONS: Record<string, typeof Clock> = {
  TIME_BASED: Clock,
  DAY_BASED: Calendar,
  EMOTION_TRIGGER: Heart,
  REGULATION_SUCCESS: Zap,
  CHOICE_PATTERN: TrendingUp,
  MOOD_CYCLE: Sparkles,
};

const CONFIDENCE_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent/20 text-accent',
  high: 'bg-compass/20 text-compass',
};

export default function PatternMirror() {
  const { entries, groundingSessions } = useAppStore();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);
  const [notEnoughData, setNotEnoughData] = useState<{ message: string; current: number; threshold: number } | null>(null);

  const analyzePatterns = async () => {
    setLoading(true);
    setNotEnoughData(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to analyze patterns');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/patterns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          entries: entries.slice(0, 50),
          groundingSessions: groundingSessions.slice(0, 30),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit reached. Try again in a minute.');
          return;
        }
        if (response.status === 402) {
          toast.error('AI credits depleted.');
          return;
        }
        throw new Error('Analysis failed');
      }

      const data: PatternsResponse = await response.json();

      if (data.message && data.threshold) {
        // Not enough data
        setNotEnoughData({
          message: data.message,
          current: data.dataPoints || 0,
          threshold: data.threshold,
        });
        setPatterns([]);
        setSummary(null);
      } else {
        setPatterns(data.patterns || []);
        setSummary(data.summary || null);
        setLastAnalyzed(data.analyzedAt || new Date().toISOString());
        if (data.patterns?.length > 0) {
          setExpanded(true);
        }
      }
    } catch (err) {
      console.error('Pattern analysis error:', err);
      toast.error('Could not analyze patterns right now');
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze on mount if we have enough local data
  useEffect(() => {
    const totalLocal = entries.length + groundingSessions.length;
    if (totalLocal >= 5 && patterns.length === 0 && !lastAnalyzed) {
      // Small delay to not overwhelm on page load
      const timer = setTimeout(analyzePatterns, 2000);
      return () => clearTimeout(timer);
    }
  }, [entries.length, groundingSessions.length]);

  // Not enough data state
  if (notEnoughData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-muted/50 via-card to-card border border-border/50 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Pattern Mirror</h3>
            <p className="text-xs text-muted-foreground">Your behavioral patterns</p>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="text-3xl mb-3">🔍</div>
          <p className="text-sm font-medium text-foreground mb-2">{notEnoughData.message}</p>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (notEnoughData.current / notEnoughData.threshold) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {notEnoughData.current} / {notEnoughData.threshold} data points
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-3xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 shadow-[var(--shadow-card)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Pattern Mirror</h3>
            <p className="text-xs text-muted-foreground">
              {patterns.length > 0 ? `${patterns.length} patterns detected` : 'Discover your patterns'}
            </p>
          </div>
        </div>
        <button
          onClick={analyzePatterns}
          disabled={loading}
          className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-foreground bg-primary/5 rounded-xl px-4 py-3 mb-4 leading-relaxed"
        >
          💡 {summary}
        </motion.p>
      )}

      {/* Patterns list */}
      {patterns.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs text-muted-foreground mb-3"
          >
            <span>{expanded ? 'Hide details' : 'Show all patterns'}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {patterns.map((pattern, idx) => {
                  const Icon = PATTERN_ICONS[pattern.type] || Sparkles;
                  const confidenceClass = CONFIDENCE_COLORS[pattern.confidence] || CONFIDENCE_COLORS.low;

                  return (
                    <motion.div
                      key={pattern.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl bg-card border border-border/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                          <Icon className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm text-foreground">{pattern.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${confidenceClass}`}>
                              {pattern.confidence}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            {pattern.description}
                          </p>
                          {pattern.suggestion && (
                            <p className="text-xs text-compass bg-compass/10 rounded-lg px-3 py-2">
                              💡 {pattern.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Empty state with CTA */}
      {patterns.length === 0 && !loading && !notEnoughData && (
        <div className="text-center py-4">
          <button
            onClick={analyzePatterns}
            className="px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Analyze My Patterns
          </button>
        </div>
      )}

      {/* Last analyzed */}
      {lastAnalyzed && (
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Last analyzed: {new Date(lastAnalyzed).toLocaleString()}
        </p>
      )}
    </motion.div>
  );
}
