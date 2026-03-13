import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, VisualMode } from '@/stores/appStore';
import { GratitudeEntry } from '@/types';
import { X, Wind, Eye, Timer, ChevronDown } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { fireConfetti } from '@/lib/confetti';
import { sounds } from '@/lib/sounds';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

type Step = 'state' | 'reaction' | 'ground' | 'reward';

const STATE_OPTIONS = [
  { value: 'steady', label: 'Steady', emoji: '🪨' },
  { value: 'irritated', label: 'Irritated', emoji: '🔥' },
  { value: 'overloaded', label: 'Overloaded', emoji: '⚡' },
  { value: 'numb', label: 'Numb', emoji: '🌫️' },
  { value: 'focused', label: 'Focused', emoji: '🎯' },
  { value: 'drained', label: 'Drained', emoji: '🔋' },
  { value: 'restless', label: 'Restless', emoji: '🦎' },
];

const REACTION_OPTIONS = [
  { value: 'reacted', label: 'Reacted', emoji: '⚡' },
  { value: 'paused', label: 'Paused', emoji: '✋' },
  { value: 'chose', label: 'Chose intentionally', emoji: '🧭' },
  { value: 'unsure', label: 'Not sure', emoji: '🤷' },
];

// Map state → regulation for the hidden engine
const STATE_TO_REGULATION: Record<string, string> = {
  steady: 'grounded',
  irritated: 'activated',
  overloaded: 'activated',
  numb: 'dissociated',
  focused: 'calm',
  drained: 'dissociated',
  restless: 'activated',
};

// Map state → mood estimate
const STATE_TO_MOOD: Record<string, number> = {
  steady: 7,
  irritated: 3,
  overloaded: 3,
  numb: 4,
  focused: 8,
  drained: 3,
  restless: 4,
};

const STATE_TO_STRESS: Record<string, number> = {
  steady: 2,
  irritated: 7,
  overloaded: 8,
  numb: 5,
  focused: 3,
  drained: 7,
  restless: 6,
};

// Micro-reset exercises
const MICRO_RESETS = [
  { icon: <Wind className="w-5 h-5" />, label: '4 slow breaths', duration: 16, type: 'breathing' as const },
  { icon: <Eye className="w-5 h-5" />, label: 'Name 3 things you see', duration: 10, type: 'seeing' as const },
  { icon: <Timer className="w-5 h-5" />, label: '5-second pause', duration: 5, type: 'pause' as const },
  { icon: <ChevronDown className="w-5 h-5" />, label: 'Drop your shoulders', duration: 5, type: 'body' as const },
];

// Behavior → reward mapping
function getReward(state: string, reaction: string, didGround: boolean, visualMode: VisualMode): { action: string; emoji: string } {
  if (didGround) {
    switch (visualMode) {
      case 'roots': return { action: 'Fertilizer added — roots strengthening', emoji: '🌿' };
      case 'canopy': return { action: 'Sunlight absorbed — canopy growing', emoji: '☀️' };
      case 'compass': return { action: 'Compass calibrated — bearing sharpened', emoji: '🧭' };
      case 'steel': return { action: 'Heat applied — steel tempering', emoji: '🔥' };
    }
  }

  if (reaction === 'chose' || reaction === 'paused') {
    switch (visualMode) {
      case 'roots': return { action: 'Deep water — roots anchoring', emoji: '💧' };
      case 'canopy': return { action: 'New branch — canopy reaching', emoji: '🌳' };
      case 'compass': return { action: 'True north locked — needle steady', emoji: '🧭' };
      case 'steel': return { action: 'Steel tempered — getting harder', emoji: '⚙️' };
    }
  }

  // Default: checked in
  switch (visualMode) {
    case 'roots': return { action: 'Watered — roots growing', emoji: '💧' };
    case 'canopy': return { action: 'Rain collected — canopy filling', emoji: '🌧️' };
    case 'compass': return { action: 'Bearing logged — compass learning', emoji: '🧭' };
    case 'steel': return { action: 'Ore collected — building stock', emoji: '⛏️' };
  }
}

