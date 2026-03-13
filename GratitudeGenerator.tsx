import { useState, useCallback } from 'react';
import { useAppStore } from './appStore';
import { GratitudeEntry, RegulationState } from './types';
import { Sparkles, X, ChevronLeft, Shield, Wind, Brain, Clock, MessageSquare, Compass } from 'lucide-react';
import { haptics } from './haptics';
import { fireConfetti } from './confetti';
import { sounds } from './sounds';

interface Props {
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

type Step = 'checkin' | 'review' | 'intervention';

const REGULATION_OPTIONS: { value: RegulationState; label: string; emoji: string }[] = [
  { value: 'calm', label: 'Level', emoji: '🌊' },
  { value: 'activated', label: 'Wired', emoji: '⚡' },
  { value: 'dissociated', label: 'Checked out', emoji: '🌫️' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌱' },
  { value: 'grounded', label: 'Solid', emoji: '🪨' },
];

const REACTION_OPTIONS = [
  { label: 'I reacted', emoji: '⚡', value: 'reacted' },
  { label: 'I chose', emoji: '🧭', value: 'chose' },
  { label: 'Both', emoji: '🔄', value: 'both' },
  { label: 'Nothing happened', emoji: '🌊', value: 'nothing' },
];

export default function GratitudeGenerator({ onClose, onNavigate }: Props) {
  const [step, setStep] = useState<Step>('checkin');

  // Check-in answers
  const [headAnswer, setHeadAnswer] = useState('');
  const [triggerAnswer, setTriggerAnswer] = useState('');
  const [reactionChoice, setReactionChoice] = useState('');

  // Review
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [regulationState, setRegulationState] = useState<RegulationState | null>(null);
  const [note, setNote] = useState('');
  const { addEntry, lastUsedTime, setLastUsedTime } = useAppStore();

  const [showReframe, setShowReframe] = useState(false);
  const [showPauseScript, setShowPauseScript] = useState(false);

  const needsIntervention = useCallback(() => {
    return stress >= 7 || regulationState === 'activated' || regulationState === 'dissociated';
  }, [stress, regulationState]);

  const handleSave = () => {
    const now = new Date();
    const entryTime = lastUsedTime || now.toISOString();
    setLastUsedTime(now.toISOString());

    const items = [
      { id: crypto.randomUUID(), text: headAnswer || 'No answer' },
      ...(triggerAnswer ? [{ id: crypto.randomUUID(), text: triggerAnswer }] : []),
      ...(reactionChoice ? [{ id: crypto.randomUUID(), text: `Reaction: ${reactionChoice}` }] : []),
    ];

    const entry: GratitudeEntry = {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      entryDatetime: entryTime,
      mood,
      stress,
      note: note || undefined,
      regulationState: regulationState || undefined,
      items,
    };
    addEntry(entry);
    haptics.celebration();
    sounds.save();
    fireConfetti();

    if (needsIntervention()) {
      setTimeout(() => setStep('intervention'), 400);
    } else {
      setTimeout(onClose, 600);
    }
  };

  // ─── Check-In: 3 Direct Questions ───
  if (step === 'checkin') {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-serif font-bold">Check Your Bearings</h2>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-8">Short. Honest. No wrong answers.</p>

        <div className="space-y-6 mb-8">
          {/* Q1: Head */}
          <div>
            <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
              <span className="text-lg">🧠</span> How was your head today?
            </label>
            <textarea
              value={headAnswer}
              onChange={e => setHeadAnswer(e.target.value)}
              placeholder="Noisy, clear, foggy, racing, still…"
              rows={2}
              className="w-full p-4 rounded-2xl bg-card border border-border/50 text-sm outline-none resize-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-[var(--shadow-card)]"
            />
          </div>

          {/* Q2: Trigger */}
          <div>
            <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span> What set you off?
            </label>
            <textarea
              value={triggerAnswer}
              onChange={e => setTriggerAnswer(e.target.value)}
              placeholder="A conversation, a thought, nothing specific…"
              rows={2}
              className="w-full p-4 rounded-2xl bg-card border border-border/50 text-sm outline-none resize-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-[var(--shadow-card)]"
            />
          </div>

          {/* Q3: React or Choose */}
          <div>
            <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <span className="text-lg">⚖️</span> Did you react or choose?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REACTION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    haptics.light();
                    setReactionChoice(reactionChoice === opt.value ? '' : opt.value);
                  }}
                  className={`p-3.5 rounded-2xl border text-sm font-medium transition-all duration-200 text-left ${
                    reactionChoice === opt.value
                      ? 'bg-primary/15 border-primary/30 text-primary font-semibold shadow-[var(--shadow-card)]'
                      : 'border-border/50 text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  <span className="text-lg mr-2">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            haptics.medium();
            sounds.step();
            setStep('review');
          }}
          disabled={!headAnswer.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          Next: How Do You Feel?
        </button>
      </div>
    );
  }

  // ─── Micro-Intervention ───
  if (step === 'intervention') {
    const stateLabel = regulationState === 'activated' ? 'wired'
      : regulationState === 'dissociated' ? 'checked out'
      : 'stressed';

    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8 pt-4">
          <div className="text-4xl mb-4 animate-float">🫶</div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Logged</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You're running {stateLabel} right now.<br />
            Want a quick reset?
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => { haptics.medium(); onClose(); onNavigate?.('/grounding'); }}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] flex items-center gap-4 text-left hover:border-primary/30 active:scale-[0.98] transition-all duration-200"
          >
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">60-Second Reset</p>
              <p className="text-xs text-muted-foreground mt-0.5">Quick 5-4-3-2-1 — get back in your body</p>
            </div>
          </button>

          <button
            onClick={() => { haptics.medium(); onClose(); onNavigate?.('/grounding'); }}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] flex items-center gap-4 text-left hover:border-primary/30 active:scale-[0.98] transition-all duration-200"
          >
            <div className="p-2.5 rounded-xl bg-accent/10 shrink-0">
              <Wind className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">4-7-8 Breathing</p>
              <p className="text-xs text-muted-foreground mt-0.5">Settle the wiring in 60 seconds</p>
            </div>
          </button>

          <button
            onClick={() => { haptics.light(); setShowReframe(!showReframe); setShowPauseScript(false); }}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] flex items-center gap-4 text-left hover:border-primary/30 active:scale-[0.98] transition-all duration-200"
          >
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Flip the Script</p>
              <p className="text-xs text-muted-foreground mt-0.5">Change the thought, change the feeling</p>
            </div>
          </button>

          {showReframe && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-fade-in">
              <p className="text-sm font-serif font-semibold text-foreground mb-2">Try this:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Name the thought causing stress.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Ask: "Is this a fact or an interpretation?"</li>
                <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Find one alternative explanation.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Ask: "What would I tell a friend?"</li>
              </ol>
            </div>
          )}

          <button
            onClick={() => { haptics.light(); setShowPauseScript(!showPauseScript); setShowReframe(false); }}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] flex items-center gap-4 text-left hover:border-primary/30 active:scale-[0.98] transition-all duration-200"
          >
            <div className="p-2.5 rounded-xl bg-accent/10 shrink-0">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Pause Before You Move</p>
              <p className="text-xs text-muted-foreground mt-0.5">The space between impulse and action — that's yours</p>
            </div>
          </button>

          {showPauseScript && (
            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 animate-fade-in">
              <p className="text-sm font-serif font-semibold text-foreground mb-3">Read this slowly:</p>
              <div className="space-y-3 text-sm text-foreground leading-relaxed">
                <p>"I notice I'm feeling <span className="font-semibold text-accent">{stateLabel}</span> right now."</p>
                <p>"This feeling is real, but it's not the whole picture."</p>
                <p>"I don't need to act on it right now."</p>
                <p>"I can wait. I can breathe. I can choose."</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                — The space between trigger and response is where you live.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl border border-border/50 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
        >
          I'm okay — close
        </button>
      </div>
    );
  }

  // ─── Review: Mood, Stress, Regulation ───
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setStep('checkin')} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-serif font-bold">How Do You Feel?</h2>
        <div className="w-10" />
      </div>

      <div className="space-y-8 mb-8">
        <div>
          <div className="flex justify-between mb-3">
            <label className="text-sm font-semibold">Mood</label>
            <span className="text-sm text-primary font-bold tabular-nums">{mood}/10</span>
          </div>
          <input type="range" min={0} max={10} value={mood} onChange={e => setMood(+e.target.value)} className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Low</span><span>Great</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-3">
            <label className="text-sm font-semibold">Stress</label>
            <span className="text-sm text-accent font-bold tabular-nums">{stress}/10</span>
          </div>
          <input type="range" min={0} max={10} value={stress} onChange={e => setStress(+e.target.value)} className="w-full accent-accent" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Calm</span><span>Stressed</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" /> How's your wiring?
          </label>
          <div className="flex flex-wrap gap-2">
            {REGULATION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  haptics.light();
                  setRegulationState(regulationState === opt.value ? null : opt.value);
                }}
                className={`px-4 py-2.5 rounded-2xl border text-sm font-medium transition-all duration-200 ${
                  regulationState === opt.value
                    ? 'bg-primary/15 border-primary/30 text-primary font-semibold shadow-[var(--shadow-card)]'
                    : 'border-border/50 text-muted-foreground hover:border-primary/20'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Anything else on your mind…"
            rows={3}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 text-sm outline-none resize-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-[var(--shadow-card)]"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 shadow-[var(--shadow-glow-primary)]"
      >
        <Sparkles className="w-5 h-5" /> Save Check-In
      </button>
    </div>
  );
}
