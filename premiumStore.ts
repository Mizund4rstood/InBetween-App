import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PremiumFeature =
  | 'deep_analytics'
  | 'regulation_trends'
  | 'behavior_loop'
  | 'crisis_toolkit'
  | 'why_vault'
  | 'voice_grounding'
  | 'custom_grounding'
  | 'unlimited_interventions';

// Features included in free tier
const FREE_FEATURES = new Set<string>([
  'daily_log',
  'basic_mood',
  'basic_grounding',
]);

// Trial: each premium feature gets one free taste
const TRIAL_LIMIT = 1;

interface PremiumState {
  isPremium: boolean;
  trialUses: Record<PremiumFeature, number>;

  // Actions
  setPremium: (value: boolean) => void;
  canAccess: (feature: PremiumFeature) => boolean;
  useTrialAccess: (feature: PremiumFeature) => boolean; // returns true if access granted
  getTrialRemaining: (feature: PremiumFeature) => number;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      trialUses: {} as Record<PremiumFeature, number>,

      setPremium: (value) => set({ isPremium: value }),

      canAccess: (feature) => {
        const { isPremium, trialUses } = get();
        if (isPremium) return true;
        const used = trialUses[feature] || 0;
        return used < TRIAL_LIMIT;
      },

      useTrialAccess: (feature) => {
        const { isPremium, trialUses } = get();
        if (isPremium) return true;
        const used = trialUses[feature] || 0;
        if (used < TRIAL_LIMIT) {
          set({
            trialUses: { ...trialUses, [feature]: used + 1 },
          });
          return true;
        }
        return false;
      },

      getTrialRemaining: (feature) => {
        const { isPremium, trialUses } = get();
        if (isPremium) return Infinity;
        const used = trialUses[feature] || 0;
        return Math.max(0, TRIAL_LIMIT - used);
      },
    }),
    {
      name: 'inbetween-premium',
    }
  )
);

export const PREMIUM_FEATURES: Record<PremiumFeature, { label: string; description: string; emoji: string }> = {
  deep_analytics: {
    label: 'Deep Pattern Analytics',
    description: 'See correlations, themes, and personal insights that emerge over time.',
    emoji: '📊',
  },
  regulation_trends: {
    label: 'Nervous System Trends',
    description: 'Track your regulation patterns and grounding score over weeks.',
    emoji: '🧠',
  },
  behavior_loop: {
    label: 'Behavior Loop Visualizer',
    description: 'Map and edit your trigger \u2192 outcome patterns visually.',
    emoji: '🔄',
  },
  crisis_toolkit: {
    label: 'Crisis Stabilization',
    description: 'Full self-soothing toolkit and crisis resources when you need them most.',
    emoji: '🛡\uFE0F',
  },
  why_vault: {
    label: 'Your Why Vault',
    description: 'Write your deepest reasons and see them surfaced when it matters.',
    emoji: '🔐',
  },
  voice_grounding: {
    label: 'Voice-Guided Sessions',
    description: 'AI-generated voice guiding you through grounding exercises.',
    emoji: '🎙\uFE0F',
  },
  custom_grounding: {
    label: 'Custom Grounding Plans',
    description: 'Build personalized grounding routines tailored to your patterns.',
    emoji: '🪴',
  },
  unlimited_interventions: {
    label: 'Unlimited Interventions',
    description: 'Access all micro-interventions, anytime, as many as you need.',
    emoji: '⚡',
  },
};
