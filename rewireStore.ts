import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── 12-Week Rewire Program Engine ───
// Phase 1 (Wk 1-3): Awareness — just notice
// Phase 2 (Wk 4-6): Delay — increase pause time
// Phase 3 (Wk 7-9): Replace — install alternatives
// Phase 4 (Wk 10-12): Identity — internalize control

export type RewirePhase = 1 | 2 | 3 | 4;
export type UrgeType = 'drinking' | 'spiral' | 'avoidance' | 'anger' | 'other';

export interface UrgeEntry {
  id: string;
  createdAt: string;
  urgeType: UrgeType;
  trigger: string;
  intensity: number; // 1-5
  delaySec: number; // seconds they waited before acting
  actedOnUrge: boolean;
  replacementUsed: string | null; // e.g. 'grounding', 'cold water', 'walk'
  notes: string;
}

export interface RewireState {
  // Program state
  startDate: string | null; // ISO date when they started
  urges: UrgeEntry[];
  activeUrgeTypes: UrgeType[]; // what they're working on

  // Actions
  startProgram: (urgeTypes: UrgeType[]) => void;
  addUrge: (urge: UrgeEntry) => void;
  getPhase: () => RewirePhase;
  getWeek: () => number;
  getMetrics: () => RewireMetrics;
}

export interface RewireMetrics {
  totalUrges: number;
  urgeFrequencyPerWeek: { week: number; count: number }[];
  avgIntensity: number;
  avgIntensityRecent: number; // last 7 days
  avgDelaySec: number;
  avgDelaySecRecent: number;
  delayStrengthScore: number; // 0-100
  replacementRate: number; // 0-1
  replacementRateRecent: number;
  actedOnUrgeRate: number; // 0-1
  actedOnUrgeRateRecent: number;
  topReplacements: { name: string; count: number }[];
  weeklyTrend: { week: number; delayAvg: number; replacementRate: number; actedRate: number }[];
}

const REPLACEMENT_OPTIONS: Record<UrgeType, string[]> = {
  drinking: ['Grounding exercise', 'Cold water', 'Walk', 'Text someone', '"Not today" commitment', 'Deep breaths'],
  spiral: ['Write 1 sentence', 'Label the distortion', 'Name 3 things I see', 'Move my body', 'Call someone'],
  avoidance: ['Do 5% of the task', '2-minute exposure', 'Set a timer', 'Break it smaller', 'Just start'],
  anger: ['Walk away for 60s', 'Cold water on wrists', 'Count to 10', 'Squeeze something', 'Deep breaths'],
  other: ['Grounding', 'Deep breaths', 'Walk', 'Cold water', 'Talk to someone'],
};

export { REPLACEMENT_OPTIONS };

export const useRewireStore = create<RewireState>()(
  persist(
    (set, get) => ({
      startDate: null,
      urges: [],
      activeUrgeTypes: [],

      startProgram: (urgeTypes) => set({
        startDate: new Date().toISOString(),
        activeUrgeTypes: urgeTypes,
        urges: [],
      }),

      addUrge: (urge) => set(s => ({
        urges: [urge, ...s.urges],
      })),

      getPhase: () => {
        const { startDate } = get();
        if (!startDate) return 1;
        const daysSince = Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000);
        const week = Math.floor(daysSince / 7) + 1;
        if (week <= 3) return 1;
        if (week <= 6) return 2;
        if (week <= 9) return 3;
        return 4;
      },

      

      getWeek: () => {
        const { startDate } = get();
        if (!startDate) return 1;
        return Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000 / 7) + 1;
      },

      getMetrics: () => {
        const { urges, startDate } = get();
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 86400000;

        const recent = urges.filter(u => new Date(u.createdAt).getTime() >= sevenDaysAgo);
        const totalUrges = urges.length;

        // Avg intensity
        const avgIntensity = totalUrges > 0
          ? Math.round((urges.reduce((s, u) => s + u.intensity, 0) / totalUrges) * 10) / 10
          : 0;
        const avgIntensityRecent = recent.length > 0
          ? Math.round((recent.reduce((s, u) => s + u.intensity, 0) / recent.length) * 10) / 10
          : 0;

        // Avg delay
        const avgDelaySec = totalUrges > 0
          ? Math.round(urges.reduce((s, u) => s + u.delaySec, 0) / totalUrges)
          : 0;
        const avgDelaySecRecent = recent.length > 0
          ? Math.round(recent.reduce((s, u) => s + u.delaySec, 0) / recent.length)
          : 0;

        // Delay strength score (0-100): based on average delay, 300s = 100
        const delayStrengthScore = Math.min(100, Math.round((avgDelaySecRecent / 300) * 100));

        // Replacement rate
        const withReplacement = urges.filter(u => u.replacementUsed).length;
        const replacementRate = totalUrges > 0 ? Math.round((withReplacement / totalUrges) * 100) / 100 : 0;
        const recentWithReplacement = recent.filter(u => u.replacementUsed).length;
        const replacementRateRecent = recent.length > 0 ? Math.round((recentWithReplacement / recent.length) * 100) / 100 : 0;

        // Acted on urge rate
        const acted = urges.filter(u => u.actedOnUrge).length;
        const actedOnUrgeRate = totalUrges > 0 ? Math.round((acted / totalUrges) * 100) / 100 : 0;
        const recentActed = recent.filter(u => u.actedOnUrge).length;
        const actedOnUrgeRateRecent = recent.length > 0 ? Math.round((recentActed / recent.length) * 100) / 100 : 0;

        // Top replacements
        const repCounts = new Map<string, number>();
        urges.forEach(u => {
          if (u.replacementUsed) repCounts.set(u.replacementUsed, (repCounts.get(u.replacementUsed) || 0) + 1);
        });
        const topReplacements = [...repCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        // Weekly trend
        const weeklyMap = new Map<number, UrgeEntry[]>();
        urges.forEach(u => {
          if (!startDate) return;
          const week = Math.floor((new Date(u.createdAt).getTime() - new Date(startDate).getTime()) / 86400000 / 7) + 1;
          if (!weeklyMap.has(week)) weeklyMap.set(week, []);
          weeklyMap.get(week)!.push(u);
        });

        const weeklyTrend = [...weeklyMap.entries()]
          .sort(([a], [b]) => a - b)
          .slice(-12)
          .map(([week, entries]) => ({
            week,
            delayAvg: Math.round(entries.reduce((s, u) => s + u.delaySec, 0) / entries.length),
            replacementRate: Math.round((entries.filter(u => u.replacementUsed).length / entries.length) * 100) / 100,
            actedRate: Math.round((entries.filter(u => u.actedOnUrge).length / entries.length) * 100) / 100,
          }));

        // Urge frequency per week
        const urgeFrequencyPerWeek = [...weeklyMap.entries()]
          .sort(([a], [b]) => a - b)
          .map(([week, entries]) => ({ week, count: entries.length }));

        return {
          totalUrges, urgeFrequencyPerWeek, avgIntensity, avgIntensityRecent,
          avgDelaySec, avgDelaySecRecent, delayStrengthScore,
          replacementRate, replacementRateRecent,
          actedOnUrgeRate, actedOnUrgeRateRecent,
          topReplacements, weeklyTrend,
        };
      },
    }),
    { name: 'rewire-storage' }
  )
);
