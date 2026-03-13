import { useMemo, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useCompassStore } from '@/stores/compassStore';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Moon, Sun, Palette, Wind, Eye, Dumbbell, Calendar, Clock, Compass, Brain, Sparkles, Shield } from 'lucide-react';

interface Insight {
  icon: typeof TrendingUp;
  text: string;
  type: 'positive' | 'neutral' | 'info' | 'predictive';
}

export default function ToolInsights() {
  const { entries, groundingSessions } = useAppStore();
  const { triggers, choices, fetchTriggers, fetchChoices } = useCompassStore();

  useEffect(() => {
    fetchTriggers();
    fetchChoices();
  }, [fetchTriggers, fetchChoices]);

  const insights = useMemo(() => {
    const result: Insight[] = [];
    if (entries.length < 3 && groundingSessions.length < 2 && triggers.length < 2) return result;

    // ── Grounding effectiveness ──
    if (groundingSessions.length >= 2) {
      const byType: Record<string, { preMoods: number[]; postMoods: number[] }> = {};
      groundingSessions.forEach((s) => {
        const type = s.type || 'breathing';
        if (!byType[type]) byType[type] = { preMoods: [], postMoods: [] };
        if (s.preMood != null && s.postMood != null) {
          byType[type].preMoods.push(s.preMood);
          byType[type].postMoods.push(s.postMood);
        }
      });

      Object.entries(byType).forEach(([type, data]) => {
        if (data.preMoods.length >= 2) {
          const avgPre = data.preMoods.reduce((a, b) => a + b, 0) / data.preMoods.length;
          const avgPost = data.postMoods.reduce((a, b) => a + b, 0) / data.postMoods.length;
          const improvement = avgPost - avgPre;
          const label = type === 'breathing' ? 'breathing sessions' : type === 'sensory' ? 'grounding exercises' : type === '54321' ? '5-4-3-2-1 exercises' : `${type} sessions`;
          const icon = type === 'breathing' ? Wind : type === 'sensory' ? Eye : type === '54321' ? Eye : Dumbbell;

          if (improvement > 0.3) {
            result.push({
              icon,
              text: `${label.charAt(0).toUpperCase() + label.slice(1)} appear to help — your mood improves by ${improvement.toFixed(1)} points after them.`,
              type: 'positive',
            });
          }
        }
      });
    }

    // ── Day-of-week stress patterns ──
    if (entries.length >= 5) {
      const byDay: Record<number, { moods: number[]; stress: number[] }> = {};
      entries.forEach(e => {
        const day = new Date(e.entryDatetime).getDay();
        if (!byDay[day]) byDay[day] = { moods: [], stress: [] };
        byDay[day].moods.push(e.mood);
        byDay[day].stress.push(e.stress);
      });

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let worstDay = -1, worstStress = 0, bestDay = -1, bestMood = 0;

      Object.entries(byDay).forEach(([day, data]) => {
        if (data.stress.length >= 2) {
          const avgStress = data.stress.reduce((a, b) => a + b, 0) / data.stress.length;
          if (avgStress > worstStress) { worstStress = avgStress; worstDay = parseInt(day); }
        }
        if (data.moods.length >= 2) {
          const avgMood = data.moods.reduce((a, b) => a + b, 0) / data.moods.length;
          if (avgMood > bestMood) { bestMood = avgMood; bestDay = parseInt(day); }
        }
      });

      if (worstDay >= 0 && worstStress > 5) {
        result.push({
          icon: Calendar,
          text: `You tend to experience more stress on ${days[worstDay]}s. Scheduling a grounding session may help.`,
          type: 'info',
        });
      }

      if (bestDay >= 0 && bestMood > 6) {
        result.push({
          icon: Sun,
          text: `${days[bestDay]}s are your strongest day — mood averages ${bestMood.toFixed(1)}/10.`,
          type: 'positive',
        });
      }
    }

    // ── Time-of-day patterns ──
    if (entries.length >= 7) {
      const byPeriod: Record<string, number[]> = { morning: [], afternoon: [], evening: [], night: [] };
      entries.forEach(e => {
        const hour = new Date(e.entryDatetime).getHours();
        const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
        byPeriod[period].push(e.stress);
      });

      let highPeriod = '', highStress = 0;
      Object.entries(byPeriod).forEach(([period, stresses]) => {
        if (stresses.length >= 2) {
          const avg = stresses.reduce((a, b) => a + b, 0) / stresses.length;
          if (avg > highStress) { highStress = avg; highPeriod = period; }
        }
      });

      if (highPeriod && highStress > 5) {
        result.push({
          icon: highPeriod === 'evening' || highPeriod === 'night' ? Moon : Clock,
          text: `Stress peaks in the ${highPeriod}. A pre-emptive grounding session around that time could help.`,
          type: 'predictive',
        });
      }
    }

    // ── Grounding → next-day stress correlation ──
    if (entries.length >= 5 && groundingSessions.length >= 2) {
      const sessionDates = new Set(
        groundingSessions.map(s => new Date(s.sessionDatetime).toDateString())
      );

      const afterGrounding: number[] = [];
      const afterNoGrounding: number[] = [];

      entries.forEach((e, i) => {
        if (i === 0) return;
        const prevDate = new Date(entries[i - 1].entryDatetime).toDateString();
        if (sessionDates.has(prevDate)) {
          afterGrounding.push(e.stress);
        } else {
          afterNoGrounding.push(e.stress);
        }
      });

      if (afterGrounding.length >= 2 && afterNoGrounding.length >= 2) {
        const avgAfter = afterGrounding.reduce((a, b) => a + b, 0) / afterGrounding.length;
        const avgWithout = afterNoGrounding.reduce((a, b) => a + b, 0) / afterNoGrounding.length;
        const diff = avgWithout - avgAfter;

        if (diff > 0.8) {
          result.push({
            icon: TrendingUp,
            text: `Days after grounding sessions show ${diff.toFixed(1)} points less stress. The practice is working.`,
            type: 'positive',
          });
        }
      }
    }

    // ── Compass: pause usage trend ──
    if (choices.length >= 3) {
      const pauseCount = choices.filter(c => c.pause_used).length;
      const pauseRate = pauseCount / choices.length;

      if (pauseRate > 0.5) {
        result.push({
          icon: Shield,
          text: `You use the pause ${Math.round(pauseRate * 100)}% of the time when triggered. That's real awareness in action.`,
          type: 'positive',
        });
      }

      // Values alignment
      const alignedCount = choices.filter(c => c.aligned_with_values).length;
      const alignRate = alignedCount / choices.length;
      if (alignRate > 0.4) {
        result.push({
          icon: Compass,
          text: `${Math.round(alignRate * 100)}% of your recent choices aligned with your values. You're choosing, not reacting.`,
          type: 'positive',
        });
      }

      // Chose differently
      const diffCount = choices.filter(c => c.chose_differently).length;
      if (diffCount >= 2) {
        result.push({
          icon: Brain,
          text: `You've chosen a different response ${diffCount} times. Each one rewires the pattern a little more.`,
          type: 'positive',
        });
      }
    }

    // ── Trigger emotion patterns ──
    if (triggers.length >= 3) {
      const emotionCounts: Record<string, number> = {};
      triggers.forEach(t => {
        if (t.emotion) {
          emotionCounts[t.emotion] = (emotionCounts[t.emotion] || 0) + 1;
        }
      });

      const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0 && sorted[0][1] >= 2) {
        result.push({
          icon: Eye,
          text: `"${sorted[0][0]}" is your most frequent trigger emotion (${sorted[0][1]} times). Recognizing it is the first step to working with it.`,
          type: 'info',
        });
      }
    }

    // ── Trigger time patterns ──
    if (triggers.length >= 5) {
      const byPeriod: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
      triggers.forEach(t => {
        const hour = new Date(t.created_at).getHours();
        const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
        byPeriod[period]++;
      });

      const peak = Object.entries(byPeriod).sort((a, b) => b[1] - a[1])[0];
      if (peak && peak[1] >= 3) {
        result.push({
          icon: Clock,
          text: `Most of your triggers happen in the ${peak[0]}. Awareness of this timing gives you an advantage.`,
          type: 'predictive',
        });
      }
    }

    // ── Gratitude correlation ──
    if (entries.length >= 5) {
      const withGratitude = entries.filter(e => e.items && e.items.length > 0);
      const withoutGratitude = entries.filter(e => !e.items || e.items.length === 0);

      if (withGratitude.length >= 2 && withoutGratitude.length >= 2) {
        const avgWith = withGratitude.reduce((a, e) => a + e.mood, 0) / withGratitude.length;
        const avgWithout = withoutGratitude.reduce((a, e) => a + e.mood, 0) / withoutGratitude.length;
        const diff = avgWith - avgWithout;

        if (diff > 0.5) {
          result.push({
            icon: Sparkles,
            text: `Check-ins with gratitude reflections show ${diff.toFixed(1)} points higher mood. That practice matters.`,
            type: 'positive',
          });
        }
      }
    }

    return result.slice(0, 6);
  }, [entries, groundingSessions, triggers, choices]);

  if (insights.length === 0) return null;

  const typeColors = {
    positive: 'bg-primary/10 text-primary',
    neutral: 'bg-muted text-muted-foreground',
    info: 'bg-accent/10 text-accent',
    predictive: 'bg-compass/10 text-compass',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-3xl bg-gradient-to-br from-primary/8 via-card to-accent/8 border border-primary/15 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/15">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-sm">What You're Learning About Yourself</h3>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4 ml-9">
        Patterns from your check-ins, sessions & compass choices
      </p>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3"
          >
            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${typeColors[insight.type]}`}>
              <insight.icon className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{insight.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Based on {entries.length} check-in{entries.length !== 1 ? 's' : ''}{groundingSessions.length > 0 ? `, ${groundingSessions.length} session${groundingSessions.length !== 1 ? 's' : ''}` : ''}{triggers.length > 0 ? `, ${triggers.length} trigger${triggers.length !== 1 ? 's' : ''}` : ''}
        </p>
        <p className="text-[10px] text-primary/50 text-center mt-1 italic">
          Curiosity works better than criticism.
        </p>
      </div>
    </motion.div>
  );
}
