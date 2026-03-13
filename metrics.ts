import { GratitudeEntry, GroundingSession } from '@/types';

// ─── Core Behavioral Metrics Engine ───
// Tracks reactivity, regulation speed, and pattern awareness.
// Surface is simple. Backend is deep.

export interface CoreMetrics {
  pauseRatio: PauseRatio;
  reactivityTrend: ReactivityTrend;
  regulationSpeed: RegulationSpeed;
  awarenessScore: AwarenessScore;
  milestoneArc: MilestoneArc;
}

// ─── 1. Pause Ratio — THE primary metric ───
export interface PauseRatio {
  ratio: number; // 0-1, paused÷total
  paused: number;
  reacted: number;
  chose: number;
  total: number;
  weekOverWeek: number | null; // change vs last week, e.g. +0.12
}

// ─── 2. Reactivity Trend ───
export interface ReactivityTrend {
  weeks: { label: string; reacted: number; paused: number; chose: number }[];
  currentWeekPauseRate: number;
  previousWeekPauseRate: number | null;
  improving: boolean | null;
}

// ─── 3. Regulation Speed ───
export interface RegulationSpeed {
  currentAvgHours: number | null;
  week1AvgHours: number | null;
  improvementPct: number | null; // e.g. 40 means "40% faster"
  groundingUsageRate: number; // % of days with grounding session in last 14 days
}

// ─── 4. Awareness Score ───
export interface AwarenessScore {
  score: number; // 0-100
  triggerLogRate: number; // % of days with a trigger logged (from items)
  stateIdentifiedRate: number; // % of entries with regulation state
  consistencyRate: number; // % of last 28 days with an entry
}

// ─── 5. Milestone Arc (7/30/60/90) ───
export interface MilestoneArc {
  currentDay: number; // total days with entries
  milestones: MilestoneReport[];
  nextMilestone: { day: number; daysAway: number } | null;
}

export interface MilestoneReport {
  day: number;
  reached: boolean;
  title: string;
  metrics: { label: string; value: string }[];
}

// ─── Extraction helpers ───

function extractReaction(entry: GratitudeEntry): 'reacted' | 'paused' | 'chose' | 'unsure' | null {
  for (const item of entry.items) {
    const t = item.text.toLowerCase();
    if (t.startsWith('reaction:')) {
      const val = t.replace('reaction:', '').trim();
      if (val === 'reacted') return 'reacted';
      if (val === 'paused') return 'paused';
      if (val === 'chose' || val === 'chose intentionally') return 'chose';
      if (val === 'unsure' || val === 'not sure') return 'unsure';
    }
  }
  return null;
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - d.getDay());
  return weekStart.toISOString().split('T')[0];
}

