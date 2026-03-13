import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useRewireStore } from '@/stores/rewireStore';
import { useCompassStore } from '@/stores/compassStore';
import { supabase } from '@/integrations/supabase/client';
import { calculateStreak, isToday } from '@/lib/analytics';
import {
  Brain, Zap, Wind, Eye, Heart, Sparkles, Activity,
  ChevronRight, Shield
} from 'lucide-react';

/**
 * 8 Behavior Areas:
 * 1. Emotional Regulation — mood consistency & check-in frequency
 * 2. Impulse Control — delay strength & replacement rate (Rewire)
 * 3. Stress Management — grounding session frequency & mood improvement
 * 4. Self-Awareness — trigger logging & compass usage
 * 5. Shame Resilience — streak maintenance & recovery after breaks
 * 6. Identity Growth — rewire phase progress & identity reflections
 * 7. Gratitude Practice — entry count & consistency
 * 8. Restlessness — tool usage frequency & variety
 */

interface BehaviorArea {
  key: string;
  label: string;
  icon: React.ReactNode;
  score: number; // 0-100
  detail: string;
  route: string;
}

export default function BehaviorProgressDashboard() {
  const navigate = useNavigate();
  const { entries, groundingSessions } = useAppStore();
  const rewireStartDate = useRewireStore(s => s.startDate);
  const rewireUrges = useRewireStore(s => s.urges);
  const triggers = useCompassStore(s => s.triggers);
  const choices = useCompassStore(s => s.choices);

  // Derive metrics outside of selectors to avoid infinite re-render loops
  const rewireMetrics = useMemo(() => useRewireStore.getState().getMetrics(), [rewireUrges]);
  const rewirePhase = useMemo(() => useRewireStore.getState().getPhase(), [rewireStartDate]);

  // Fetch restlessness sessions
  const [restSessions, setRestSessions] = useState<{ created_at: string; tool_used: string }[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('restlessness_sessions')
        .select('created_at, tool_used')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setRestSessions(data as any);
    })();
  }, []);

  const areas = useMemo((): BehaviorArea[] => {
    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 86400000;
    const recentEntries = entries.filter(e => new Date(e.entryDatetime).getTime() >= fourteenDaysAgo);
    const streak = calculateStreak(entries.map(e => e.entryDatetime));

    // 1. Emotional Regulation — mood stability + check-in frequency
    const regulationScore = (() => {
      if (recentEntries.length < 2) return 0;
      const moods = recentEntries.map(e => e.mood);
      const avg = moods.reduce((s, m) => s + m, 0) / moods.length;
      const variance = moods.reduce((s, m) => s + Math.pow(m - avg, 2), 0) / moods.length;
      const stability = Math.max(0, 100 - variance * 10); // lower variance = higher score
      const frequency = Math.min(100, (recentEntries.length / 14) * 100);
      return Math.round((stability * 0.6 + frequency * 0.4));
    })();

    // 2. Impulse Control — delay strength + replacement rate
    const impulseScore = (() => {
      if (rewireMetrics.totalUrges === 0) return 0;
      const delay = rewireMetrics.delayStrengthScore;
      const replacement = rewireMetrics.replacementRateRecent * 100;
      const notActed = (1 - rewireMetrics.actedOnUrgeRateRecent) * 100;
      return Math.round((delay * 0.4 + replacement * 0.3 + notActed * 0.3));
    })();

    // 3. Stress Management — grounding usage + mood improvement
    const stressScore = (() => {
      const recentSessions = groundingSessions.filter(s => new Date(s.sessionDatetime).getTime() >= fourteenDaysAgo);
      if (recentSessions.length === 0) return 0;
      const usage = Math.min(100, (recentSessions.length / 7) * 100);
      const avgImprovement = recentSessions.reduce((s, g) => s + (g.postMood - g.preMood), 0) / recentSessions.length;
      const improvementScore = Math.min(100, Math.max(0, avgImprovement * 20 + 50));
      return Math.round((usage * 0.5 + improvementScore * 0.5));
    })();

    // 4. Self-Awareness — trigger logging + state identification
    const awarenessScore = (() => {
      const recentTriggers = triggers.filter(t => new Date(t.created_at).getTime() >= fourteenDaysAgo);
      const recentChoices = choices.filter(c => new Date(c.created_at).getTime() >= fourteenDaysAgo);
      const triggerLogging = Math.min(100, recentTriggers.length * 15);
      const choiceTracking = Math.min(100, recentChoices.length * 20);
      const withEmotion = recentEntries.filter(e => e.regulationState).length;
      const stateRate = recentEntries.length > 0 ? (withEmotion / recentEntries.length) * 100 : 0;
      return Math.round((triggerLogging * 0.35 + choiceTracking * 0.35 + stateRate * 0.3));
    })();

    // 5. Shame Resilience — streak maintenance + returning after breaks
    const shameScore = (() => {
      const streakScore = Math.min(100, streak * 5); // 20 days = 100
      const totalDays = entries.length > 0
        ? Math.floor((now - new Date(entries[entries.length - 1].entryDatetime).getTime()) / 86400000)
        : 0;
      const activeDays = new Set(entries.map(e => e.entryDatetime.slice(0, 10))).size;
      const returnRate = totalDays > 0 ? Math.min(100, (activeDays / Math.max(1, totalDays)) * 100) : 0;
      return Math.round((streakScore * 0.5 + returnRate * 0.5));
    })();

    // 6. Identity Growth — rewire phase progress
    const identityScore = (() => {
      if (!rewireStartDate) return 0;
      const phaseProgress = ((rewirePhase - 1) / 3) * 100;
      const weekInPhase = useRewireStore.getState().getWeek();
      const phaseWeekProgress = Math.min(100, ((weekInPhase % 3) / 3) * 100);
      return Math.round((phaseProgress * 0.7 + phaseWeekProgress * 0.3));
    })();

    // 7. Gratitude Practice — consistency + depth
    const gratitudeScore = (() => {
      if (entries.length === 0) return 0;
      const consistency = Math.min(100, (recentEntries.length / 14) * 100);
      const avgItems = entries.length > 0
        ? entries.slice(0, 14).reduce((s, e) => s + e.items.length, 0) / Math.min(14, entries.length)
        : 0;
      const depth = Math.min(100, avgItems * 33);
      return Math.round((consistency * 0.6 + depth * 0.4));
    })();

    // 8. Restlessness — tool usage frequency & variety
    const restlessnessScore = (() => {
      const recentRest = restSessions.filter(s => new Date(s.created_at).getTime() >= fourteenDaysAgo);
      if (recentRest.length === 0) return 0;
      const usage = Math.min(100, recentRest.length * 12); // ~8 sessions in 14d = 100
      const uniqueTools = new Set(recentRest.map(s => s.tool_used)).size;
      const variety = Math.min(100, (uniqueTools / 4) * 100); // 4 tools available
      return Math.round(usage * 0.6 + variety * 0.4);
    })();

    return [
      { key: 'regulation', label: 'Emotional Regulation', icon: <Heart className="w-4 h-4" />, score: regulationScore, detail: `${recentEntries.length} check-ins last 14d`, route: '/analytics' },
      { key: 'impulse', label: 'Impulse Control', icon: <Shield className="w-4 h-4" />, score: impulseScore, detail: rewireMetrics.totalUrges > 0 ? `${rewireMetrics.delayStrengthScore}% delay strength` : 'Start Rewire', route: '/rewire' },
      { key: 'stress', label: 'Stress Management', icon: <Wind className="w-4 h-4" />, score: stressScore, detail: `${groundingSessions.length} sessions total`, route: '/grounding' },
      { key: 'awareness', label: 'Self-Awareness', icon: <Eye className="w-4 h-4" />, score: awarenessScore, detail: `${triggers.length} triggers logged`, route: '/compass' },
      { key: 'shame', label: 'Shame Resilience', icon: <Sparkles className="w-4 h-4" />, score: shameScore, detail: `${streak}-day streak`, route: '/' },
      { key: 'identity', label: 'Identity Growth', icon: <Brain className="w-4 h-4" />, score: identityScore, detail: rewireStartDate ? `Phase ${rewirePhase}/4` : 'Not started', route: '/rewire' },
      { key: 'gratitude', label: 'Gratitude Practice', icon: <Activity className="w-4 h-4" />, score: gratitudeScore, detail: `${entries.length} entries`, route: '/wall' },
      { key: 'restlessness', label: 'Restlessness', icon: <Zap className="w-4 h-4" />, score: restlessnessScore, detail: `${restSessions.length} sessions`, route: '/restlessness' },
    ];
  }, [entries, groundingSessions, rewireMetrics, rewirePhase, rewireStartDate, rewireUrges, triggers, choices, restSessions]);

  const overallScore = Math.round(areas.reduce((s, a) => s + a.score, 0) / areas.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
    >
      {/* Header with overall score */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-foreground">Behavior Progress</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">8 areas of growth</p>
        </div>
        <div className="relative w-14 h-14">
          <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
            <motion.circle
              cx="28" cy="28" r="24" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 24}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - overallScore / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-serif font-bold text-foreground">{overallScore}%</span>
          </div>
        </div>
      </div>

      {/* Radar-style visualization */}
      <div className="flex justify-center mb-5">
        <RadarChart areas={areas} onLabelTap={(route) => navigate(route)} />
      </div>

      {/* Area list */}
      <div className="space-y-2">
        {areas.map((area, i) => (
          <motion.button
            key={area.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            onClick={() => navigate(area.route)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors group text-left"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              {area.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground truncate">{area.label}</span>
                <span className="text-xs font-bold text-primary ml-2">{area.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${area.score}%` }}
                  transition={{ duration: 0.8, delay: 0.1 * i, ease: 'easeOut' }}
                  className="h-full rounded-full bg-primary/60"
                />
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">{area.detail}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/** SVG radar/octagon chart */
function RadarChart({ areas, onLabelTap }: { areas: BehaviorArea[]; onLabelTap?: (route: string) => void }) {
  const n = areas.length;
  const cx = 120, cy = 120, r = 70;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const gridLevels = [25, 50, 75, 100];

  const dataPoints = areas.map((a, i) => getPoint(i, a.score));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Compute label positions with smart anchoring
  const labels = areas.map((a, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const labelDist = r + 32;
    const x = cx + labelDist * Math.cos(angle);
    const y = cy + labelDist * Math.sin(angle);

    // Determine text anchor based on position
    const normAngle = ((angle + Math.PI * 2.5) % (Math.PI * 2));
    let anchor: 'start' | 'middle' | 'end' = 'middle';
    if (normAngle > Math.PI * 0.15 && normAngle < Math.PI * 0.85) anchor = 'start';
    else if (normAngle > Math.PI * 1.15 && normAngle < Math.PI * 1.85) anchor = 'end';

    // Split label into two lines
    const words = a.label.split(' ');
    const line1 = words.length > 1 ? words[0] : a.label;
    const line2 = words.length > 1 ? words.slice(1).join(' ') : '';

    return { x, y, anchor, line1, line2 };
  });

  return (
    <svg viewBox="0 0 240 240" className="w-56 h-56">
      {/* Grid */}
      {gridLevels.map(level => {
        const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return <path key={level} d={path} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity={0.5} />;
      })}

      {/* Axis lines */}
      {areas.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="0.5" opacity={0.3} />;
      })}

      {/* Data shape */}
      <motion.path
        d={dataPath}
        fill="hsl(var(--primary) / 0.15)"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x} cy={p.y} r="3"
          fill="hsl(var(--primary))"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 * i, type: 'spring' }}
        />
      ))}

      {/* Labels — full text, two lines, tappable */}
      {labels.map((l, i) => (
        <g
          key={i}
          onClick={() => onLabelTap?.(areas[i].route)}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
        >
          {/* Invisible hit area */}
          <rect
            x={l.anchor === 'end' ? l.x - 50 : l.anchor === 'start' ? l.x : l.x - 25}
            y={l.y - 10}
            width="50"
            height="20"
            fill="transparent"
          />
          <text
            x={l.x} y={l.y}
            textAnchor={l.anchor}
            dominantBaseline="middle"
            className="fill-muted-foreground font-semibold hover:fill-primary transition-colors"
            style={{ fontSize: '7px' }}
          >
            <tspan x={l.x} dy={l.line2 ? '-0.4em' : '0'}>{l.line1}</tspan>
            {l.line2 && <tspan x={l.x} dy="1.1em">{l.line2}</tspan>}
          </text>
        </g>
      ))}
    </svg>
  );
}
