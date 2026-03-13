import { useState, useEffect, useRef } from 'react';
import { useRewireStore, UrgeType, UrgeEntry, REPLACEMENT_OPTIONS } from './rewireStore';
import { haptics } from './haptics';
import { sounds } from './sounds';
import { fireConfetti } from './confetti';
import { X, Timer, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
}

type Step = 'trigger' | 'timer' | 'outcome' | 'done';

const URGE_TYPES: { value: UrgeType; label: string; emoji: string }[] = [
  { value: 'drinking', label: 'Drinking urge', emoji: '🍺' },
  { value: 'spiral', label: 'Emotional spiral', emoji: '🌀' },
  { value: 'avoidance', label: 'Avoiding something', emoji: '🚪' },
  { value: 'anger', label: 'Anger/reactivity', emoji: '🔥' },
  { value: 'other', label: 'Other urge', emoji: '⚡' },
];

export default function UrgeLogger({ onClose }: Props) {
  const { addUrge, activeUrgeTypes, getPhase } = useRewireStore();
  const phase = getPhase();

  const [step, setStep] = useState<Step>('trigger');
  const [urgeType, setUrgeType] = useState<UrgeType | ''>('');
  const [trigger, setTrigger] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [actedOnUrge, setActedOnUrge] = useState<boolean | null>(null);
  const [replacementUsed, setReplacementUsed] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef<number>(0);

  // Show only relevant urge types if user configured them
  const displayTypes = activeUrgeTypes.length > 0
    ? URGE_TYPES.filter(t => activeUrgeTypes.includes(t.value))
    : URGE_TYPES;

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [timerRunning]);

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    haptics.medium();
    sounds.step();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!urgeType) return;

    const entry: UrgeEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      urgeType: urgeType as UrgeType,
      trigger,
      intensity,
      delaySec: elapsed,
      actedOnUrge: actedOnUrge ?? false,
      replacementUsed,
      notes: '',
    };

    addUrge(entry);
    haptics.celebration();
    sounds.save();

    if (!actedOnUrge && elapsed >= 60) {
      fireConfetti();
    }

    setStep('done');
  };

  // ─── Step 1: What's happening? ───
  if (step === 'trigger') {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold">What's the urge?</h2>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {displayTypes.map(opt => (
            <button
              key={opt.value}
              onClick={() => { haptics.light(); setUrgeType(opt.value); }}
              className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] flex items-center gap-3 ${
                urgeType === opt.value
                  ? 'bg-primary/15 border-primary/30 shadow-[var(--shadow-card)]'
                  : 'border-border/50 hover:border-primary/20'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className={`text-sm font-semibold ${urgeType === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
            </button>
          ))}
        </div>

        {urgeType && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <input
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
              placeholder="What triggered it? (optional)"
              className="w-full p-3 rounded-xl border border-border/50 bg-card text-sm mb-4 focus:outline-none focus:border-primary/30"
            />

            <div className="mb-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Intensity</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => { haptics.light(); setIntensity(n); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      intensity === n
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">Mild</span>
                <span className="text-[9px] text-muted-foreground">Overwhelming</span>
              </div>
            </div>
          </motion.div>
        )}

        <button
          onClick={() => {
            haptics.medium();
            sounds.step();
            if (phase >= 2) {
              setStep('timer');
              setTimerRunning(true);
            } else {
              setStep('outcome');
            }
          }}
          disabled={!urgeType}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          {phase >= 2 ? 'Start the Timer' : 'Next'}
        </button>
      </div>
    );
  }

  // ─── Step 2: Urge Timer (Phase 2+) ───
  if (step === 'timer') {
    const targetSec = 60;
    const progress = Math.min(1, elapsed / targetSec);
    const hitTarget = elapsed >= targetSec;

    return (
      <div className="animate-fade-in text-center">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold">Ride the wave</h2>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          The urge peaks and passes. You don't have to act on it.
        </p>

        {/* Timer circle */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none"
              stroke={hitTarget ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Timer className={`w-5 h-5 mb-1 ${hitTarget ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-4xl font-serif font-bold tabular-nums">{formatTime(elapsed)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {hitTarget ? 'You made it.' : `${formatTime(targetSec - elapsed)} to go`}
            </p>
          </div>
        </div>

        {hitTarget && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-primary mb-4"
          >
            60 seconds. That's a rep. The urge didn't win.
          </motion.p>
        )}

        <button
          onClick={() => { stopTimer(); setStep('outcome'); }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
        >
          {timerRunning ? "I'm ready to log" : 'Continue'}
        </button>

        {!hitTarget && (
          <p className="text-[10px] text-muted-foreground mt-3">
            Even 10 seconds of delay rewires your brain.
          </p>
        )}
      </div>
    );
  }

  // ─── Step 3: Outcome ───
  if (step === 'outcome') {
    const replacements = urgeType ? REPLACEMENT_OPTIONS[urgeType as UrgeType] : [];

    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold">What happened?</h2>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Did you act on the urge?</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => { haptics.light(); setActedOnUrge(true); }}
            className={`p-4 rounded-2xl border text-center transition-all ${
              actedOnUrge === true ? 'bg-accent/15 border-accent/30' : 'border-border/50'
            }`}
          >
            <span className="text-sm font-semibold">Yes</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">No judgment</p>
          </button>
          <button
            onClick={() => { haptics.light(); setActedOnUrge(false); }}
            className={`p-4 rounded-2xl border text-center transition-all ${
              actedOnUrge === false ? 'bg-primary/15 border-primary/30' : 'border-border/50'
            }`}
          >
            <span className="text-sm font-semibold">No</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Rode it out</p>
          </button>
        </div>

        {/* Replacement behaviors (Phase 3+) */}
        {phase >= 3 && actedOnUrge === false && replacements.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">What did you do instead?</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {replacements.map(r => (
                <button
                  key={r}
                  onClick={() => { haptics.light(); setReplacementUsed(replacementUsed === r ? null : r); }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    replacementUsed === r
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-muted/50 text-muted-foreground border border-transparent'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <button
          onClick={handleSave}
          disabled={actedOnUrge === null}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          Log It
        </button>
      </div>
    );
  }

  // ─── Step 4: Done ───
  const delayMsg = elapsed >= 120
    ? "Two minutes. That's serious self-control."
    : elapsed >= 60
      ? "60 seconds. That's a rep. The wiring is changing."
      : elapsed >= 30
        ? "30 seconds of delay. That's not nothing."
        : "You noticed. That's where it starts.";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, delay: 0.2 }}
        className="text-6xl mb-6"
      >
        {actedOnUrge ? '📝' : '💪'}
      </motion.div>

      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Logged</h2>
      <p className="text-sm text-primary font-semibold mb-1">{delayMsg}</p>

      {!actedOnUrge && replacementUsed && (
        <p className="text-xs text-muted-foreground mt-2">
          Used: {replacementUsed}
        </p>
      )}

      {actedOnUrge && (
        <p className="text-xs text-muted-foreground mt-2">
          No shame. You logged it. That's awareness.
        </p>
      )}

      <div className="flex items-center justify-center gap-2 mt-4 mb-8">
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
          ⚡ {intensity}/5
        </span>
        {elapsed > 0 && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">
            ⏱ {formatTime(elapsed)} delay
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
