import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GratitudeEntry, GroundingSession } from './types';
import { useMicroWinStore } from './MicroWin';

export type AppMode = 'ground' | 'compass';
export type VisualMode = 'roots' | 'canopy' | 'compass' | 'steel';
export type FocusArea = 'emotional-regulation' | 'impulse-control' | 'stress' | 'self-awareness' | 'shame-resilience' | 'identity' | 'gratitude' | 'restlessness';
export type UserIntent = 'build-awareness' | 'manage-urges' | 'track-patterns' | 'stay-grounded' | 'all';

export type AnalyticsWidget = 'mood' | 'habit' | 'grounding' | 'regulation' | 'correlation' | 'themes' | 'bestDays';

interface AppState {
  // Data
  entries: GratitudeEntry[];
  groundingSessions: GroundingSession[];
  
  // UI state
  hasOnboarded: boolean;
  isDarkMode: boolean;
  isSoundEnabled: boolean;
  isTTSEnabled: boolean;
  selectedVoiceId: string;
  lastUsedTime: string | null;
  activeMode: AppMode;
  visualMode: VisualMode;
  enabledWidgets: AnalyticsWidget[];
  focusAreas: FocusArea[];
  userIntent: UserIntent | null;
  
  // Actions
  setOnboarded: () => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  toggleTTS: () => void;
  setSelectedVoiceId: (id: string) => void;
  setLastUsedTime: (time: string) => void;
  setActiveMode: (mode: AppMode) => void;
  setVisualMode: (mode: VisualMode) => void;
  toggleWidget: (widget: AnalyticsWidget) => void;
  setFocusAreas: (areas: FocusArea[]) => void;
  setUserIntent: (intent: UserIntent) => void;
  
  // Entry actions
  addEntry: (entry: GratitudeEntry) => void;
  updateEntry: (id: string, updates: Partial<GratitudeEntry>) => void;
  deleteEntry: (id: string) => void;
  
  // Grounding actions
  addGroundingSession: (session: GroundingSession) => void;
  
  // Data management
  exportData: () => string;
  clearAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      // Cache the dark mode class sync to avoid triggering during hydration
      const syncDarkMode = (isDark: boolean) => {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      return {
      entries: [],
      groundingSessions: [],
      hasOnboarded: false,
      isDarkMode: false,
      isSoundEnabled: true,
      isTTSEnabled: true,
      selectedVoiceId: 'JBFqnCBsd6RMkjVDRZzb',
      lastUsedTime: null,
      activeMode: 'ground',
      visualMode: 'roots',
      enabledWidgets: ['mood', 'habit', 'grounding', 'regulation'],
      focusAreas: [],
      userIntent: null,

      setOnboarded: () => set({ hasOnboarded: true }),
      toggleDarkMode: () => {
        const next = !get().isDarkMode;
        syncDarkMode(next);
        set({ isDarkMode: next });
      },
      toggleSound: () => set(s => ({ isSoundEnabled: !s.isSoundEnabled })),
      toggleTTS: () => set(s => ({ isTTSEnabled: !s.isTTSEnabled })),
      setSelectedVoiceId: (id) => set({ selectedVoiceId: id }),
      setLastUsedTime: (time) => set({ lastUsedTime: time }),
      setActiveMode: (mode) => set({ activeMode: mode }),
      setVisualMode: (mode) => set({ visualMode: mode }),
      toggleWidget: (widget) => set(s => ({
        enabledWidgets: s.enabledWidgets.includes(widget)
          ? s.enabledWidgets.filter(w => w !== widget)
          : [...s.enabledWidgets, widget],
      })),
      setFocusAreas: (areas) => set({ focusAreas: areas }),
      setUserIntent: (intent) => set({ userIntent: intent }),

      addEntry: (entry) => {
        const state = get();
        const todayEntries = state.entries.filter(e => {
          const d = new Date(e.entryDatetime);
          const today = new Date();
          return d.toDateString() === today.toDateString();
        });
        
        set(s => ({ entries: [entry, ...s.entries] }));
        
        // Micro-wins
        const microWin = useMicroWinStore.getState();
        if (todayEntries.length === 0) {
          microWin.trigger('first_of_day');
        } else {
          microWin.trigger('showed_up');
        }
      },
      updateEntry: (id, updates) => set(s => ({
        entries: s.entries.map(e => e.id === id ? { ...e, ...updates } : e),
      })),
      deleteEntry: (id) => set(s => ({
        entries: s.entries.filter(e => e.id !== id),
      })),

      addGroundingSession: (session) => {
        set(s => ({
          groundingSessions: [session, ...s.groundingSessions],
        }));
        // Micro-win for grounding
        const microWin = useMicroWinStore.getState();
        if (session.durationSec >= 30) {
          microWin.trigger('stayed_with_discomfort', `${session.durationSec} seconds`);
        } else {
          microWin.trigger('grounding_complete');
        }
      },

      exportData: () => {
        const { entries, groundingSessions } = get();
        return JSON.stringify({ entries, groundingSessions, exportedAt: new Date().toISOString() }, null, 2);
      },

      clearAllData: () => set({
        entries: [],
        groundingSessions: [],
        hasOnboarded: false,
        lastUsedTime: null,
      }),
    };
    },
    {
      name: 'gratitude-ground-storage',
      skipHydration: false,
      onRehydrateStorage: () => {
        return (state) => {
          if (state?.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        };
      },
    }
  )
);
