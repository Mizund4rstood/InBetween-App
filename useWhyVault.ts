import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type VaultCategory = 'why_change' | 'who_become' | 'never_back';

export interface VaultEntry {
  id: string;
  user_id: string;
  category: VaultCategory;
  text: string;
  created_at: string;
  updated_at: string;
}

async function getCurrentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export function useWhyVault() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('why_vault')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setEntries(data as VaultEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const upsert = useCallback(async (category: VaultCategory, text: string, existingId?: string) => {
    const userId = await getCurrentUserId();
    if (existingId) {
      const { data } = await supabase
        .from('why_vault')
        .update({ text, updated_at: new Date().toISOString() })
        .eq('id', existingId)
        .select()
        .single();
      if (data) {
        setEntries(prev => prev.map(e => e.id === existingId ? data as VaultEntry : e));
      }
    } else {
      const { data } = await supabase
        .from('why_vault')
        .insert({ user_id: userId, category, text })
        .select()
        .single();
      if (data) {
        setEntries(prev => [...prev, data as VaultEntry]);
      }
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('why_vault').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getByCategory = useCallback((cat: VaultCategory) => {
    return entries.filter(e => e.category === cat);
  }, [entries]);

  const getRandomEntry = useCallback(() => {
    if (entries.length === 0) return null;
    return entries[Math.floor(Math.random() * entries.length)];
  }, [entries]);

  return { entries, loading, upsert, remove, getByCategory, getRandomEntry, refetch: fetch };
}
