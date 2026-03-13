import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, Hand } from 'lucide-react';
import { motion } from 'framer-motion';

interface Session {
  id: string;
  created_at: string;
  tool_used: string;
  duration_seconds: number | null;
}

const TOOL_LABELS: Record<string, string> = {
  bodyscan: '🧘 Body Scan',
  movement: '🏃 Movement',
  fidget: '🤲 Fidget',
  reframe: '🧠 Reframe',
};

const TOOL_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--compass, 200 60% 50%))',
  'hsl(var(--sky, 200 80% 60%))',
];

function getTimeOfDayLabel(hour: number): string {
  if (hour < 6) return 'Night';
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

export default function RestlessnessAnalytics() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('restlessness_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (data) setSessions(data as any);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    if (sessions.length === 0) return null;

    // Frequency: sessions per day over last 14 days
    const today = new Date();
    const frequencyMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      frequencyMap.set(d.toISOString().split('T')[0], 0);
    }
    sessions.forEach(s => {
      const day = s.created_at.split('T')[0];
      if (frequencyMap.has(day)) {
        frequencyMap.set(day, frequencyMap.get(day)! + 1);
      }
    });
    const frequencyData = [...frequencyMap.entries()].map(([day, count]) => ({
      date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: count,
    }));

    // Time of day distribution
    const todBuckets: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    sessions.forEach(s => {
      const hour = new Date(s.created_at).getHours();
      todBuckets[getTimeOfDayLabel(hour)]++;
    });
    const todData = Object.entries(todBuckets)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    // Tool preference
    const toolCounts: Record<string, number> = {};
    sessions.forEach(s => {
      toolCounts[s.tool_used] = (toolCounts[s.tool_used] || 0) + 1;
    });
    const toolData = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tool, count]) => ({
        tool,
        label: TOOL_LABELS[tool] || tool,
        count,
        pct: Math.round((count / sessions.length) * 100),
      }));

    // Average duration
    const withDuration = sessions.filter(s => s.duration_seconds != null);
    const avgDuration = withDuration.length > 0
      ? Math.round(withDuration.reduce((a, s) => a + s.duration_seconds!, 0) / withDuration.length)
      : null;

    return { frequencyData, todData, toolData, avgDuration, total: sessions.length };
  }, [sessions]);

  if (loading) return null;
  if (!stats || stats.total === 0) return null;

  const tooltipStyle = {
    borderRadius: '16px',
    border: '1px solid hsl(var(--border))',
    background: 'hsl(var(--card))',
    boxShadow: 'var(--shadow-elevated)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🦎</span>
        <h2 className="text-sm font-bold">Restlessness Patterns</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{stats.total} sessions</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="p-3 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] text-center">
          <Activity className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-xl font-serif font-bold text-foreground">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Total</p>
        </div>
        <div className="p-3 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] text-center">
          <Clock className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="text-xl font-serif font-bold text-foreground">{stats.avgDuration ? `${stats.avgDuration}s` : '—'}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Avg Time</p>
        </div>
        <div className="p-3 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] text-center">
          <Hand className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-xl font-serif font-bold text-foreground">{stats.toolData[0]?.label.split(' ')[0] || '—'}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Go-to</p>
        </div>
      </div>

      {/* Frequency chart */}
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-[var(--shadow-card)] mb-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">14-Day Frequency</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={stats.frequencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={2} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tool preference + Time of day side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tool preference */}
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Tool Preference</p>
          <div className="space-y-2">
            {stats.toolData.map((t, i) => (
              <div key={t.tool}>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span>{t.label}</span>
                  <span>{t.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${t.pct}%`, backgroundColor: TOOL_COLORS[i % TOOL_COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time of day */}
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Time of Day</p>
          {stats.todData.length > 0 && (
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie
                  data={stats.todData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {stats.todData.map((_, i) => (
                    <Cell key={i} fill={TOOL_COLORS[i % TOOL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            {stats.todData.map((d, i) => (
              <span key={d.name} className="text-[9px] text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full mr-0.5" style={{ backgroundColor: TOOL_COLORS[i % TOOL_COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Insight */}
      {stats.total >= 5 && (
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-accent/10 via-card to-primary/5 border border-accent/15 shadow-[var(--shadow-card)]">
          <p className="text-xs text-foreground leading-relaxed">
            💡 You've used restlessness tools {stats.total} times.
            {stats.toolData[0] && ` ${stats.toolData[0].label} is your go-to (${stats.toolData[0].pct}%).`}
            {stats.todData[0] && ` Most restlessness hits in the ${stats.todData[0].name.toLowerCase()}.`}
          </p>
        </div>
      )}
    </motion.div>
  );
}
