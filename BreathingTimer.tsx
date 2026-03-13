import { useState, useEffect, useRef } from 'react';
import { sounds } from './sounds';
import { haptics } from './haptics';

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';
const phaseLabels: Record<Phase, string> = {
  inhale: 'Breathe In',
  hold1: 'Hold',
  exhale: 'Breathe Out',
  hold2: 'Hold',
};
const phaseOrder: Phase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
const PHASE_DURATION = 4;

interface Props {
  duration: number;
  onComplete: (preMood: number, postMood: number) => void;
  onCancel: () => void;
}

export default function BreathingTimer({ duration, onComplete, onCancel }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTime, setPhaseTime] = useState(PHASE_DURATION);
  const [preMood, setPreMood] = useState(5);
  const [postMood, setPostMood] = useState(5);
  const [showPreMood, setShowPreMood] = useState(true);
  const [showPostMood, setShowPostMood] = useState(false);

  const phase = phaseOrder[phaseIdx];
  const progress = elapsed / duration;

  const prevPhaseRef = useRef(phaseIdx);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= duration) {
          setIsRunning(false);
          setShowPostMood(true);
          sounds.complete();
          haptics.success();
          return duration;
        }
        return e + 1;
      });
      setPhaseTime(pt => {
        if (pt <= 1) {
          setPhaseIdx(idx => (idx + 1) % 4);
          return PHASE_DURATION;
        }
        return pt - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, duration]);
  // Play breath sounds on phase change
  useEffect(() => {
    if (!isRunning) return;
    if (phaseIdx !== prevPhaseRef.current) {
      prevPhaseRef.current = phaseIdx;
      const p = phaseOrder[phaseIdx];
      if (p === 'inhale') sounds.breathIn();
      else if (p === 'exhale') sounds.breathOut();
    }
  }, [phaseIdx, isRunning]);

  const startBreathing = () => {
    setShowPreMood(false);
    setIsRunning(true);
  };

  if (showPreMood) {
    return (
      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <span className="text-3xl">🧘</span>
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">Before We Begin</h3>
        <p className="text-sm text-muted-foreground mb-8">How are you feeling right now?</p>
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Mood</span>
            <span className="text-sm font-bold text-primary tabular-nums">{preMood}/10</span>
          </div>
          <input type="range" min={0} max={10} value={preMood} onChange={e => setPreMood(+e.target.value)} className="w-full" />
        </div>
        <button onClick={startBreathing} className="mt-6 px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]">
          Begin Breathing
        </button>
      </div>
    );
  }

  if (showPostMood) {
    return (
      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
          <span className="text-3xl">🌿</span>
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">Well Done</h3>
        <p className="text-sm text-muted-foreground mb-8">How do you feel now?</p>
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Mood</span>
            <span className="text-sm font-bold text-primary tabular-nums">{postMood}/10</span>
          </div>
          <input type="range" min={0} max={10} value={postMood} onChange={e => setPostMood(+e.target.value)} className="w-full" />
        </div>
        <button onClick={() => onComplete(preMood, postMood)} className="mt-6 px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]">
          Save Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {/* Breathing circle — layered rings */}
      <div className="relative w-56 h-56 mb-10">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse-ring" />
        <div className="absolute inset-0 rounded-full border border-primary/5 animate-pulse-ring-delayed" />
        
        {/* Breathing orb */}
        <div
          className={`absolute inset-6 rounded-full bg-gradient-to-br from-primary/25 to-sage-light/30 transition-transform duration-[4000ms] ease-in-out ${
            phase === 'inhale' ? 'scale-125' : phase === 'exhale' ? 'scale-75' : ''
          }`}
        />
        <div
          className={`absolute inset-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 transition-transform duration-[4000ms] ease-in-out shadow-[var(--shadow-glow-primary)] ${
            phase === 'inhale' ? 'scale-110' : phase === 'exhale' ? 'scale-80' : ''
          }`}
        />
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-serif font-bold text-primary tabular-nums">{phaseTime}</span>
          <span className="text-sm font-semibold text-muted-foreground mt-1 tracking-wide">{phaseLabels[phase]}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-6">
        <div className="h-2 rounded-full bg-muted overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-primary to-sage-dark rounded-full transition-all duration-1000"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 tabular-nums">
          <span>{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span>
          <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
        Cancel
      </button>
      
      {/* Debug readout - development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-yellow-500/10 text-xs font-mono p-2 rounded border text-foreground/70 space-y-0.5">
          <div>elapsed: {elapsed}s | progress: {Math.round(progress * 100)}% | running: {isRunning}</div>
          <div>phase: {phase} ({phaseIdx + 1}/4) | phaseTime: {phaseTime}s | phaseProgress: {Math.round(((PHASE_DURATION - phaseTime) / PHASE_DURATION) * 100)}%</div>
          <div>animState: scale-{phase === 'inhale' ? '125' : phase === 'exhale' ? '75' : '100'} | mood: pre={preMood} post={postMood}</div>
        </div>
      )}
    </div>
  );
}