export default function ExpressCheckin({ onClose, onNavigate }: Props) {
  const [step, setStep] = useState<Step>('state');
  const [selectedState, setSelectedState] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');
  const [didGround, setDidGround] = useState(false);
  const [activeReset, setActiveReset] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const { addEntry, setLastUsedTime, visualMode } = useAppStore();

  // Countdown timer for micro-resets
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            haptics.medium();
            sounds.step();
            setDidGround(true);
            setActiveReset(null);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [countdown]);

  const needsGround = ['irritated', 'overloaded', 'numb', 'drained', 'restless'].includes(selectedState);

  const handleSave = () => {
    const now = new Date();
    setLastUsedTime(now.toISOString());

    const entry: GratitudeEntry = {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      entryDatetime: now.toISOString(),
      mood: STATE_TO_MOOD[selectedState] || 5,
      stress: STATE_TO_STRESS[selectedState] || 5,
      regulationState: (STATE_TO_REGULATION[selectedState] as any) || undefined,
      items: [
        { id: crypto.randomUUID(), text: `State: ${selectedState}` },
        { id: crypto.randomUUID(), text: `Reaction: ${selectedReaction}` },
        ...(didGround ? [{ id: crypto.randomUUID(), text: 'Did a micro-reset' }] : []),
      ],
    };

    addEntry(entry);
    haptics.celebration();
    sounds.save();
    fireConfetti();
    setStep('reward');
  };

  const startReset = (index: number) => {
    haptics.medium();
    setActiveReset(index);
    setCountdown(MICRO_RESETS[index].duration);
  };

  // ─── Step 1: Where are you? ───
  if (step === 'state') {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold">Where are you right now?</h2>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {STATE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { haptics.light(); setSelectedState(opt.value); }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.97] ${
                selectedState === opt.value
                  ? 'bg-primary/15 border-primary/30 shadow-[var(--shadow-card)]'
                  : 'border-border/50 hover:border-primary/20'
              }`}
            >
              <span className="text-2xl block mb-1">{opt.emoji}</span>
              <span className={`text-sm font-semibold ${
                selectedState === opt.value ? 'text-primary' : 'text-foreground'
              }`}>{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { haptics.medium(); sounds.step(); setStep('reaction'); }}
          disabled={!selectedState}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all duration-300 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  }

  // ─── Step 2: React or choose? ───
  if (step === 'reaction') {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold">Did you react or choose?</h2>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 mb-6">
          {REACTION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { haptics.light(); setSelectedReaction(opt.value); }}
              className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] flex items-center gap-3 ${
                selectedReaction === opt.value
                  ? 'bg-primary/15 border-primary/30 shadow-[var(--shadow-card)]'
                  : 'border-border/50 hover:border-primary/20'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className={`text-sm font-semibold ${
                selectedReaction === opt.value ? 'text-primary' : 'text-foreground'
              }`}>{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            haptics.medium();
            sounds.step();
            if (needsGround) {
              setStep('ground');
            } else {
              handleSave();
            }
          }}
          disabled={!selectedReaction}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all duration-300 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          {needsGround ? 'Next: Quick Reset' : 'Log It'}
        </button>

        {!needsGround && selectedReaction && (
          <button
            onClick={() => { setStep('ground'); }}
            className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            I want a quick reset first
          </button>
        )}
      </div>
    );
  }

  // ─── Step 3: Micro-reset (optional) ───
  if (step === 'ground') {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold">Quick Reset</h2>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">Pick one. 5–15 seconds. That's it.</p>

        <div className="space-y-2.5 mb-6">
          {MICRO_RESETS.map((reset, i) => (
            <div key={i}>
              <button
                onClick={() => activeReset === null && startReset(i)}
                disabled={activeReset !== null && activeReset !== i}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 ${
                  activeReset === i
                    ? 'bg-primary/15 border-primary/30 shadow-[var(--shadow-card)]'
                    : didGround && activeReset === null
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-border/50 hover:border-primary/20'
                } ${activeReset !== null && activeReset !== i ? 'opacity-40' : ''}`}
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  {reset.icon}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground">{reset.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{reset.duration}s</span>
                </div>
                {activeReset === i && countdown > 0 && (
                  <div className="text-2xl font-serif font-bold text-primary tabular-nums">
                    {countdown}
                  </div>
                )}
              </button>

              {/* Breathing visual */}
              <AnimatePresence>
                {activeReset === i && countdown > 0 && reset.type === 'breathing' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex justify-center py-4"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40"
                      animate={{ scale: [1, 1.5, 1.5, 1], opacity: [0.5, 1, 1, 0.5] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all duration-300 shadow-[var(--shadow-glow-primary)]"
        >
          {didGround ? 'Log It ✓' : 'Skip & Log'}
        </button>
      </div>
    );
  }

  // ─── Step 4: Reward ───
  const reward = getReward(selectedState, selectedReaction, didGround, visualMode);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, delay: 0.2 }}
        className="text-6xl mb-6"
      >
        {reward.emoji}
      </motion.div>

      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Logged</h2>
      <p className="text-sm text-primary font-semibold mb-1">{reward.action}</p>

      <div className="flex items-center justify-center gap-2 mt-4 mb-8">
        {STATE_OPTIONS.find(s => s.value === selectedState) && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            {STATE_OPTIONS.find(s => s.value === selectedState)?.emoji} {selectedState}
          </span>
        )}
        {REACTION_OPTIONS.find(r => r.value === selectedReaction) && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">
            {REACTION_OPTIONS.find(r => r.value === selectedReaction)?.emoji} {selectedReaction}
          </span>
        )}
        {didGround && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            ✓ reset
          </span>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 rounded-2xl border border-border/50 text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all"
      >
        Done
      </button>
    </motion.div>
  );
}
