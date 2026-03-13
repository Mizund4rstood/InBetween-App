import { useMemo, useState } from 'react';
import { useAppStore, AnalyticsWidget } from './appStore';
import { usePremiumStore } from './premiumStore';
import { PremiumGate } from './PremiumGate';
import { pearsonCorrelation, calculateStreak, tagText } from './analytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Flame, TrendingUp, Hash, Sparkles, Clock, Heart, MessageCircle, Shield, Settings2, Eye, EyeOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GratitudeEntry, RegulationState } from './types';
import CoreMetricsDashboard from './CoreMetricsDashboard';
import RestlessnessAnalytics from './RestlessnessAnalytics';

function getTimeOfDayLabel(hour: number): string {
  if (hour < 6) return 'Early morning';
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

function getTimeOfDayEmoji(label: string): string {
  switch (label) {
    case 'Early morning': return '🌅';
    case 'Morning': return '☀️';
    case 'Afternoon': return '🌤️';
    case 'Evening': return '🌇';
    case 'Night': return '🌙';
    default: return '⏰';
  }
}

interface PersonalInsights {
  topEmotion: { emotion: string; count: number } | null;
  bestTimeOfDay: { label: string; avgMood: number } | null;
  moodBoostingThemes: { theme: string; avgMood: number }[];
  topWords: { word: string; count: number }[];
  regulationPatterns: string[];
  topRegulationState: { state: RegulationState; count: number } | null;
}

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'and', 'or', 'but', 'not',
  'it', 'its', 'this', 'that', 'these', 'those', 'he', 'she', 'they', 'we', 'you',
  'his', 'her', 'their', 'our', 'your', 'has', 'have', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'can', 'may', 'might', 'shall', 'so', 'if',
  'about', 'up', 'out', 'no', 'just', 'than', 'them', 'then', 'also', 'into',
  'how', 'when', 'what', 'which', 'who', 'whom', 'where', 'why', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'very', 'really',
  'im', "i'm", 'ive', "i've", 'feeling', 'felt', 'today', 'being', 'having',
  'grateful', 'thankful', 'thank', 'thanks', 'because', 'much', 'many', 'get', 'got',
]);

function computePersonalInsights(entries: GratitudeEntry[]): PersonalInsights {
  const emotionCounts = new Map<string, number>();
  entries.forEach(e => {
    e.items.forEach(item => {
      if (item.emotion) {
        const em = item.emotion.toLowerCase().trim();
        emotionCounts.set(em, (emotionCounts.get(em) || 0) + 1);
      }
    });
  });
  const topEmotion = emotionCounts.size > 0
    ? [...emotionCounts.entries()].sort((a, b) => b[1] - a[1]).map(([emotion, count]) => ({ emotion, count }))[0]
    : null;

  const timeBuckets = new Map<string, { moods: number[] }>();
  entries.forEach(e => {
    const hour = new Date(e.entryDatetime).getHours();
    const label = getTimeOfDayLabel(hour);
    if (!timeBuckets.has(label)) timeBuckets.set(label, { moods: [] });
    timeBuckets.get(label)!.moods.push(e.mood);
  });
  const bestTimeOfDay = timeBuckets.size > 0
    ? [...timeBuckets.entries()]
        .map(([label, { moods }]) => ({ label, avgMood: moods.reduce((a, b) => a + b, 0) / moods.length }))
        .sort((a, b) => b.avgMood - a.avgMood)[0]
    : null;

  const themeMoods = new Map<string, number[]>();
  entries.forEach(e => {
    e.items.forEach(item => {
      tagText(item.text).forEach(tag => {
        if (!themeMoods.has(tag)) themeMoods.set(tag, []);
        themeMoods.get(tag)!.push(e.mood);
      });
    });
  });
  const moodBoostingThemes = [...themeMoods.entries()]
    .filter(([, moods]) => moods.length >= 2)
    .map(([theme, moods]) => ({ theme, avgMood: moods.reduce((a, b) => a + b, 0) / moods.length }))
    .sort((a, b) => b.avgMood - a.avgMood)
    .slice(0, 3);

  const wordCounts = new Map<string, number>();
  entries.forEach(e => {
    e.items.forEach(item => {
      const words = item.text.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/);
      words.forEach(w => {
        if (w.length > 2 && !STOP_WORDS.has(w)) {
          wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
        }
      });
    });
  });
  const topWords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }));

  // Regulation state analysis
  const regulationCounts = new Map<RegulationState, number>();
  const regulationByTime = new Map<string, Map<RegulationState, number>>();
  
  entries.forEach(e => {
    if (e.regulationState) {
      regulationCounts.set(e.regulationState, (regulationCounts.get(e.regulationState) || 0) + 1);
      const hour = new Date(e.entryDatetime).getHours();
      const timeLabel = getTimeOfDayLabel(hour);
      if (!regulationByTime.has(timeLabel)) regulationByTime.set(timeLabel, new Map());
      const timeMap = regulationByTime.get(timeLabel)!;
      timeMap.set(e.regulationState, (timeMap.get(e.regulationState) || 0) + 1);
    }
  });

  const topRegulationState = regulationCounts.size > 0
    ? [...regulationCounts.entries()].sort((a, b) => b[1] - a[1]).map(([state, count]) => ({ state, count }))[0]
    : null;

  const regulationPatterns: string[] = [];
  const positiveStates: RegulationState[] = ['grounded', 'calm'];
  regulationByTime.forEach((stateMap, timeLabel) => {
    const total = [...stateMap.values()].reduce((a, b) => a + b, 0);
    positiveStates.forEach(ps => {
      const count = stateMap.get(ps) || 0;
      if (count >= 3 && count / total >= 0.5) {
        regulationPatterns.push(
          `Your ${ps === 'grounded' ? 'grounding' : 'calm'} increases when you journal in the ${timeLabel.toLowerCase()}.`
        );
      }
    });
  });

  const alertStates: RegulationState[] = ['activated', 'dissociated'];
  regulationByTime.forEach((stateMap, timeLabel) => {
    const total = [...stateMap.values()].reduce((a, b) => a + b, 0);
    alertStates.forEach(as => {
      const count = stateMap.get(as) || 0;
      if (count >= 3 && count / total >= 0.4) {
        regulationPatterns.push(
          `You tend to feel ${as} when journaling in the ${timeLabel.toLowerCase()}. Consider a grounding exercise first.`
        );
      }
    });
  });

  if (topRegulationState?.state === 'hopeful') {
    regulationPatterns.push('Hope is your most common state — your practice is building something real.');
  }

  return { topEmotion, bestTimeOfDay, moodBoostingThemes, topWords, regulationPatterns, topRegulationState };
}

