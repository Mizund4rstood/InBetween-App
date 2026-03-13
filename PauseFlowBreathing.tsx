import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '@/lib/sounds';
import { haptics } from '@/lib/haptics';

interface Props {
  durationSeconds: number;
  onComplete: () => void;
}

export default function PauseFlowBreathing({ durationSeconds, onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [isInhale, setIsInhale] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const breathRef = useRef<ReturnType<typeof setInterval>>();

  // Main countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= durationSeconds) {
          clearInterval(timerRef.current);
          haptics.success();
          sounds.complete();
          setTimeout(onComplete, 600);
          return durationSeconds;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [durationSeconds, onComplete]);

  // Breathing cycle (4s in, 4s out)
  useEffect(() => {
    sounds.breathIn();
    breathRef.current = setInterval(() => {
      setIsInhale(prev => {
        if (prev) sounds.breathOut();
        else sounds.breathIn();
        return !prev;
      });
    }, 4000);
    return () => clearInterval(breathRef.current);
  }, []);

  const remaining = durationSeconds - elapsed;
  const progress = elapsed / durationSeconds;
  
  // Additional debug calculations
  const breathingCycleElapsed = elapsed % 8; // 4s in + 4s out = 8s cycle
  const breathingCycleProgress = breathingCycleElapsed / 8;
  const currentPhaseElapsed = breathingCycleElapsed % 4;
  const currentPhaseProgress = currentPhaseElapsed / 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
    >
      {/* Breathing orb */}
      <div className="relative w-48 h-48 mb-10">
        <div
          className={`absolute inset-0 rounded-full bg-primary/10 transition-all duration-[4000ms] ease-in-out ${
            isInhale ? 'scale-100' : 'scale-[0.7]'
          }`}
        />
        <div
          className={`absolute inset-4 rounded-full bg-primary/15 transition-all duration-[4000ms] ease-in-out ${
            isInhale ? 'scale-100' : 'scale-[0.75]'
          }`}
        />
        <div
          className={`absolute inset-8 rounded-full bg-primary/25 transition-all duration-[4000ms] ease-in-out flex items-center justify-center ${
            isInhale ? 'scale-100' : 'scale-[0.8]'
          }`}
        >
          <span className="text-sm font-semibold text-foreground/70">
            {isInhale ? 'Breathe in…' : 'Breathe out…'}
          </span>
        </div>
      </div>

      <p className="text-lg font-serif text-foreground/80 mb-2">
        Nothing else to do right now.
      </p>

      {/* Timer */}
      <p className="text-3xl font-serif font-bold text-foreground tabular-nums mb-4">
        {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
      </p>

      {/* Progress bar */}
      <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-6">Just stay here.</p>
      
      {/* Debug readout - development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-yellow-500/10 text-xs font-mono p-2 rounded border text-foreground/70 space-y-0.5">
          <div>elapsed: {elapsed}s | remaining: {remaining}s | progress: {Math.round(progress * 100)}%</div>
          <div>breath: {isInhale ? 'IN' : 'OUT'} | cycle: {breathingCycleElapsed.toFixed(1)}s | cycleProgress: {Math.round(breathingCycleProgress * 100)}%</div>
          <div>phaseElapsed: {currentPhaseElapsed.toFixed(1)}s | phaseProgress: {Math.round(currentPhaseProgress * 100)}%</div>
        </div>
      )}
    </motion.div>
  );
}
