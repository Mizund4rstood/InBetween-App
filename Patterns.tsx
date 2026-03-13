import { useEffect, useMemo } from 'react';
import { useCompassStore } from './compassStore';
import { useAppStore } from './appStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Brain, Zap } from 'lucide-react';

const CHART_COLORS = [
  'hsl(var(--compass))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--sky))',
  'hsl(var(--lavender))',
  'hsl(var(--rose))',
  'hsl(var(--earth))',
  'hsl(var(--warm))',
];

export default function PatternsPage() {
  const { triggers, choices, fetchTriggers, fetchChoices } = useCompassStore();
  const { entries } = useAppStore();

  useEffect(() => {
    fetchTriggers();
    fetchChoices();
  }, []);

  const stats = useMemo(() => {
    if (triggers.length === 0) return null;

    // Category distribution
    const catCounts = new Map<string, number>();
    triggers.forEach(t => {
      const cat = t.category || 'Uncategorized';
      catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
    });
    const categoryData = [...catCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // Emotion distribution
    const emoCounts = new Map<string, number>();
    triggers.forEach(t => {
      if (t.emotion) emoCounts.set(t.emotion, (emoCounts.get(t.emotion) || 0) + 1);
    });
    const emotionData = [...emoCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    // Alignment over time (weekly)
    const weekMap = new Map<string, { aligned: number; total: number }>();
    choices.forEach(c => {
      const d = new Date(c.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!weekMap.has(key)) weekMap.set(key, { aligned: 0, total: 0 });
      const w = weekMap.get(key)!;
      w.total++;
      if (c.aligned_with_values) w.aligned++;
    });
    const alignmentData = [...weekMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, { aligned, total }]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: total > 0 ? Math.round((aligned / total) * 100) : 0,
      }));

    // Intensity patterns
    const avgIntensity = triggers.reduce((s, t) => s + (t.intensity || 5), 0) / triggers.length;

    // Pause effectiveness
    const pausedChoices = choices.filter(c => c.pause_used);
    const unpausedChoices = choices.filter(c => !c.pause_used);
    const avgPausedOutcome = pausedChoices.length > 0
      ? pausedChoices.reduce((s, c) => s + (c.outcome_rating || 5), 0) / pausedChoices.length
      : null;
    const avgUnpausedOutcome = unpausedChoices.length > 0
      ? unpausedChoices.reduce((s, c) => s + (c.outcome_rating || 5), 0) / unpausedChoices.length
      : null;

    // Ground ↔ Compass correlation insight
    const groundEntryDates = new Set(entries.map(e => e.entryDatetime.split('T')[0]));
    const triggersOnGroundDays = triggers.filter(t => groundEntryDates.has(t.created_at.split('T')[0]));
    const triggersOnNonGroundDays = triggers.filter(t => !groundEntryDates.has(t.created_at.split('T')[0]));
    const avgIntensityGroundDays = triggersOnGroundDays.length > 0
      ? triggersOnGroundDays.reduce((s, t) => s + (t.intensity || 5), 0) / triggersOnGroundDays.length
      : null;
    const avgIntensityNonGroundDays = triggersOnNonGroundDays.length > 0
      ? triggersOnNonGroundDays.reduce((s, t) => s + (t.intensity || 5), 0) / triggersOnNonGroundDays.length
      : null;

    return {
      categoryData,
      emotionData,
      alignmentData,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      avgPausedOutcome: avgPausedOutcome ? Math.round(avgPausedOutcome * 10) / 10 : null,
      avgUnpausedOutcome: avgUnpausedOutcome ? Math.round(avgUnpausedOutcome * 10) / 10 : null,
      avgIntensityGroundDays: avgIntensityGroundDays ? Math.round(avgIntensityGroundDays * 10) / 10 : null,
      avgIntensityNonGroundDays: avgIntensityNonGroundDays ? Math.round(avgIntensityNonGroundDays * 10) / 10 : null,
      total: triggers.length,
      totalChoices: choices.length,
    };
  }, [triggers, choices, entries]);

  if (!stats) {
    return (
      <div className="max-w-lg mx-auto p-4 animate-fade-in">
        <div className="pt-10 pb-6">
          <h1 className="text-3xl font-serif font-bold">Patterns</h1>
        </div>
        <div className="text-center py-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-compass/5 blur-2xl" />
          </div>
          <div className="relative">
            <div className="text-4xl mb-4 animate-float">🔍</div>
            <p className="text-foreground font-serif text-lg font-semibold">Log triggers to see patterns</p>
            <p className="text-sm text-muted-foreground mt-1">Your insights will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-6">
        <h1 className="text-3xl font-serif font-bold">Patterns</h1>
        <p className="text-sm text-muted-foreground mt-1">Recognize what triggers you and how you respond</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2.5 mb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-compass/10 via-card to-card border border-compass/10 text-center shadow-[var(--shadow-card)]">
          <Zap className="w-4 h-4 text-compass mx-auto mb-1" />
          <p className="text-2xl font-serif font-bold text-compass">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Triggers</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50 text-center shadow-[var(--shadow-card)]">
          <Target className="w-4 h-4 text-foreground mx-auto mb-1" />
          <p className="text-2xl font-serif font-bold">{stats.totalChoices}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Choices</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50 text-center shadow-[var(--shadow-card)]">
          <TrendingUp className="w-4 h-4 text-foreground mx-auto mb-1" />
          <p className="text-2xl font-serif font-bold">{stats.avgIntensity}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Avg Intensity</p>
        </div>
      </div>

      {/* Pause effectiveness */}
      {stats.avgPausedOutcome && stats.avgUnpausedOutcome && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-compass/10 via-card to-card border border-compass/15 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-compass" />
            <h2 className="text-sm font-bold">Pause Effect</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-serif font-bold text-compass">{stats.avgPausedOutcome}</p>
              <p className="text-xs text-muted-foreground">With pause</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif font-bold text-muted-foreground">{stats.avgUnpausedOutcome}</p>
              <p className="text-xs text-muted-foreground">Without pause</p>
            </div>
          </div>
          {stats.avgPausedOutcome > stats.avgUnpausedOutcome && (
            <p className="text-xs text-compass mt-3 text-center font-semibold">
              ✨ Pausing improves outcomes by {((stats.avgPausedOutcome - stats.avgUnpausedOutcome) / stats.avgUnpausedOutcome * 100).toFixed(0)}%
            </p>
          )}
        </div>
      )}

      {/* Ground ↔ Compass loop insight */}
      {stats.avgIntensityGroundDays && stats.avgIntensityNonGroundDays && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-primary/10 via-compass/5 to-primary/10 border border-primary/15 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold">Ground ↔ Compass Loop</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-serif font-bold text-primary">{stats.avgIntensityGroundDays}</p>
              <p className="text-xs text-muted-foreground">Intensity on<br/>grounding days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif font-bold text-muted-foreground">{stats.avgIntensityNonGroundDays}</p>
              <p className="text-xs text-muted-foreground">Intensity on<br/>non-grounding days</p>
            </div>
          </div>
          {stats.avgIntensityGroundDays < stats.avgIntensityNonGroundDays && (
            <p className="text-xs text-primary mt-3 text-center font-semibold">
              🌿 Grounding reduces trigger intensity by {((stats.avgIntensityNonGroundDays - stats.avgIntensityGroundDays) / stats.avgIntensityNonGroundDays * 100).toFixed(0)}%
            </p>
          )}
        </div>
      )}

      {/* Category chart */}
      {stats.categoryData.length > 1 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Trigger Categories</h2>
          <div className="rounded-3xl bg-card border border-border/50 p-4 shadow-[var(--shadow-card)]">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="value" fill="hsl(var(--compass))" radius={[8, 8, 0, 0]} name="Triggers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Emotion distribution */}
      {stats.emotionData.length > 1 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Top Emotions</h2>
          <div className="flex flex-wrap gap-2">
            {stats.emotionData.map(({ name, value }, i) => (
              <span key={name} className="px-3.5 py-2 rounded-full text-sm font-semibold shadow-[var(--shadow-card)]"
                style={{ backgroundColor: `hsl(var(--compass) / ${0.1 + (i * 0.05)})`, color: 'hsl(var(--compass))' }}>
                {name} ({value})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alignment over time */}
      {stats.alignmentData.length > 1 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Values Alignment Over Time</h2>
          <div className="rounded-3xl bg-card border border-border/50 p-4 shadow-[var(--shadow-card)]">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={stats.alignmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Alignment %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
