import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompassStore } from './compassStore';
import { haptics } from './haptics';
import { sounds } from './sounds';
import { fireConfetti } from './confetti';
import { bridgeCompassToRewire } from './compassRewireBridge';
import CrisisSupport, { detectCrisis } from './CrisisSupport';
import { ChevronLeft, Zap, Heart, Target, Check, HandMetal, Shuffle } from 'lucide-react';

type Step = 'trigger' | 'choice' | 'done';

const TRIGGER_CATEGORIES = ['Work', 'Relationships', 'Health', 'Money', 'Self-image', 'Social', 'Family', 'Restlessness', 'Other'];
const TRIGGER_EMOTIONS = ['Anger', 'Anxiety', 'Frustration', 'Sadness', 'Fear', 'Shame', 'Overwhelm', 'Jealousy', 'Restlessness'];

export default function LogTriggerPage() {
  const navigate = useNavigate();
  const { addTrigger, addChoice } = useCompassStore();

  const [step, setStep] = useState<Step>('trigger');
  const [triggerText, setTriggerText] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [context, setContext] = useState('');
  const [category, setCategory] = useState('');
  const [urge, setUrge] = useState('');

  // Choice fields
  const [triggerId, setTriggerId] = useState<string | null>(null);
  const [choiceText, setChoiceText] = useState('');
  const [aligned, setAligned] = useState(false);
  const [pauseUsed, setPauseUsed] = useState(false);
  const [choseDifferently, setChoseDifferently] = useState(false);
  const [outcomeRating, setOutcomeRating] = useState(5);

  const handleSaveTrigger = async () => {
    if (!triggerText.trim()) return;
    haptics.medium();
    sounds.step();

    const result = await addTrigger({
      trigger_text: triggerText.trim(),
      emotion: emotion || null,
      intensity,
      context: context || null,
      category: category || null,
      urge: urge.trim() || null,
    });

    if (result) {
      setTriggerId(result.id);
      setStep('choice');
    }
  };

  const handleSaveChoice = async () => {
    if (!choiceText.trim()) return;
    haptics.celebration();
    sounds.save();

    await addChoice({
      trigger_id: triggerId,
      choice_text: choiceText.trim(),
      aligned_with_values: aligned,
      pause_used: pauseUsed,
      outcome_rating: outcomeRating,
      chose_differently: choseDifferently,
    });

    // Bridge to rewire metrics if program is active
    const trigger = useCompassStore.getState().triggers.find(t => t.id === triggerId);
    if (trigger) {
      bridgeCompassToRewire(trigger, {
        id: '',
        user_id: trigger.user_id,
        trigger_id: triggerId,
        created_at: new Date().toISOString(),
        choice_text: choiceText.trim(),
        aligned_with_values: aligned,
        pause_used: pauseUsed,
        outcome_rating: outcomeRating,
        chose_differently: choseDifferently,
      });
    }

    fireConfetti();
    setStep('done');
  };

  const handleSkipChoice = () => {
    haptics.light();
    // Bridge trigger-only (no choice) to rewire
    const trigger = useCompassStore.getState().triggers.find(t => t.id === triggerId);
    if (trigger) {
      bridgeCompassToRewire(trigger, null);
    }
    setStep('done');
  };

  const showCrisis = detectCrisis({ triggerText, emotion, intensity });

  if (step === 'done') {
    return (
      <div className="max-w-lg mx-auto p-4 pt-20 animate-fade-in text-center">
        <div className="w-20 h-20 rounded-full bg-compass/10 flex items-center justify-center mx-auto mb-6 animate-float">
          <span className="text-3xl">🧭</span>
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Logged</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You're becoming someone who notices before reacting.
        </p>
        {intensity >= 7 && !showCrisis && (
          <div className="mb-6 p-4 rounded-2xl bg-accent/5 border border-accent/10 text-center">
            <p className="text-sm font-serif text-foreground leading-relaxed">
              🫶 That was intense. Growth isn't linear — you're still navigating.
            </p>
          </div>
        )}
        {showCrisis && (
          <div className="mb-6 text-left">
            <CrisisSupport />
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/compass')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-compass to-compass-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[0_0_24px_-4px_hsl(var(--compass)/0.25)]"
          >
            Back to Compass
          </button>
          <button
            onClick={() => navigate('/compass/pause')}
            className="w-full py-3 rounded-2xl bg-card border border-border/50 text-foreground font-semibold active:scale-[0.98] transition-all"
          >
            Practice Pausing
          </button>
        </div>
      </div>
    );
  }

  if (step === 'choice') {
    return (
      <div className="max-w-lg mx-auto p-4 animate-fade-in">
        <div className="flex items-center gap-3 pt-10 pb-6">
          <button onClick={() => setStep('trigger')} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold">What Did You Choose?</h1>
            <p className="text-sm text-muted-foreground mt-1">How did you respond to this trigger?</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold mb-2 block">Your response / action</label>
            <textarea
              value={choiceText}
              onChange={e => setChoiceText(e.target.value)}
              placeholder="What did you do or say?"
              rows={3}
              className="w-full p-4 rounded-2xl bg-card border border-border/50 text-sm outline-none resize-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-compass/20 transition-all shadow-[var(--shadow-card)]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-compass" />
              <span className="text-sm font-semibold">Aligned with my values?</span>
            </div>
            <button
              onClick={() => setAligned(!aligned)}
              className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${aligned ? 'bg-compass' : 'bg-border'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-card shadow-md transition-transform duration-300 ${aligned ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">Did you pause first?</span>
            </div>
            <button
              onClick={() => setPauseUsed(!pauseUsed)}
              className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${pauseUsed ? 'bg-primary' : 'bg-border'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-card shadow-md transition-transform duration-300 ${pauseUsed ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <Shuffle className="w-5 h-5 text-compass" />
              <span className="text-sm font-semibold">Did you choose differently?</span>
            </div>
            <button
              onClick={() => setChoseDifferently(!choseDifferently)}
              className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${choseDifferently ? 'bg-compass' : 'bg-border'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-card shadow-md transition-transform duration-300 ${choseDifferently ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold">How did it turn out?</label>
              <span className="text-sm font-bold text-compass tabular-nums">{outcomeRating}/10</span>
            </div>
            <input type="range" min={0} max={10} value={outcomeRating} onChange={e => setOutcomeRating(+e.target.value)} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Poorly</span><span>Great</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleSaveChoice}
            disabled={!choiceText.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-compass to-compass-dark text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_24px_-4px_hsl(var(--compass)/0.25)]"
          >
            <Check className="w-5 h-5" /> Save Entry
          </button>
          <button
            onClick={handleSkipChoice}
            className="w-full py-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Skip — I haven't responded yet
          </button>
        </div>
      </div>
    );
  }

  // Step: trigger
  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="flex items-center gap-3 pt-10 pb-6">
        <button onClick={() => navigate('/compass')} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold">What Triggered You?</h1>
          <p className="text-sm text-muted-foreground mt-1">Describe the moment you felt reactive</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-semibold mb-2 block">What happened?</label>
          <textarea
            value={triggerText}
            onChange={e => setTriggerText(e.target.value)}
            placeholder="Someone said something that upset me…"
            rows={3}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 text-sm outline-none resize-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-compass/20 transition-all shadow-[var(--shadow-card)]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {TRIGGER_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? '' : c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  category === c
                    ? 'bg-compass/15 border-compass/30 text-compass font-semibold'
                    : 'border-border/50 text-muted-foreground hover:border-compass/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Emotion */}
        <div>
          <label className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-compass" /> What emotion came up?
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {TRIGGER_EMOTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmotion(emotion === e ? '' : e)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  emotion === e
                    ? 'bg-compass/15 border-compass/30 text-compass font-semibold'
                    : 'border-border/50 text-muted-foreground hover:border-compass/20'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            value={emotion}
            onChange={e => setEmotion(e.target.value)}
            placeholder="Or type your own…"
            className="w-full p-3 rounded-xl bg-card border border-border/50 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-compass/20 transition-all"
          />
        </div>

        {/* Intensity */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold">Intensity</label>
            <span className="text-sm font-bold text-compass tabular-nums">{intensity}/10</span>
          </div>
          <input type="range" min={1} max={10} value={intensity} onChange={e => setIntensity(+e.target.value)} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Mild</span><span>Overwhelming</span>
          </div>
        </div>

        {/* Urge */}
        <div>
          <label className="text-sm font-semibold flex items-center gap-2 mb-2">
            <HandMetal className="w-4 h-4 text-compass" /> What was the urge?
          </label>
          <input
            value={urge}
            onChange={e => setUrge(e.target.value)}
            placeholder="What did you want to do in that moment?"
            className="w-full p-3 rounded-xl bg-card border border-border/50 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-compass/20 transition-all"
          />
        </div>

        {/* Context */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Context (optional)</label>
          <input
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Where were you? What time? Who was involved?"
            className="w-full p-3 rounded-xl bg-card border border-border/50 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-compass/20 transition-all"
          />
        </div>
      </div>

      <button
        onClick={handleSaveTrigger}
        disabled={!triggerText.trim()}
        className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-compass to-compass-dark text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_24px_-4px_hsl(var(--compass)/0.25)]"
      >
        Next: Your Response →
      </button>
    </div>
  );
}
