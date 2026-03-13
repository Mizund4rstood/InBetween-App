import { useMemo } from 'react';
import { useRewireStore } from './rewireStore';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, Timer, Shuffle, Shield, Flame, Target } from 'lucide-react';

const tooltipStyle = {
  borderRadius: '16px',
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--card))',
  boxShadow: 'var(--shadow-elevated)',
};

const PHASE_INFO = {
  1: { label: 'Awareness', description: 'Catch the urge. Just notice.', weeks: '1–3' },
  2: { label: 'Delay', description: 'Increase pause time before acting.', weeks: '4–6' },
  3: { label: 'Replace', description: 'Install alternative behaviors.', weeks: '7–9' },
  4: { label: 'Identity', description: 'Internalize control.', weeks: '10–12' },
};

export default function RewireDashboard() {
  const { urges, getPhase, getWeek, getMetrics, startDate } = useRewireStore();
  const phase = getPhase();
  const week = getWeek();
  const metrics = useMemo(() => getMetrics(), [urges]);

  if (!startDate || urges.length < 2) return null;

  const phaseInfo = PHASE_INFO[phase];

  return (
    <div className="space-y-6">
      {/* Phase indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-compass/10 via-card to-card border border-compass/15 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-compass" />
            <h3 className="text-sm font-bold">Phase {phase}: {phaseInfo.label}</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-compass/10 text-compass font-semibold">
            Week {week}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{phaseInfo.description}</p>

        {/* Phase progress */}
        <div className="flex gap-1 mt-3">
          {[1, 2, 3, 4].map(p => (
            <div
              key={p}
              className={`flex-1 h-1.5 rounded-full ${
                p <= phase ? 'bg-compass' : 'bg-border/30'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Core metrics row */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          icon={<Timer className="w-3.5 h-3.5 text-primary" />}
          label="Delay"
          value={metrics.avgDelaySecRecent >= 60
            ? `${Math.round(metrics.avgDelaySecRecent / 60)}m`
            : `${metrics.avgDelaySecRecent}s`}
          subtitle="avg delay"
        />
        <MetricCard
          icon={<Shuffle className="w-3.5 h-3.5 text-primary" />}
          label="Replace"
          value={`${Math.round(metrics.replacementRateRecent * 100)}%`}
          subtitle="replaced"
        />
        <MetricCard
          icon={<Shield className="w-3.5 h-3.5 text-primary" />}
          label="Strength"
          value={`${metrics.delayStrengthScore}`}
          subtitle="/100"
        />
      </div>

      {/* Acted vs Didn't */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">Urge Response</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          {metrics.actedOnUrgeRateRecent < metrics.actedOnUrgeRate
            ? "You're acting on urges less. That's real change."
            : metrics.actedOnUrgeRate === 0
              ? "Clean record so far."
              : "Building awareness. Keep logging."}
        </p>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <div className="h-3 rounded-full bg-border/30 overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(1 - metrics.actedOnUrgeRateRecent) * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-primary/60 rounded-full"
              />
            </div>
          </div>
          <span className="text-xs font-bold text-primary">
            {Math.round((1 - metrics.actedOnUrgeRateRecent) * 100)}% resisted
          </span>
        </div>
      </motion.div>

      {/* Weekly trend chart */}
      {metrics.weeklyTrend.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Delay Growth</h3>
          </div>
          <p className="text-[10px] text-muted-foreground mb-4">
            Average delay before acting, by week
          </p>

          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.weeklyTrend}>
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={w => `W${w}`} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}s`, 'Avg delay']} />
                <Bar dataKey="delayAvg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Top replacements */}
      {metrics.topReplacements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
        >
          <h3 className="text-sm font-bold mb-3">Your Go-To Replacements</h3>
          <div className="space-y-2">
            {metrics.topReplacements.map((r, i) => (
              <div key={r.name} className="flex items-center justify-between">
                <span className="text-xs text-foreground">{r.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {r.count}×
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] text-center"
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-serif font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{subtitle}</p>
    </motion.div>
  );
}
