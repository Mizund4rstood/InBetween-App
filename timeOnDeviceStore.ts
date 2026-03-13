import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionRecord {
  date: string; // YYYY-MM-DD
  totalSeconds: number;
}

interface TimeOnDeviceState {
  sessions: SessionRecord[];
  currentSessionStart: number | null;
  addSeconds: (date: string, seconds: number) => void;
  startSession: () => void;
  endSession: () => void;
  getTodaySeconds: () => number;
  getWeekSeconds: () => number;
  getLast7Days: () => SessionRecord[];
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function last7DayKeys(): string[] {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export const useTimeOnDeviceStore = create<TimeOnDeviceState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionStart: null,

      addSeconds: (date, seconds) =>
        set((state) => {
          const existing = state.sessions.find((s) => s.date === date);
          if (existing) {
            return {
              sessions: state.sessions.map((s) =>
                s.date === date ? { ...s, totalSeconds: s.totalSeconds + seconds } : s
              ),
            };
          }
          return { sessions: [...state.sessions.slice(-60), { date, totalSeconds: seconds }] };
        }),

      startSession: () => set({ currentSessionStart: Date.now() }),

      endSession: () => {
        const { currentSessionStart, addSeconds } = get();
        if (currentSessionStart) {
          const elapsed = Math.floor((Date.now() - currentSessionStart) / 1000);
          if (elapsed > 0) addSeconds(todayKey(), elapsed);
          set({ currentSessionStart: null });
        }
      },

      getTodaySeconds: () => {
        const { sessions, currentSessionStart } = get();
        const today = sessions.find((s) => s.date === todayKey());
        const stored = today?.totalSeconds || 0;
        const live = currentSessionStart ? Math.floor((Date.now() - currentSessionStart) / 1000) : 0;
        return stored + live;
      },

      getWeekSeconds: () => {
        const { sessions, currentSessionStart } = get();
        const keys = new Set(last7DayKeys());
        const stored = sessions.filter((s) => keys.has(s.date)).reduce((a, s) => a + s.totalSeconds, 0);
        const live = currentSessionStart ? Math.floor((Date.now() - currentSessionStart) / 1000) : 0;
        return stored + live;
      },

      getLast7Days: () => {
        const { sessions } = get();
        const keys = last7DayKeys();
        return keys.map((date) => {
          const found = sessions.find((s) => s.date === date);
          return { date, totalSeconds: found?.totalSeconds || 0 };
        });
      },
    }),
    { name: 'inbetween-time-on-device' }
  )
);
