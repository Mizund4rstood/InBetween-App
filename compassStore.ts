import { create } from 'zustand';
import { supabase } from './client';
import { useMicroWinStore } from './MicroWin';

export interface CompassTrigger {
  id: string;
  user_id: string;
  created_at: string;
  trigger_text: string;
  emotion: string | null;
  intensity: number | null;
  context: string | null;
  category: string | null;
  urge: string | null;
}

export interface CompassChoice {
  id: string;
  user_id: string;
  trigger_id: string | null;
  created_at: string;
  choice_text: string;
  aligned_with_values: boolean | null;
  pause_used: boolean | null;
  outcome_rating: number | null;
  chose_differently: boolean | null;
}

interface CompassState {
  triggers: CompassTrigger[];
  choices: CompassChoice[];
  loading: boolean;

  fetchTriggers: () => Promise<void>;
  fetchChoices: () => Promise<void>;
  addTrigger: (t: Omit<CompassTrigger, 'id' | 'user_id' | 'created_at'>) => Promise<CompassTrigger | null>;
  addChoice: (c: Omit<CompassChoice, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteTrigger: (id: string) => Promise<void>;
}

async function getCurrentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export const useCompassStore = create<CompassState>((set) => ({
  triggers: [],
  choices: [],
  loading: false,

  fetchTriggers: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('compass_triggers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) set({ triggers: data as CompassTrigger[] });
    set({ loading: false });
  },

  fetchChoices: async () => {
    const { data } = await supabase
      .from('compass_choices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (data) set({ choices: data as CompassChoice[] });
  },

  addTrigger: async (t) => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('compass_triggers')
      .insert({ ...t, user_id: userId })
      .select()
      .single();
    if (!error && data) {
      const trigger = data as CompassTrigger;
      set(s => ({ triggers: [trigger, ...s.triggers] }));
      // Micro-win: trigger logged
      useMicroWinStore.getState().trigger('trigger_logged');
      return trigger;
    }
    return null;
  },

  addChoice: async (c) => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('compass_choices')
      .insert({ ...c, user_id: userId })
      .select()
      .single();
    if (!error && data) {
      const choice = data as CompassChoice;
      set(s => ({ choices: [choice, ...s.choices] }));
      
      // Trigger appropriate micro-wins
      const microWin = useMicroWinStore.getState();
      if (choice.pause_used) {
        microWin.trigger('pause_used');
      } else if (choice.chose_differently) {
        microWin.trigger('chose_differently');
      } else if (choice.aligned_with_values) {
        microWin.trigger('aligned_choice');
      }
    }
  },

  deleteTrigger: async (id) => {
    await supabase.from('compass_triggers').delete().eq('id', id);
    set(s => ({
      triggers: s.triggers.filter(t => t.id !== id),
      choices: s.choices.filter(c => c.trigger_id !== id),
    }));
  },
}));