function getWeekLabel(weekKey: string): string {
  return new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Main compute function ───

export function computeCoreMetrics(
  entries: GratitudeEntry[],
  groundingSessions: GroundingSession[]
): CoreMetrics {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.entryDatetime).getTime() - new Date(b.entryDatetime).getTime()
  );

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // ─── Pause Ratio ───
  const reactionsAll = sorted.map(e => ({ reaction: extractReaction(e), date: e.entryDatetime })).filter(r => r.reaction !== null);
  const paused = reactionsAll.filter(r => r.reaction === 'paused').length;
  const chose = reactionsAll.filter(r => r.reaction === 'chose').length;
  const reacted = reactionsAll.filter(r => r.reaction === 'reacted').length;
  const totalReactions = paused + chose + reacted;
  const ratio = totalReactions > 0 ? (paused + chose) / totalReactions : 0;

  // Week over week change
  const thisWeekKey = getWeekKey(today);
  const lastWeekDate = new Date(now);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeekKey = getWeekKey(lastWeekDate.toISOString());

  const thisWeekReactions = reactionsAll.filter(r => getWeekKey(r.date) === thisWeekKey);
  const lastWeekReactions = reactionsAll.filter(r => getWeekKey(r.date) === lastWeekKey);

  const thisWeekPR = thisWeekReactions.length > 0
    ? thisWeekReactions.filter(r => r.reaction === 'paused' || r.reaction === 'chose').length / thisWeekReactions.filter(r => ['paused', 'chose', 'reacted'].includes(r.reaction!)).length
    : 0;
  const lastWeekPR = lastWeekReactions.length > 0
    ? lastWeekReactions.filter(r => r.reaction === 'paused' || r.reaction === 'chose').length / lastWeekReactions.filter(r => ['paused', 'chose', 'reacted'].includes(r.reaction!)).length
    : null;

  const pauseRatio: PauseRatio = {
    ratio: Math.round(ratio * 100) / 100,
    paused,
    reacted,
    chose,
    total: totalReactions,
    weekOverWeek: lastWeekPR !== null ? Math.round((thisWeekPR - lastWeekPR) * 100) / 100 : null,
  };

  // ─── Reactivity Trend ───
  const weekMap = new Map<string, { reacted: number; paused: number; chose: number }>();
  reactionsAll.forEach(r => {
    const wk = getWeekKey(r.date);
    if (!weekMap.has(wk)) weekMap.set(wk, { reacted: 0, paused: 0, chose: 0 });
    const bucket = weekMap.get(wk)!;
    if (r.reaction === 'reacted') bucket.reacted++;
    else if (r.reaction === 'paused') bucket.paused++;
    else if (r.reaction === 'chose') bucket.chose++;
  });

  const weeks = [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([wk, counts]) => ({ label: getWeekLabel(wk), ...counts }));

  const reactivityTrend: ReactivityTrend = {
    weeks,
    currentWeekPauseRate: thisWeekPR,
    previousWeekPauseRate: lastWeekPR,
    improving: lastWeekPR !== null ? thisWeekPR > lastWeekPR : null,
  };

  // ─── Regulation Speed ───
  const regEntries = sorted.filter(e => e.regulationState);
  const DYSREGULATED = ['activated', 'dissociated'];
  const REGULATED = ['calm', 'grounded', 'hopeful'];

  const recoveryTimes: { hours: number; date: string }[] = [];
  for (let i = 0; i < regEntries.length; i++) {
    if (DYSREGULATED.includes(regEntries[i].regulationState!)) {
      for (let j = i + 1; j < regEntries.length; j++) {
        if (REGULATED.includes(regEntries[j].regulationState!)) {
          const hours = (new Date(regEntries[j].entryDatetime).getTime() - new Date(regEntries[i].entryDatetime).getTime()) / 3600000;
          if (hours > 0 && hours < 168) {
            recoveryTimes.push({ hours, date: regEntries[i].entryDatetime });
          }
          break;
        }
      }
    }
  }

  const currentRecoveries = recoveryTimes.slice(-5);
  const currentAvgHours = currentRecoveries.length >= 2
    ? Math.round((currentRecoveries.reduce((s, r) => s + r.hours, 0) / currentRecoveries.length) * 10) / 10
    : null;

  const earlyRecoveries = recoveryTimes.slice(0, Math.min(5, Math.floor(recoveryTimes.length / 2)));
  const week1AvgHours = earlyRecoveries.length >= 2
    ? Math.round((earlyRecoveries.reduce((s, r) => s + r.hours, 0) / earlyRecoveries.length) * 10) / 10
    : null;

  let improvementPct: number | null = null;
  if (currentAvgHours !== null && week1AvgHours !== null && week1AvgHours > 0) {
    improvementPct = Math.round(((week1AvgHours - currentAvgHours) / week1AvgHours) * 100);
  }

  // Grounding usage rate (last 14 days)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
  const recentSessionDays = new Set(
    groundingSessions
      .filter(s => new Date(s.sessionDatetime) >= fourteenDaysAgo)
      .map(s => s.sessionDatetime.split('T')[0])
  );
  const groundingUsageRate = Math.round((recentSessionDays.size / 14) * 100);

  const regulationSpeed: RegulationSpeed = {
    currentAvgHours,
    week1AvgHours,
    improvementPct,
    groundingUsageRate,
  };

  // ─── Awareness Score ───
  const last28Days: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last28Days.push(d.toISOString().split('T')[0]);
  }

  const entryDays = new Set(sorted.map(e => e.entryDatetime.split('T')[0]));
  const daysWithEntry = last28Days.filter(d => entryDays.has(d)).length;
  const consistencyRate = Math.round((daysWithEntry / 28) * 100);

  // Trigger log rate: entries with "State:" item (from express checkin)
  const daysWithTrigger = new Set(
    sorted
      .filter(e => e.items.some(i => i.text.toLowerCase().startsWith('state:')))
      .map(e => e.entryDatetime.split('T')[0])
  );
  const triggerDays = last28Days.filter(d => daysWithTrigger.has(d)).length;
  const triggerLogRate = Math.round((triggerDays / 28) * 100);

  // State identified rate
  const entriesWithState = sorted.filter(e => e.regulationState).length;
  const stateIdentifiedRate = sorted.length > 0 ? Math.round((entriesWithState / sorted.length) * 100) : 0;

  const awarenessScore: AwarenessScore = {
    score: Math.round((consistencyRate * 0.4 + triggerLogRate * 0.3 + stateIdentifiedRate * 0.3)),
    triggerLogRate,
    stateIdentifiedRate,
    consistencyRate,
  };

  // ─── Milestone Arc ───
  const uniqueDays = new Set(sorted.map(e => e.entryDatetime.split('T')[0])).size;
  const MILESTONE_DAYS = [7, 30, 60, 90];

  function buildMilestoneReport(day: number): MilestoneReport {
    const reached = uniqueDays >= day;
    const entriesUpToDay = reached ? sorted.slice(0, sorted.findIndex((_, idx) => {
      const daysSet = new Set(sorted.slice(0, idx + 1).map(e => e.entryDatetime.split('T')[0]));
      return daysSet.size >= day;
    }) + 1) : sorted;

    const metrics: { label: string; value: string }[] = [];

    switch (day) {
      case 7:
        metrics.push({ label: 'Check-ins', value: String(entriesUpToDay.length) });
        metrics.push({ label: 'Pause rate', value: `${Math.round(ratio * 100)}%` });
        break;
      case 30:
        metrics.push({ label: 'Pause ratio', value: `${Math.round(ratio * 100)}%` });
        if (currentAvgHours !== null) metrics.push({ label: 'Recovery time', value: `${currentAvgHours}h` });
        metrics.push({ label: 'Awareness', value: `${awarenessScore.score}%` });
        break;
      case 60:
        metrics.push({ label: 'Pause ratio', value: `${Math.round(ratio * 100)}%` });
        if (improvementPct !== null) metrics.push({ label: 'Recovery improvement', value: `${improvementPct}%` });
        metrics.push({ label: 'Consistency', value: `${consistencyRate}%` });
        break;
      case 90:
        metrics.push({ label: 'Pause ratio', value: `${Math.round(ratio * 100)}%` });
        metrics.push({ label: 'Awareness strength', value: `${awarenessScore.score}%` });
        if (improvementPct !== null) metrics.push({ label: 'Recovery speed', value: `${Math.abs(improvementPct)}% faster` });
        metrics.push({ label: 'Total check-ins', value: String(sorted.length) });
        break;
    }

    const titles: Record<number, string> = {
      7: 'Early Wins',
      30: 'Pattern Report',
      60: 'Behavior Shift',
      90: 'Transformation',
    };

    return { day, reached, title: titles[day] || `Day ${day}`, metrics };
  }

  const milestones = MILESTONE_DAYS.map(buildMilestoneReport);
  const nextMilestoneDay = MILESTONE_DAYS.find(d => uniqueDays < d);

  const milestoneArc: MilestoneArc = {
    currentDay: uniqueDays,
    milestones,
    nextMilestone: nextMilestoneDay ? { day: nextMilestoneDay, daysAway: nextMilestoneDay - uniqueDays } : null,
  };

  return { pauseRatio, reactivityTrend, regulationSpeed, awarenessScore, milestoneArc };
}
