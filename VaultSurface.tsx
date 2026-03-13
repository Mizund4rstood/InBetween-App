import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWhyVault, VaultEntry } from '@/hooks/useWhyVault';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_LABELS: Record<string, string> = {
  why_change: 'Why you started',
  who_become: 'Who you\u2019re becoming',
  never_back: 'What you left behind',
};

/**
 * Surfaces a random Why Vault entry when the user needs it.
 * Renders nothing if the vault is empty.
 */
export default function VaultSurface() {
  const navigate = useNavigate();
  const { entries, loading } = useWhyVault();
  const [entry, setEntry] = useState<VaultEntry | null>(null);

  useEffect(() => {
    if (!loading && entries.length > 0) {
      // Rotate based on day so it feels intentional, not random
      const dayIndex = new Date().getDate() % entries.length;
      setEntry(entries[dayIndex]);
    }
  }, [loading, entries]);

  if (loading || !entry) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-5 rounded-3xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {CATEGORY_LABELS[entry.category] || 'From your vault'}
        </span>
      </div>
      <p className="text-sm font-serif text-foreground leading-relaxed whitespace-pre-wrap">
        &ldquo;{entry.text}&rdquo;
      </p>
      <p className="text-[10px] text-muted-foreground/60 mt-3 italic">
        &mdash; You wrote this. Remember why.
      </p>
      <button
        onClick={() => navigate('/vault')}
        className="mt-3 text-xs text-primary font-semibold hover:underline"
      >
        Open your vault
      </button>
    </motion.div>
  );
}
