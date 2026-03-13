/**
 * Pearson correlation coefficient between two arrays.
 * Returns NaN if fewer than 2 data points or zero variance.
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return NaN;

  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return NaN;
  return num / den;
}

/**
 * Simple keyword tagging for gratitude items.
 */
const tagKeywords: Record<string, string[]> = {
  family: ['family', 'mom', 'dad', 'parent', 'sibling', 'brother', 'sister', 'child', 'son', 'daughter', 'spouse', 'partner', 'husband', 'wife'],
  health: ['health', 'body', 'exercise', 'sleep', 'energy', 'breathing', 'lungs', 'heart', 'legs', 'hands', 'eyes', 'healing', 'walk', 'run'],
  work: ['work', 'job', 'career', 'colleague', 'project', 'accomplish', 'finish', 'meeting', 'goal', 'deadline', 'task'],
  nature: ['nature', 'tree', 'flower', 'sky', 'sun', 'rain', 'bird', 'ocean', 'mountain', 'garden', 'plant', 'animal', 'sunset', 'sunrise', 'star', 'cloud', 'water'],
  friends: ['friend', 'laugh', 'fun', 'social', 'together', 'hangout', 'conversation'],
  food: ['food', 'meal', 'eat', 'cook', 'coffee', 'tea', 'drink', 'taste', 'delicious', 'restaurant'],
  home: ['home', 'house', 'cozy', 'comfort', 'warm', 'bed', 'room', 'safe', 'shelter', 'roof'],
  growth: ['learn', 'grow', 'improve', 'progress', 'understand', 'discover', 'knowledge', 'wisdom', 'insight'],
};

export function tagText(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      tags.push(tag);
    }
  }
  return tags;
}

/**
 * Get current streak of consecutive days with entries.
 */
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = [...new Set(dates.map(d => d.split('T')[0]))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];

  let streak = 0;
  let checkDate = new Date(today);

  // Allow today or yesterday as start
  if (uniqueDays[0] !== today) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (uniqueDays[0] !== checkDate.toISOString().split('T')[0]) return 0;
  }

  for (const day of uniqueDays) {
    const expected = checkDate.toISOString().split('T')[0];
    if (day === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (day < expected) {
      break;
    }
  }

  return streak;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}
