import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import BreathingTimer from '@/components/BreathingTimer';
import { Wind, Eye } from 'lucide-react';

type Mode = 'menu' | 'breathing' | '54321';

const durations = [
  { label: '1 min', secs: 60 },
  { label: '2 min', secs: 120 },
  { label: '3 min', secs: 180 },
];

const senses = [
  { count: 5, sense: 'things you can SEE', emoji: '👁️' },
  { count: 4, sense: 'things you can TOUCH', emoji: '✋' },
  { count: 3, sense: 'things you can HEAR', emoji: '👂' },
  { count: 2, sense: 'things you can SMELL', emoji: '👃' },
  { count: 1, sense: 'thing you can TASTE', emoji: '👅' },
];

export default function GroundingPage() {
  const [mode, setMode] = useState<Mode>('menu');
  const [breathDuration, setBreathDuration] = useState(120);
  const [checklist, setChecklist] = useState<boolean[]>(Array(15).fill(false));
  const [preMood54321, setPreMood54321] = useState(5);
  const [postMood54321, setPostMood54321] = useState(5);
  const [step54321, setStep54321] = useState<'pre' | 'exercise' | 'post'>('pre');
  const { addGroundingSession } = useAppStore();

  const handleBreathingComplete = (preMood: number, postMood: number) => {
    addGroundingSession({
      id: crypto.randomUUID(),
      sessionDatetime: new Date().toISOString(),
      type: 'breathing',
      durationSec: breathDuration,
      preMood,
      postMood,
    });
    setMode('menu');
  };

  const handleSave54321 = () => {
    addGroundingSession({
      id: crypto.randomUUID(),
      sessionDatetime: new Date().toISOString(),
      type: '54321',
      durationSec: 0,
      preMood: preMood54321,
      postMood: postMood54321,
    });
    setMode('menu');
    setStep54321('pre');
    setChecklist(Array(15).fill(false));
  };

  if (mode === 'breathing') {
    return (
      <div className="max-w-lg mx-auto p-4 pt-16">
        <BreathingTimer
          duration={breathDuration}
          onComplete={handleBreathingComplete}
          onCancel={() => setMode('menu')}
        />
      </div>
    );
  }

  if (mode === '54321') {
    if (step54321 === 'pre') {
      return (
        <div className="max-w-lg mx-auto p-4 pt-16 animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Eye className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">5-4-3-2-1 Grounding</h2>
          <p className="text-sm text-muted-foreground mb-8">How are you feeling right now?</p>
          <div className="max-w-xs mx-auto mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">Mood</span>
              <span className="text-sm font-bold text-primary tabular-nums">{preMood54321}/10</span>
            </div>
            <input type="range" min={0} max={10} value={preMood54321} onChange={e => setPreMood54321(+e.target.value)} className="w-full" />
          </div>
          <button onClick={() => setStep54321('exercise')} className="px-10 py-4 rounded-2xl bg-gradient-to-r from-accent to-warm text-accent-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-soft)]">
            Start Exercise
          </button>
          <button onClick={() => setMode('menu')} className="block mx-auto mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        </div>
      );
    }

    if (step54321 === 'exercise') {
      let checkIdx = 0;
      return (
        <div className="max-w-lg mx-auto p-4 pt-8 animate-fade-in">
          <h2 className="text-2xl font-serif font-bold mb-2 text-center">5-4-3-2-1 Grounding</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Tap each item as you notice it</p>
          <div className="space-y-6">
            {senses.map((s, si) => (
              <div key={si} className="animate-fade-in" style={{ animationDelay: `${si * 100}ms` }}>
                <p className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <span className="text-lg">{s.emoji}</span>
                  Name <strong className="text-primary">{s.count}</strong> {s.sense}
                </p>
                <div className="space-y-1.5">
                  {Array.from({ length: s.count }).map((_, i) => {
                    const idx = checkIdx++;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          const next = [...checklist];
                          next[idx] = !next[idx];
                          setChecklist(next);
                        }}
                        className={`w-full p-3.5 rounded-xl text-left text-sm flex items-center gap-3 transition-all duration-200 ${
                          checklist[idx]
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-[var(--shadow-card)]'
                            : 'bg-card border border-border/50 text-foreground hover:border-primary/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          checklist[idx] ? 'border-primary bg-primary scale-110' : 'border-muted-foreground/30'
                        }`}>
                          {checklist[idx] && <span className="text-primary-foreground text-xs">✓</span>}
                        </div>
                        {checklist[idx] ? 'Done!' : `Item ${i + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep54321('post')}
            className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
          >
            I'm Done
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto p-4 pt-16 animate-fade-in text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-float">
          <span className="text-3xl">🌿</span>
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Well Done</h2>
        <p className="text-sm text-muted-foreground mb-8">How do you feel now?</p>
        <div className="max-w-xs mx-auto mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Mood</span>
            <span className="text-sm font-bold text-primary tabular-nums">{postMood54321}/10</span>
          </div>
          <input type="range" min={0} max={10} value={postMood54321} onChange={e => setPostMood54321(+e.target.value)} className="w-full" />
        </div>
        <button onClick={handleSave54321} className="px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]">
          Save Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-6">
        <h1 className="text-3xl font-serif font-bold">Grounding</h1>
        <p className="text-sm text-muted-foreground mt-2">Bring yourself back to the present moment</p>
      </div>

      {/* Breathing */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/10 mb-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Wind className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Box Breathing</h3>
            <p className="text-xs text-muted-foreground">Inhale, hold, exhale, hold — 4 seconds each</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {durations.map(d => (
            <button
              key={d.secs}
              onClick={() => setBreathDuration(d.secs)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                breathDuration === d.secs
                  ? 'bg-primary text-primary-foreground shadow-[var(--shadow-card)]'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMode('breathing')}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
        >
          Start Breathing
        </button>
      </div>

      {/* 5-4-3-2-1 */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-accent/5 via-card to-card border border-accent/10 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-accent/10">
            <Eye className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-lg">5-4-3-2-1 Senses</h3>
            <p className="text-xs text-muted-foreground">Ground yourself through sight, touch, sound, smell, taste</p>
          </div>
        </div>
        <button
          onClick={() => { setMode('54321'); setStep54321('pre'); }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent to-warm text-accent-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-soft)]"
        >
          Start Exercise
        </button>
      </div>
    </div>
  );
}
