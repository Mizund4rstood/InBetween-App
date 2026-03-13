import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from './appStore';
import { computeCoreMetrics, MilestoneReport } from './metrics';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { TrendingDown, Zap, Eye, Flag, ChevronRight } from 'lucide-react';

const tooltipStyle = {
  borderRadius: '16px',
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--card))',
  boxShadow: 'var(--shadow-elevated)',
};

/**
 * Core Metrics Dashboard — shows on Analytics page.
 * Three measurable outputs + milestone arc.
 */
export default function CoreMetricsDashboard() {
  const { entries, groundingSessions } = useAppStore();

  const metrics = useMemo(
    () => computeCoreMetrics(entries, groundingSessions),
    [entries, groundingSessions]
  );

  const { reactivityTrend, regulationSpeed, awarenessScore, milestoneArc } = metrics;

  if (entries.length < 3) return null;

  return (
    <div className="space-y-6">
      {/* 1. Reactivity Trend */}
      {reactivityTrend.weeks.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Reactivity Trend</h3>
          </div>
          <p className="text-[10px] text-muted-foreground mb-4">
            {reactivityTrend.improving === true
              ? 'You react less now.'
              : reactivityTrend.improving === false
                ? 'Reactivity crept up. Not a failure — a signal.'
                : 'Building your baseline.'}
          </p>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reactivityTrend.weeks} barCategoryGap="20%">
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="paused" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} name="Paused" />
                <Bar dataKey="chose" stackId="a" fill="hsl(var(--primary) / 0.5)" radius={[0, 0, 0, 0]} name="Chose" />
                <Bar dataKey="reacted" stackId="a" fill="hsl(var(--destructive) / 0.4)" radius={[4, 4, 0, 0]} name="Reacted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* 2. Regulation Speed */}
      {regulationSpeed.currentAvgHours !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Recovery Speed</h3>
          </div>

          <div className="flex items-end gap-3 mb-3">
            <p className="text-3xl font-serif font-bold text-foreground">
              {regulationSpeed.currentAvgHours}h
            </p>
            <p className="text-xs text-muted-foreground pb-0.5">avg recovery time</p>
          </div>

          {regulationSpeed.improvementPct !== null && (
            <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary">
                {regulationSpeed.improvementPct > 0
                  ? `You recover ${regulationSpeed.improvementPct}% faster than when you started.`
                  : regulationSpeed.improvementPct === 0
                    ? 'Recovery speed holding steady.'
                    : 'Recovery time shifted. Check what changed.'}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <span className="text-[10px] text-muted-foreground">
              Grounding used {regulationSpeed.groundingUsageRate}% of last 14 days
            </span>
          </div>
        </motion.div>
      )}

      {/* 3. Awareness Strength */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Awareness Strength</h3>
          </div>
          <span className="text-2xl font-serif font-bold text-primary">{awarenessScore.score}%</span>
        </div>

        <div className="space-y-2">
          <AwarenessBar label="Consistency" value={awarenessScore.consistencyRate} />
          <AwarenessBar label="Trigger logging" value={awarenessScore.triggerLogRate} />
          <AwarenessBar label="State identified" value={awarenessScore.stateIdentifiedRate} />
        </div>
      </motion.div>

      {/* 4. Milestone Arc */}
      {milestoneArc.currentDay >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Your Arc</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              Day {milestoneArc.currentDay}
            </span>
          </div>

          <div className="space-y-3">
            {milestoneArc.milestones.map((m) => (
              <MilestoneRow key={m.day} milestone={m} />
            ))}
          </div>

          {milestoneArc.nextMilestone && (
            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              {milestoneArc.nextMilestone.daysAway} day{milestoneArc.nextMilestone.daysAway !== 1 ? 's' : ''} to Day {milestoneArc.nextMilestone.day}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function AwarenessBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground font-semibold">{label}</span>
        <span className="text-[10px] text-foreground font-bold">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-primary/50"
        />
      </div>
    </div>
  );
}

function MilestoneRow({ milestone }: { milestone: MilestoneReport }) {
  return (
    <div
      className={`p-3 rounded-2xl border transition-all ${
        milestone.reached
          ? 'bg-primary/5 border-primary/15'
          : 'border-border/30 opacity-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${milestone.reached ? 'text-primary' : 'text-muted-foreground'}`}>
            Day {milestone.day}
          </span>
          <span className="text-[10px] text-muted-foreground">{milestone.title}</span>
        </div>
        {milestone.reached && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">✓</span>
        )}
      </div>
      {milestone.reached && milestone.metrics.length > 0 && (
        <div className="flex items-center gap-3 mt-1">
          {milestone.metrics.map((m, i) => (
            <span key={i} className="text-[9px] text-muted-foreground">
              {m.label}: <span className="text-foreground font-semibold">{m.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
