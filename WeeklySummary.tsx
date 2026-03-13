import { useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { tagText } from '@/lib/analytics';
import { generateInsights } from '@/lib/insights';
import SteadinessCard from '@/components/SteadinessCard';
import ListenButton from '@/components/ListenButton';
import { CalendarDays, Heart, Flame, TrendingUp, Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { RegulationState } from '@/types';

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

const REFLECTIONS = [
  "You checked in this week. Most people don't even do that.",
  "Paying attention is the hardest part. You did it.",
  "You showed up. That's the whole thing.",
  "The data doesn't lie. You're building something here.",
  "Your wiring remembers the moments you paused to check in.",
];

const REG_LABELS: Record<RegulationState, { emoji: string; label: string }> = {
  calm: { emoji: '😌', label: 'Level' },
  grounded: { emoji: '🌿', label: 'Solid' },
  activated: { emoji: '⚡', label: 'Wired' },
  dissociated: { emoji: '🌫️', label: 'Checked out' },
  hopeful: { emoji: '🌅', label: 'Hopeful' },
};

export default function WeeklySummary() {
  const { entries } = useAppStore();

  const stats = useMemo(() => {
    const days = getLast7Days();
    const weekEntries = entries.filter(e => {
      const d = e.entryDatetime.split('T')[0];
      return days.includes(d);
    });

    const activeDays = new Set(weekEntries.map(e => e.entryDatetime.split('T')[0])).size;
    const avgMood = weekEntries.length > 0
      ? Math.round(weekEntries.reduce((s, e) => s + e.mood, 0) / weekEntries.length * 10) / 10
      : null;
    const avgStress = weekEntries.length > 0
      ? Math.round(weekEntries.reduce((s, e) => s + e.stress, 0) / weekEntries.length * 10) / 10
      : null;
    const totalEntries = weekEntries.length;

    const moodByDay = days.map(d => {
      const dayEntries = weekEntries.filter(e => e.entryDatetime.split('T')[0] === d);
      return {
        day: getDayLabel(d),
        date: d,
        mood: dayEntries.length > 0
          ? Math.round(dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length * 10) / 10
          : null,
        count: dayEntries.length,
      };
    });

    const themeCounts: Record<string, number> = {};
    weekEntries.forEach(e => {
      e.items.forEach(item => {
        tagText(item.text).forEach(tag => {
          themeCounts[tag] = (themeCounts[tag] || 0) + 1;
        });
      });
    });
    const topThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);

    const regCounts: Record<string, number> = {};
    weekEntries.forEach(e => {
      if (e.regulationState) {
        regCounts[e.regulationState] = (regCounts[e.regulationState] || 0) + 1;
      }
    });
    const totalReg = Object.values(regCounts).reduce((a, b) => a + b, 0);
    const regBreakdown = Object.entries(regCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([state, count]) => ({
        state: state as RegulationState,
        count,
        pct: totalReg > 0 ? Math.round((count / totalReg) * 100) : 0,
      }));

    return { days, weekEntries, activeDays, avgMood, avgStress, totalEntries, moodByDay, topThemes, regBreakdown };
  }, [entries]);

  const insights = useMemo(() => generateInsights(entries), [entries]);
  const reflection = REFLECTIONS[new Date().getDay() % REFLECTIONS.length];
  const maxMood = 10;

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <CalendarDays className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide">This Week</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
          Weekly Report
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your last 7 days — straight up
        </p>
      </div>

      {stats.totalEntries === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 animate-float">🧭</div>
          <p className="text-foreground font-serif text-lg font-semibold">No check-ins this week</p>
          <p className="text-sm text-muted-foreground mt-2">Start checking in to see your weekly patterns</p>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/10 shadow-[var(--shadow-card)] text-center"
            >
              <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-2xl font-serif font-bold">{stats.activeDays}</p>
              <p className="text-[10px] text-muted-foreground">days active</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 via-card to-card border border-accent/10 shadow-[var(--shadow-card)] text-center"
            >
              <Heart className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-2xl font-serif font-bold">{stats.avgMood ?? '—'}</p>
              <p className="text-[10px] text-muted-foreground">avg mood</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] text-center"
            >
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-2xl font-serif font-bold">{stats.totalEntries}</p>
              <p className="text-[10px] text-muted-foreground">check-ins</p>
            </motion.div>
          </div>

          {/* Steadiness engine */}
          <div className="mb-6">
            <SteadinessCard />
          </div>

          {/* Mood sparkline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
          >
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Mood This Week</h2>
            <div className="flex items-end justify-between gap-2 h-24">
              {stats.moodByDay.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-1">
                  <div className="w-full flex items-end justify-center h-16">
                    {d.mood !== null ? (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.mood / maxMood) * 100}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                        className={`w-full max-w-[28px] rounded-lg ${
                          d.mood >= 7 ? 'bg-primary/60' : d.mood >= 4 ? 'bg-primary/30' : 'bg-accent/40'
                        }`}
                      />
                    ) : (
                      <div className="w-full max-w-[28px] h-1 rounded-full bg-border/50" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{d.day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Your wiring this week */}
          {stats.regBreakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
            >
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                <Brain className="w-3 h-3 inline mr-1" />
                Your Wiring This Week
              </h2>
              <div className="space-y-2.5">
                {stats.regBreakdown.map(({ state, count, pct }) => {
                  const meta = REG_LABELS[state];
                  return (
                    <div key={state} className="flex items-center gap-3">
                      <span className="text-lg shrink-0">{meta?.emoji || '❓'}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-foreground capitalize">
                            {meta?.label || state}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              state === 'grounded' || state === 'calm' || state === 'hopeful'
                                ? 'bg-primary/60'
                                : 'bg-accent/50'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Top themes */}
          {stats.topThemes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6 p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
            >
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 inline mr-1" />
                What Came Up
              </h2>
              <div className="flex flex-wrap gap-2">
                {stats.topThemes.map(theme => (
                  <span key={theme} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
                    {theme}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Pattern insights */}
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/10 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  ✨ Pattern Insights
                </h2>
                <ListenButton text={insights.map(i => i.message).join('. ')} />
              </div>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-lg shrink-0">{insight.emoji}</span>
                    <p className="text-[11px] text-foreground leading-relaxed">{insight.message}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Weekly reflection */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-5 rounded-3xl bg-gradient-to-br from-accent/8 via-card to-card border border-accent/15 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🔧</span>
              <ListenButton text={reflection} />
            </div>
            <p className="text-sm font-serif font-semibold text-foreground leading-relaxed">{reflection}</p>
          </motion.div>
        </>
      )}
    </div>
  );
}
