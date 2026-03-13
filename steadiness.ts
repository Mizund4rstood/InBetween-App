import { GratitudeEntry, RegulationState } from '@/types';

// ─── Hidden Engine: Nervous System Analytics ───
// Tracks regulation patterns, recovery times, activation trends,
// and predicts hard days. Surfaced as "steadiness" — never clinical.

export interface SteadinessReport {
  score: number; // 0-100, composite steadiness
  trend: 'improving' | 'holding' | 'dipping' | 'not-enough-data';
  regulationBreakdown: { state: RegulationState; pct: number; count: number }[];
  recoveryAvgHours: number | null; // avg hours from wired/checked-out back to level/solid
  activationPatterns: DayPattern[];
  hardDayPrediction: HardDayPrediction | null;
  streakOfLevel: number; // consecutive check-ins at level/solid/hopeful
  volatility: number; // 0-100, how much mood swings
}

export interface DayPattern {
  day: string; // 'Monday', etc.
  avgStress: number;
  avgMood: number;
  activationRate: number; // % of check-ins that were wired/checked-out
  count: number;
}

export interface HardDayPrediction {
  day: string;
  confidence: 'low' | 'medium' | 'high';
  reason: string;
}

const DYSREGULATED: RegulationState[] = ['activated', 'dissociated'];
const REGULATED: RegulationState[] = ['calm', 'grounded', 'hopeful'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Compute the full steadiness report from entry history.
 * Requires at least 5 entries for meaningful output.
 */
export function computeSteadiness(entries: GratitudeEntry[]): SteadinessReport {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.entryDatetime).getTime() - new Date(b.entryDatetime).getTime()
  );

  const report: SteadinessReport = {
    score: 0,
    trend: 'not-enough-data',
    regulationBreakdown: [],
    recoveryAvgHours: null,
    activationPatterns: [],
    hardDayPrediction: null,
    streakOfLevel: 0,
    volatility: 0,
  };

  if (sorted.length < 5) return report;

  // ─── 1. Regulation Breakdown ───
  const regEntries = sorted.filter(e => e.regulationState);
  const regCounts: Record<string, number> = {};
  regEntries.forEach(e => {
    regCounts[e.regulationState!] = (regCounts[e.regulationState!] || 0) + 1;
  });
  const totalReg = regEntries.length || 1;
  report.regulationBreakdown = Object.entries(regCounts)
    .map(([state, count]) => ({
      state: state as RegulationState,
      pct: Math.round((count / totalReg) * 100),
      count,
    }))
    .sort((a, b) => b.pct - a.pct);

  // ─── 2. Recovery Time ───
  // How long from a dysregulated check-in to the next regulated one?
  const recoveryTimes: number[] = [];
  for (let i = 0; i < regEntries.length; i++) {
    if (DYSREGULATED.includes(regEntries[i].regulationState!)) {
      // Find next regulated entry
      for (let j = i + 1; j < regEntries.length; j++) {
        if (REGULATED.includes(regEntries[j].regulationState!)) {
          const hours =
            (new Date(regEntries[j].entryDatetime).getTime() -
              new Date(regEntries[i].entryDatetime).getTime()) /
            3600000;
          if (hours > 0 && hours < 168) {
            // cap at 1 week
            recoveryTimes.push(hours);
          }
          break;
        }
      }
    }
  }
  report.recoveryAvgHours =
    recoveryTimes.length >= 2
      ? Math.round((recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length) * 10) / 10
      : null;

  // ─── 3. Activation Patterns by Day of Week ───
  const dayBuckets: Record<number, { moods: number[]; stresses: number[]; dysregCount: number; total: number }> = {};
  sorted.forEach(e => {
    const day = new Date(e.entryDatetime).getDay();
    if (!dayBuckets[day]) dayBuckets[day] = { moods: [], stresses: [], dysregCount: 0, total: 0 };
    dayBuckets[day].moods.push(e.mood);
    dayBuckets[day].stresses.push(e.stress);
    dayBuckets[day].total++;
    if (e.regulationState && DYSREGULATED.includes(e.regulationState)) {
      dayBuckets[day].dysregCount++;
    }
  });

  report.activationPatterns = Object.entries(dayBuckets)
    .map(([dayNum, b]) => ({
      day: DAY_NAMES[Number(dayNum)],
      avgStress: Math.round((b.stresses.reduce((a, c) => a + c, 0) / b.stresses.length) * 10) / 10,
      avgMood: Math.round((b.moods.reduce((a, c) => a + c, 0) / b.moods.length) * 10) / 10,
      activationRate: Math.round((b.dysregCount / b.total) * 100),
      count: b.total,
    }))
    .sort((a, b) => DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day));

  // ─── 4. Hard Day Prediction ───
  // Find the day with highest activation rate + highest stress, min 3 data points
  const candidates = report.activationPatterns
    .filter(d => d.count >= 3)
    .sort((a, b) => {
      const scoreA = a.activationRate * 0.6 + a.avgStress * 4;
      const scoreB = b.activationRate * 0.6 + b.avgStress * 4;
      return scoreB - scoreA;
    });

  if (candidates.length > 0) {
    const worst = candidates[0];
    const overallAvgStress = sorted.reduce((s, e) => s + e.stress, 0) / sorted.length;
    if (worst.avgStress > overallAvgStress + 0.5 || worst.activationRate > 30) {
      report.hardDayPrediction = {
        day: worst.day,
        confidence: worst.count >= 6 ? 'high' : worst.count >= 4 ? 'medium' : 'low',
        reason:
          worst.activationRate > 30
            ? `You're wired or checked out ${worst.activationRate}% of ${worst.day}s. Stress averages ${worst.avgStress}.`
            : `${worst.day}s run hot — stress averages ${worst.avgStress} vs ${overallAvgStress.toFixed(1)} overall.`,
      };
    }
  }

  // ─── 5. Streak of Level (consecutive regulated check-ins from most recent) ───
  const reversed = [...regEntries].reverse();
  let levelStreak = 0;
  for (const e of reversed) {
    if (REGULATED.includes(e.regulationState!)) {
      levelStreak++;
    } else {
      break;
    }
  }
  report.streakOfLevel = levelStreak;

  // ─── 6. Mood Volatility ───
  // Standard deviation of mood as a 0-100 score
  if (sorted.length >= 3) {
    const moods = sorted.map(e => e.mood);
    const mean = moods.reduce((a, b) => a + b, 0) / moods.length;
    const variance = moods.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / moods.length;
    const stdDev = Math.sqrt(variance);
    // Max possible stddev for 0-10 range is 5, map to 0-100
    report.volatility = Math.round(Math.min(100, (stdDev / 5) * 100));
  }

  // ─── 7. Composite Steadiness Score ───
  // Higher = steadier. Factors: regulation %, low volatility, low stress, recovery speed
  const regulatedPct =
    regEntries.length > 0
      ? regEntries.filter(e => REGULATED.includes(e.regulationState!)).length / regEntries.length
      : 0.5;

  const avgStress = sorted.reduce((s, e) => s + e.stress, 0) / sorted.length;
  const stressScore = Math.max(0, 100 - avgStress * 10); // 0 stress = 100, 10 stress = 0
  const volatilityScore = 100 - report.volatility;
  const regulationScore = regulatedPct * 100;

  // Recovery bonus: faster recovery = better (cap at 48h = 0 bonus, <4h = 20 bonus)
  let recoveryBonus = 0;
  if (report.recoveryAvgHours !== null) {
    recoveryBonus = Math.max(0, 20 - (report.recoveryAvgHours / 48) * 20);
  }

  report.score = Math.round(
    regulationScore * 0.35 +
      stressScore * 0.25 +
      volatilityScore * 0.25 +
      recoveryBonus * 0.15 +
      Math.min(levelStreak, 10) // small bonus for current level streak
  );
  report.score = Math.min(100, Math.max(0, report.score));

  // ─── 8. Trend ───
  // Compare last 7 entries to previous 7
  if (sorted.length >= 14) {
    const recent = sorted.slice(-7);
    const prior = sorted.slice(-14, -7);

    const recentRegPct =
      recent.filter(e => e.regulationState && REGULATED.includes(e.regulationState)).length / 7;
    const priorRegPct =
      prior.filter(e => e.regulationState && REGULATED.includes(e.regulationState)).length / 7;

    const recentStress = recent.reduce((s, e) => s + e.stress, 0) / 7;
    const priorStress = prior.reduce((s, e) => s + e.stress, 0) / 7;

    if (recentRegPct > priorRegPct + 0.1 || recentStress < priorStress - 0.5) {
      report.trend = 'improving';
    } else if (recentRegPct < priorRegPct - 0.1 || recentStress > priorStress + 0.5) {
      report.trend = 'dipping';
    } else {
      report.trend = 'holding';
    }
  } else if (sorted.length >= 7) {
    report.trend = 'holding';
  }

  return report;
}

/**
 * Get a straight-talk label for the steadiness score.
 */
export function getSteadinessLabel(score: number): { label: string; emoji: string } {
  if (score >= 80) return { label: 'Rock solid', emoji: '🪨' };
  if (score >= 65) return { label: 'Getting steady', emoji: '⚙️' };
  if (score >= 45) return { label: 'Building', emoji: '🔧' };
  if (score >= 25) return { label: 'In the work', emoji: '🌱' };
  return { label: 'Just starting', emoji: '🧭' };
}

export function getTrendLabel(trend: SteadinessReport['trend']): string {
  switch (trend) {
    case 'improving': return 'Trending up';
    case 'holding': return 'Holding steady';
    case 'dipping': return 'Watch this';
    case 'not-enough-data': return 'Keep checking in';
  }
}
