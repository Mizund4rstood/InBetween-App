import { GratitudeEntry } from './types';
import { tagText } from './analytics';

export interface PatternInsight {
  type: 'theme-mood' | 'best-day' | 'regulation' | 'consistency';
  emoji: string;
  message: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Analyze entries and surface human-readable pattern insights.
 * Requires at least 5 entries for meaningful patterns.
 */
export function generateInsights(entries: GratitudeEntry[]): PatternInsight[] {
  if (entries.length < 5) return [];

  const insights: PatternInsight[] = [];

  // 1. Theme-mood correlation: which themes correlate with higher mood?
  const themeStats: Record<string, { moods: number[]; count: number }> = {};
  entries.forEach(e => {
    const themes = new Set<string>();
    e.items.forEach(item => tagText(item.text).forEach(t => themes.add(t)));
    themes.forEach(theme => {
      if (!themeStats[theme]) themeStats[theme] = { moods: [], count: 0 };
      themeStats[theme].moods.push(e.mood);
      themeStats[theme].count++;
    });
  });

  const overallAvg = entries.reduce((s, e) => s + e.mood, 0) / entries.length;

  Object.entries(themeStats)
    .filter(([_, s]) => s.count >= 3)
    .forEach(([theme, s]) => {
      const themeAvg = s.moods.reduce((a, b) => a + b, 0) / s.moods.length;
      const diff = themeAvg - overallAvg;
      if (diff >= 0.8) {
        insights.push({
          type: 'theme-mood',
          emoji: '✨',
          message: `You tend to feel better on days you notice ${theme}. Your mood averages ${themeAvg.toFixed(1)} vs ${overallAvg.toFixed(1)} overall.`,
          confidence: s.count >= 7 ? 'high' : 'medium',
        });
      }
    });

  // 2. Best day of week
  const dayStats: Record<number, { moods: number[]; count: number }> = {};
  entries.forEach(e => {
    const day = new Date(e.entryDatetime).getDay();
    if (!dayStats[day]) dayStats[day] = { moods: [], count: 0 };
    dayStats[day].moods.push(e.mood);
    dayStats[day].count++;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = -1;
  let bestDayAvg = 0;
  Object.entries(dayStats).forEach(([day, s]) => {
    if (s.count >= 2) {
      const avg = s.moods.reduce((a, b) => a + b, 0) / s.moods.length;
      if (avg > bestDayAvg) {
        bestDayAvg = avg;
        bestDay = Number(day);
      }
    }
  });

  if (bestDay >= 0 && bestDayAvg - overallAvg >= 0.5) {
    insights.push({
      type: 'best-day',
      emoji: '📅',
      message: `${dayNames[bestDay]}s are your strongest days — your mood averages ${bestDayAvg.toFixed(1)}.`,
      confidence: (dayStats[bestDay]?.count ?? 0) >= 4 ? 'high' : 'medium',
    });
  }

  // 3. Regulation pattern
  const regEntries = entries.filter(e => e.regulationState);
  if (regEntries.length >= 3) {
    const regCounts: Record<string, number> = {};
    regEntries.forEach(e => {
      regCounts[e.regulationState!] = (regCounts[e.regulationState!] || 0) + 1;
    });
    const topReg = Object.entries(regCounts).sort((a, b) => b[1] - a[1])[0];
    if (topReg) {
      const pct = Math.round((topReg[1] / regEntries.length) * 100);
      if (pct >= 40) {
        const regMessages: Record<string, string> = {
          grounded: `You feel solid ${pct}% of the time. Your foundation is real.`,
          calm: `You report feeling level ${pct}% of the time. Your wiring is learning safety.`,
          activated: `You notice being wired ${pct}% of the time. Seeing it is how you change it.`,
          dissociated: `You notice checking out ${pct}% of the time. Naming it is how you come back.`,
          hopeful: `You feel hopeful ${pct}% of the time. That is your wiring trusting the future.`,
        };
        insights.push({
          type: 'regulation',
          emoji: '🧠',
          message: regMessages[topReg[0]] || `Your most common state is "${topReg[0]}" (${pct}%).`,
          confidence: regEntries.length >= 7 ? 'high' : 'medium',
        });
      }
    }
  }

  // 4. Consistency insight
  const uniqueDays = new Set(entries.map(e => e.entryDatetime.split('T')[0]));
  const firstDate = new Date(entries[entries.length - 1].entryDatetime);
  const daysSinceStart = Math.max(1, Math.floor((Date.now() - firstDate.getTime()) / 86400000));
  const consistencyPct = Math.round((uniqueDays.size / daysSinceStart) * 100);

  if (daysSinceStart >= 7) {
    if (consistencyPct >= 70) {
      insights.push({
        type: 'consistency',
        emoji: '🔥',
        message: `You checked in ${consistencyPct}% of days since you started. That is not a habit — that is who you are.`,
        confidence: 'high',
      });
    } else if (consistencyPct >= 40) {
      insights.push({
        type: 'consistency',
        emoji: '🌱',
        message: `You checked in ${consistencyPct}% of days. Every time you come back is a choice.`,
        confidence: 'medium',
      });
    }
  }

  return insights.slice(0, 3); // Cap at 3 most relevant
}