const REGULATION_SCORE: Record<string, number> = {
  grounded: 10, calm: 8, hopeful: 7, activated: 3, dissociated: 2,
};

const WIDGET_META: Record<AnalyticsWidget, { label: string; emoji: string }> = {
  mood: { label: 'Mood Graph', emoji: '📈' },
  habit: { label: 'Habit Consistency', emoji: '📅' },
  grounding: { label: 'Grounding Score', emoji: '🪨' },
  regulation: { label: 'Regulation Trend', emoji: '🧠' },
  correlation: { label: 'Correlations', emoji: '🔗' },
  themes: { label: 'Themes & Best Days', emoji: '🏷️' },
  bestDays: { label: 'Best Days', emoji: '🌟' },
};

export default function AnalyticsPage() {
  const { entries, groundingSessions, enabledWidgets, toggleWidget } = useAppStore();
  const [showCustomize, setShowCustomize] = useState(false);

  const isEnabled = (w: AnalyticsWidget) => enabledWidgets.includes(w);

  const stats = useMemo(() => {
    if (entries.length === 0) return null;

    const streak = calculateStreak(entries.map(e => e.entryDatetime));

    // Mood data
    const dayMap = new Map<string, { moods: number[]; stresses: number[] }>();
    entries.forEach(e => {
      const day = e.entryDatetime.split('T')[0];
      if (!dayMap.has(day)) dayMap.set(day, { moods: [], stresses: [] });
      const d = dayMap.get(day)!;
      d.moods.push(e.mood);
      d.stresses.push(e.stress);
    });
    const moodData = [...dayMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([day, { moods, stresses }]) => ({
        date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: Math.round(moods.reduce((a, b) => a + b, 0) / moods.length * 10) / 10,
        stress: Math.round(stresses.reduce((a, b) => a + b, 0) / stresses.length * 10) / 10,
      }));

    // Habit consistency — last 28 days heatmap data
    const today = new Date();
    const habitData: { day: string; label: string; hasEntry: boolean }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      habitData.push({
        day: key,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hasEntry: dayMap.has(key),
      });
    }
    const habitRate = Math.round((habitData.filter(d => d.hasEntry).length / 28) * 100);

    // Weekly entries
    const weekMap = new Map<string, number>();
    entries.forEach(e => {
      const d = new Date(e.entryDatetime);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      weekMap.set(key, (weekMap.get(key) || 0) + 1);
    });
    const weeklyData = [...weekMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, count]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      }));

    // Correlations
    const itemCounts = entries.map(e => e.items.length);
    const moods = entries.map(e => e.mood);
    const stresses = entries.map(e => e.stress);
    const moodCorr = pearsonCorrelation(itemCounts, moods);
    const stressCorr = pearsonCorrelation(itemCounts, stresses);

    // Themes
    const tagCounts = new Map<string, number>();
    entries.forEach(e => {
      e.items.forEach(item => {
        tagText(item.text).forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });
    });
    const topThemes = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Best days
    const bestDays = [...dayMap.entries()]
      .map(([day, { moods }]) => ({ day, avgMood: moods.reduce((a, b) => a + b, 0) / moods.length }))
      .sort((a, b) => b.avgMood - a.avgMood)
      .slice(0, 3);

    const avgMood = moods.length > 0 ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length * 10) / 10 : 0;
    const avgStress = stresses.length > 0 ? Math.round(stresses.reduce((a, b) => a + b, 0) / stresses.length * 10) / 10 : 0;
    const uniqueDays = new Set(entries.map(e => e.entryDatetime.split('T')[0])).size;

    // Grounding score (0-10) — composite of sessions + regulation states
    const recentSessions = groundingSessions.filter(s => {
      const d = new Date(s.sessionDatetime);
      return (today.getTime() - d.getTime()) < 14 * 24 * 60 * 60 * 1000;
    });
    const sessionScore = Math.min(recentSessions.length * 1.5, 5); // up to 5 from sessions
    const recentRegulated = entries
      .filter(e => (today.getTime() - new Date(e.entryDatetime).getTime()) < 14 * 24 * 60 * 60 * 1000)
      .filter(e => e.regulationState)
      .map(e => REGULATION_SCORE[e.regulationState!] || 5);
    const regScore = recentRegulated.length > 0
      ? (recentRegulated.reduce((a, b) => a + b, 0) / recentRegulated.length) / 2
      : 0;
    const groundingScore = Math.min(Math.round((sessionScore + regScore) * 10) / 10, 10);

    // Regulation trend — weekly averages of regulation score
    const regWeekMap = new Map<string, number[]>();
    entries.forEach(e => {
      if (!e.regulationState) return;
      const d = new Date(e.entryDatetime);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!regWeekMap.has(key)) regWeekMap.set(key, []);
      regWeekMap.get(key)!.push(REGULATION_SCORE[e.regulationState] || 5);
    });
    const regulationTrend = [...regWeekMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, scores]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
      }));

    return {
      streak, moodData, weeklyData, moodCorr, stressCorr, topThemes, bestDays,
      avgMood, avgStress, total: entries.length, uniqueDays,
      habitData, habitRate, groundingScore, regulationTrend,
    };
  }, [entries, groundingSessions]);

  const personalInsights = useMemo(() => {
    if (!stats || stats.uniqueDays < 14) return null;
    return computePersonalInsights(entries);
  }, [entries, stats]);

  if (!stats) {
    return (
      <div className="max-w-lg mx-auto p-4 animate-fade-in">
        <div className="pt-10 pb-6">
          <h1 className="text-3xl font-serif font-bold">Analytics</h1>
        </div>
        <div className="text-center py-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-primary/5 blur-2xl" />
          </div>
          <div className="relative">
            <div className="text-4xl mb-4 animate-float">📊</div>
            <p className="text-foreground font-serif text-lg font-semibold">You're one entry away from seeing who you're becoming</p>
            <p className="text-sm text-muted-foreground mt-1">Start noticing — the patterns will follow</p>
          </div>
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    borderRadius: '16px',
    border: '1px solid hsl(var(--border))',
    background: 'hsl(var(--card))',
    boxShadow: 'var(--shadow-elevated)',
  };

  const { isPremium } = usePremiumStore();

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Your journey at a glance</p>
        </div>
        <button
          onClick={() => setShowCustomize(!showCustomize)}
          className={`p-2.5 rounded-xl transition-colors ${showCustomize ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Customize panel */}
      <AnimatePresence>
        {showCustomize && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Show / Hide Widgets</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(WIDGET_META) as AnalyticsWidget[]).map(w => (
                  <button
                    key={w}
                    onClick={() => toggleWidget(w)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 ${
                      isEnabled(w)
                        ? 'bg-primary/10 border-primary/20 text-foreground'
                        : 'border-border/50 text-muted-foreground'
                    }`}
                  >
                    {isEnabled(w) ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{WIDGET_META[w].emoji} {WIDGET_META[w].label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Core Metrics — Reactivity, Recovery, Awareness, Arc */}
      <div className="mb-8">
        <CoreMetricsDashboard />
      </div>

      {/* 14-Day Personal Insights (always shown if available) */}
      {personalInsights && (
        <PremiumGate feature="deep_analytics">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold">Your Personal Insights</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">14+ days</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {personalInsights.topEmotion && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/10 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Top Emotion</span>
                </div>
                <p className="text-lg font-serif font-bold text-foreground capitalize">{personalInsights.topEmotion.emotion}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">felt {personalInsights.topEmotion.count} times</p>
              </div>
            )}
            {personalInsights.bestTimeOfDay && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 via-card to-card border border-accent/10 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Peak Time</span>
                </div>
                <p className="text-lg font-serif font-bold text-foreground">
                  {getTimeOfDayEmoji(personalInsights.bestTimeOfDay.label)} {personalInsights.bestTimeOfDay.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">avg mood {personalInsights.bestTimeOfDay.avgMood.toFixed(1)}</p>
              </div>
            )}
          </div>

          {personalInsights.moodBoostingThemes.length > 0 && (
            <div className="mt-3 p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold">Situations That Boost Your Mood</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {personalInsights.moodBoostingThemes.map(({ theme, avgMood }) => (
                  <span key={theme} className="px-3 py-1.5 rounded-full bg-primary/10 text-sm font-semibold text-foreground">
                    {theme} <span className="text-primary text-xs">↑{avgMood.toFixed(1)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {personalInsights.topWords.length > 0 && (
            <div className="mt-3 p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-1.5 mb-3">
                <MessageCircle className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-bold">Words You Use Most</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {personalInsights.topWords.map(({ word, count }) => (
                  <span key={word} className="px-3 py-1.5 rounded-full bg-accent/10 text-sm text-foreground">
                    {word} <span className="text-muted-foreground text-[10px]">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {(personalInsights.topRegulationState || personalInsights.regulationPatterns.length > 0) && (
            <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/10 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-1.5 mb-3">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold">Regulation Patterns</span>
              </div>
              {personalInsights.topRegulationState && (
                <p className="text-sm text-muted-foreground mb-2">
                  Most common state: <span className="font-semibold text-foreground capitalize">{personalInsights.topRegulationState.state}</span>
                  <span className="text-muted-foreground text-xs ml-1">({personalInsights.topRegulationState.count}×)</span>
                </p>
              )}
              {personalInsights.regulationPatterns.length > 0 && (
                <div className="space-y-2 mt-2">
                  {personalInsights.regulationPatterns.map((pattern, i) => (
                    <p key={i} className="text-sm text-foreground bg-primary/5 rounded-xl px-3 py-2.5 leading-relaxed">
                      💡 {pattern}
                    </p>
                  ))}
                </div>
              )}
              {personalInsights.regulationPatterns.length === 0 && personalInsights.topRegulationState && (
                <p className="text-xs text-muted-foreground mt-1">Keep tagging your state — patterns will emerge soon.</p>
              )}
            </div>
          )}
        </motion.div>
        </PremiumGate>
      )}

      {/* Teaser for users under 14 days */}
      {stats.uniqueDays > 0 && stats.uniqueDays < 14 && (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/10 text-center">
          <Sparkles className="w-5 h-5 text-primary/40 mx-auto mb-2" />
          <p className="text-sm font-serif font-semibold text-foreground">You're {14 - stats.uniqueDays} days from meeting the person you're becoming</p>
          <p className="text-[10px] text-muted-foreground mt-1">Personal insights unlock with {14 - stats.uniqueDays} more days of showing up</p>
        </div>
      )}

      {/* Summary cards (always shown) */}
      <div className="grid grid-cols-3 gap-2.5 mb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/10 text-center shadow-[var(--shadow-card)]">
          <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-2xl font-serif font-bold text-primary">{stats.streak}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Streak</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50 text-center shadow-[var(--shadow-card)]">
          <TrendingUp className="w-4 h-4 text-foreground mx-auto mb-1" />
          <p className="text-2xl font-serif font-bold text-foreground">{stats.avgMood}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Avg Mood</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50 text-center shadow-[var(--shadow-card)]">
          <Hash className="w-4 h-4 text-foreground mx-auto mb-1" />
          <p className="text-2xl font-serif font-bold text-foreground">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Entries</p>
        </div>
      </div>

      {/* ═══ OPTIONAL WIDGETS ═══ */}

      {/* Mood Graph */}
      {isEnabled('mood') && stats.moodData.length > 1 && (
        <div className="mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Mood & Stress Over Time
          </h2>
          <div className="rounded-3xl bg-card border border-border/50 p-4 shadow-[var(--shadow-card)]">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Mood" />
                <Line type="monotone" dataKey="stress" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={false} name="Stress" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Habit Consistency */}
      {isEnabled('habit') && (
        <div className="mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            📅 Who You're Becoming
            <span className="text-xs font-semibold text-primary ml-auto">{stats.habitRate}%</span>
          </h2>
          <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-7 gap-1.5">
              {stats.habitData.map(d => (
                <div
                  key={d.day}
                  title={d.label}
                  className={`aspect-square rounded-lg transition-colors ${
                    d.hasEntry
                      ? 'bg-primary/30 border border-primary/20'
                      : 'bg-muted/50 border border-border/30'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>4 weeks ago</span>
              <span>Today</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              {stats.habitRate >= 80 ? "You're someone who shows up. This proves it."
                : stats.habitRate >= 50 ? "You're becoming someone who notices — consistently."
                : "Every square is a choice to be present. Keep choosing."}
            </p>
          </div>
        </div>
      )}

      {/* Grounding Score */}
      {isEnabled('grounding') && (
        <div className="mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            🪨 Grounding Score
          </h2>
          <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/10 p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-end gap-4">
              <p className="text-4xl font-serif font-bold text-primary">{stats.groundingScore}</p>
              <p className="text-sm text-muted-foreground mb-1">/10</p>
              <div className="flex-1 ml-2">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-sage-dark rounded-full transition-all duration-700"
                    style={{ width: `${stats.groundingScore * 10}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Based on your grounding sessions and regulation states over the last 14 days.
              {stats.groundingScore >= 7 && " You\u2019re becoming someone whose nervous system knows safety."}
              {stats.groundingScore >= 4 && stats.groundingScore < 7 && " You\u2019re building the identity of someone who regulates."}
              {stats.groundingScore < 4 && " Every grounding exercise shapes who you\u2019re becoming."}
            </p>
          </div>
        </div>
      )}

      {/* Regulation Trend */}
      {isEnabled('regulation') && stats.regulationTrend.length > 1 && (
        <PremiumGate feature="regulation_trends">
        <div className="mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Regulation Trend
          </h2>
          <div className="rounded-3xl bg-card border border-border/50 p-4 shadow-[var(--shadow-card)]">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={stats.regulationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(var(--primary))' }} name="Regulation" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Higher = more grounded & calm · Lower = more activated or dissociated
            </p>
          </div>
        </div>
        </PremiumGate>
      )}

      {/* Restlessness Patterns */}
      <RestlessnessAnalytics />

      {/* Correlation */}
      {isEnabled('correlation') && !isNaN(stats.moodCorr) && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-sage-light/30 via-card to-card border border-primary/10 shadow-[var(--shadow-card)] animate-fade-in">
          <h2 className="text-sm font-bold mb-3">Correlation Insights</h2>
          <p className="text-sm text-muted-foreground">
            More gratitude items → mood: <span className="font-bold text-primary">r = {stats.moodCorr.toFixed(2)}</span>
          </p>
          {!isNaN(stats.stressCorr) && (
            <p className="text-sm text-muted-foreground mt-1">
              More gratitude items → stress: <span className="font-bold text-accent">r = {stats.stressCorr.toFixed(2)}</span>
            </p>
          )}
        </div>
      )}

      {/* Top themes */}
      {isEnabled('themes') && stats.topThemes.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-3">Top Themes</h2>
          <div className="flex flex-wrap gap-2">
            {stats.topThemes.map(([tag, count]) => (
              <span key={tag} className="px-3.5 py-2 rounded-full bg-sage-light text-sage-dark text-sm font-semibold shadow-[var(--shadow-card)]">
                {tag} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Best days */}
      {isEnabled('bestDays') && stats.bestDays.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <h2 className="text-sm font-bold mb-3">🌟 Your Best Days</h2>
          <div className="space-y-2">
            {stats.bestDays.map(({ day, avgMood }, idx) => (
              <div key={day} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]" style={{ animationDelay: `${idx * 60}ms` }}>
                <span className="text-sm font-medium">{new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                <span className="text-sm font-bold text-primary">Mood {avgMood.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when all widgets hidden */}
      {enabledWidgets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">All widgets are hidden.</p>
          <button onClick={() => setShowCustomize(true)} className="text-sm text-primary font-semibold mt-2 hover:underline">
            Customize what you see
          </button>
        </div>
      )}
    </div>
  );
}
