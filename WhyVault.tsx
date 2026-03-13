import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWhyVault, VaultCategory } from '@/hooks/useWhyVault';
import { usePremiumStore } from '@/stores/premiumStore';
import { PremiumGate } from '@/components/PremiumGate';
import { haptics } from '@/lib/haptics';
import { sounds } from '@/lib/sounds';
import { ChevronLeft, Plus, Pencil, Trash2, Lock, Heart, Compass, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES: { key: VaultCategory; label: string; prompt: string; emoji: string; icon: typeof Heart }[] = [
  {
    key: 'why_change',
    label: 'Why I Want to Change',
    prompt: 'What drives you? What pain or hope is pushing you forward?',
    emoji: '🔥',
    icon: Heart,
  },
  {
    key: 'who_become',
    label: 'Who I Want to Become',
    prompt: 'Describe the person you are becoming. How do they think, act, and feel?',
    emoji: '🌟',
    icon: Compass,
  },
  {
    key: 'never_back',
    label: 'What I Never Want to Go Back To',
    prompt: 'What chapter is closing? What are you leaving behind?',
    emoji: '🚪',
    icon: Shield,
  },
];

export default function WhyVaultPage() {
  const navigate = useNavigate();
  const { entries, loading, upsert, remove, getByCategory } = useWhyVault();
  const { useTrialAccess } = usePremiumStore();
  const [editingCategory, setEditingCategory] = useState<VaultCategory | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [showGate, setShowGate] = useState(false);

  // Trial-taste: check on mount
  useState(() => {
    const granted = useTrialAccess('why_vault');
    if (!granted) setShowGate(true);
  });

  if (showGate) {
    return (
      <div className="max-w-lg mx-auto p-4 pt-20 animate-fade-in">
        <PremiumGate feature="why_vault" inline>
          <div />
        </PremiumGate>
      </div>
    );
  }

  const handleStartAdd = (cat: VaultCategory) => {
    haptics.light();
    setEditingCategory(cat);
    setEditingId(null);
    setDraft('');
  };

  const handleStartEdit = (entry: { id: string; category: VaultCategory; text: string }) => {
    haptics.light();
    setEditingCategory(entry.category);
    setEditingId(entry.id);
    setDraft(entry.text);
  };

  const handleSave = async () => {
    if (!draft.trim() || !editingCategory) return;
    setSaving(true);
    haptics.medium();
    sounds.save();
    await upsert(editingCategory, draft.trim(), editingId || undefined);
    setEditingCategory(null);
    setEditingId(null);
    setDraft('');
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    haptics.medium();
    await remove(id);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditingId(null);
    setDraft('');
  };

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pt-10 pb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Your Why Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your words. Surfaced when you need them most.
          </p>
        </div>
      </div>

      {/* Intro card */}
      {entries.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/15 text-center"
        >
          <div className="text-4xl mb-3">🔐</div>
          <p className="text-sm font-serif font-semibold text-foreground leading-relaxed">
            Write down why you started this journey.
          </p>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            When your grounding wavers or the noise gets loud, we surface your own words.
            Nothing we write could be as powerful.
          </p>
        </motion.div>
      )}

      {/* Editor */}
      <AnimatePresence>
        {editingCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-5 rounded-2xl bg-card border border-primary/15 shadow-[var(--shadow-card)]">
              <p className="text-sm font-bold text-foreground mb-1">
                {CATEGORIES.find(c => c.key === editingCategory)?.emoji}{' '}
                {CATEGORIES.find(c => c.key === editingCategory)?.label}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {CATEGORIES.find(c => c.key === editingCategory)?.prompt}
              </p>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Write from the heart..."
                rows={4}
                autoFocus
                className="w-full p-4 rounded-xl bg-background border border-border/50 text-sm outline-none resize-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSave}
                  disabled={!draft.trim() || saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {editingId ? 'Update' : 'Save to Vault'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-3 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div className="space-y-6">
        {CATEGORIES.map((cat, catIdx) => {
          const catEntries = getByCategory(cat.key);
          const Icon = cat.icon;

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold">{cat.emoji} {cat.label}</h2>
                </div>
                <button
                  onClick={() => handleStartAdd(cat.key)}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {catEntries.length === 0 ? (
                <button
                  onClick={() => handleStartAdd(cat.key)}
                  className="w-full p-4 rounded-2xl border border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all text-center"
                >
                  {cat.prompt}
                </button>
              ) : (
                <div className="space-y-2">
                  {catEntries.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
                    >
                      <p className="text-sm text-foreground leading-relaxed font-serif whitespace-pre-wrap">
                        {entry.text}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer message */}
      {entries.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] text-muted-foreground/60 text-center mt-8 leading-relaxed"
        >
          Your vault is private. These words surface only for you, only when it matters.
        </motion.p>
      )}
    </div>
  );
}
