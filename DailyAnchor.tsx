import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ChevronRight, Check } from 'lucide-react';
import { useAppStore } from './appStore';
import { haptics } from './haptics';

const MORNING_FOCUSES = [
  { key: 'calm', emoji: '🌊', label: 'Calm', desc: 'Move through today with ease' },
  { key: 'awareness', emoji: '👁', label: 'Awareness', desc: 'Notice before reacting' },
  { key: 'patience', emoji: '🌱', label: 'Patience', desc: 'Let things unfold' },
  { key: 'balance', emoji: '⚖️', label: 'Balance', desc: 'Stay centered no matter what' },
];

const MORNING_PROMPTS = [
  "What direction do you want today to move?",
  "What's one thing you want to stay aware of today?",
  "If today had a purpose, what would it be?",
  "What would make tonight's version of you proud?",
  "How do you want to show up for yourself today?",
  "What's worth your energy today?",
];

const EVENING_PROMPTS = [
  "What did you notice about yourself today?",
  "Was there a moment where you paused instead of reacting?",
  "What did you handle better than you expected?",
  "What's one thing you chose instead of reacting?",
  "Where did you stay present when it was hard?",
  "What would you tell yourself this morning about today?",
  "What's one thing you're glad you did today?",
];

function getDailyIndex(prompts: string[]): number {
  const day = Math.floor(Date.now() / 86400000);
  return day % prompts.length;
}

export default function DailyAnchor() {
  const { entries } = useAppStore();
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [focusSet, setFocusSet] = useState(false);

  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 14;
  const isEvening = hour >= 18 || hour < 2;

  const dateStr = new Date().toDateString();
  const storageKeyResponse = `anchor_${isMorning ? 'am' : 'pm'}_${dateStr}`;
  const storageKeyFocus = `anchor_focus_${dateStr}`;

  useEffect(() => {
    const storedResponse = localStorage.getItem(storageKeyResponse);
    if (storedResponse) setSubmitted(true);
    const storedFocus = localStorage.getItem(storageKeyFocus);
    if (storedFocus) {
      setSelectedFocus(storedFocus);
      setFocusSet(true);
    }
  }, [storageKeyResponse, storageKeyFocus]);

  if (dismissed || (!isMorning && !isEvening)) return null;

  const Icon = isMorning ? Sun : Moon;
  const label = isMorning ? 'Morning Anchor' : 'Evening Reflection';
  const gradientClass = isMorning
    ? 'from-amber-500/12 via-card to-primary/8 border-amber-400/20'
    : 'from-indigo-500/12 via-card to-violet-500/8 border-indigo-400/20';

  const handleFocusSelect = (key: string) => {
    setSelectedFocus(key);
    localStorage.setItem(storageKeyFocus, key);
    setFocusSet(true);
    haptics.success();
  };

  const handleSubmit = () => {
    if (!response.trim()) return;
    localStorage.setItem(storageKeyResponse, response.trim());
    setSubmitted(true);
    haptics.success();
  };

  // Morning: show focus picker first, then optional prompt
  if (isMorning) {
    const prompt = MORNING_PROMPTS[getDailyIndex(MORNING_PROMPTS)];

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-3xl bg-gradient-to-br ${gradientClass} border shadow-[var(--shadow-card)]`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-background/60">
              <Icon className="w-4 h-4 text-foreground" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground"
          >
            Skip today
          </button>
        </div>

        {/* Focus picker */}
        {!focusSet ? (
          <>
            <p className="text-sm font-serif font-semibold text-foreground mb-4 leading-relaxed">
              What direction do you want today to move?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MORNING_FOCUSES.map(f => (
                <motion.button
                  key={f.key}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleFocusSelect(f.key)}
                  className="p-3 rounded-xl bg-background/60 border border-border/50 text-left hover:bg-background/80 transition-colors"
                >
                  <span className="text-lg">{f.emoji}</span>
                  <p className="text-sm font-bold text-foreground mt-1">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </motion.button>
              ))}
            </div>
          </>
        ) : !submitted ? (
          /* After focus is set, show optional deeper prompt */
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-primary font-semibold capitalize">
                  Today's focus: {selectedFocus}
                </span>
              </div>
              <p className="text-sm font-serif font-semibold text-foreground mb-4 leading-relaxed">
                "{prompt}"
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="One sentence is enough..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!response.trim()}
                  className="px-3 py-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-opacity active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
            <Check className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Intention set. Start your day consciously.</p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Evening reflection
  if (submitted) return null;

  const eveningPrompt = EVENING_PROMPTS[getDailyIndex(EVENING_PROMPTS)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-3xl bg-gradient-to-br ${gradientClass} border shadow-[var(--shadow-card)]`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-background/60">
            <Icon className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground"
        >
          Skip tonight
        </button>
      </div>

      <p className="text-sm font-serif font-semibold text-foreground mb-4 leading-relaxed">
        "{eveningPrompt}"
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={response}
          onChange={e => setResponse(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Even a few words help..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-background/60 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button
          onClick={handleSubmit}
          disabled={!response.trim()}
          className="px-3 py-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-opacity active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
