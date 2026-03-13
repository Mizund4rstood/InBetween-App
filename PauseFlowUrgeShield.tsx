import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/sounds';
import { haptics } from '@/lib/haptics';
import { Shield } from 'lucide-react';

const GROUNDING_PROMPTS = [
  "Notice 3 things you can see right now.",
  "Feel your feet on the ground.",
  "Name one thing you are grateful for.",
  "Take a slow, deep breath.",
  "What would future-you thank you for?",
  "Put your hand on your chest. Feel your heartbeat.",
  "You have survived every urge before this one.",
  "This feeling is temporary. You are not.",
];

interface Props {
  onComplete: () => void;
}

export default function PauseFlowUrgeShield({ onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [isInhale, setIsInhale] = useState(true);
  const [isPeak, setIsPeak] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const DURATION = 120; // 2 minutes
  const PEAK_START = 90; // Last 30 seconds is "peak" zone

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        // Enter peak zone
        if (next >= PEAK_START && prev < PEAK_START) {
          setIsPeak(true);
          haptics.light();
          sounds.peakEnter();
        }
        if (next >= DURATION) {
          clearInterval(timerRef.current);
          haptics.celebration();
          sounds.celebrate();
          setTimeout(onComplete, 800);
          return DURATION;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [onComplete]);

  // Rotate prompts every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex(i => (i + 1) % GROUNDING_PROMPTS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Breathing
  useEffect(() => {
    const interval = setInterval(() => setIsInhale(p => !p), 4000);
    return () => clearInterval(interval);
  }, []);

  const remaining = DURATION - elapsed;
  const progress = elapsed / DURATION;
  
  // Additional debug calculations
  const promptCycleElapsed = elapsed % 15; // Prompts change every 15s
  const timeUntilNextPrompt = 15 - promptCycleElapsed;
  const breathingCycleElapsed = elapsed % 8; // 4s in + 4s out = 8s cycle
  const breathingCycleProgress = breathingCycleElapsed / 8;
  const currentPhaseElapsed = breathingCycleElapsed % 4;
  const currentPhaseProgress = currentPhaseElapsed / 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex flex-col items-center justify-center min-h-[70vh] px-6 text-center rounded-2xl transition-all duration-700 ease-in-out ${
        isPeak ? 'bg-warm/[0.07] shadow-[0_0_30px_-5px_hsl(var(--warm)/0.18)]' : ''
      }`}
    >
      <div className={`p-4 rounded-full mb-6 transition-colors duration-700 ${isPeak ? 'bg-warm/20' : 'bg-accent/10'}`}>
        <Shield className={`w-8 h-8 transition-colors duration-700 ${isPeak ? 'text-warm' : 'text-accent'}`} />
      </div>

      <h2 className="text-xl font-serif font-bold text-foreground mb-2">
        {isPeak ? "Almost There" : "Urge Shield Active"}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-8">
        {isPeak 
          ? "You've made it through the hardest part. Just a little longer."
          : "Urges rise and fall like waves. Stay here for 2 minutes before deciding."}
      </p>

      {/* Breathing indicator with glow rings */}
      <div className="relative mb-6">
        {/* Glow rings when in peak zone */}
        {isPeak && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-warm/40"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-warm/30"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-warm/20"
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
            />
          </>
        )}
        <div
          className={`w-20 h-20 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center ${
            isPeak ? 'bg-warm/20' : 'bg-primary/15'
          } ${isInhale ? 'scale-100' : 'scale-[0.7]'}`}
        >
          <span className={`text-xs font-medium transition-colors duration-700 ${isPeak ? 'text-warm' : 'text-muted-foreground'}`}>
            {isInhale ? 'In' : 'Out'}
          </span>
        </div>
        
        {/* "RIDE IT" label during peak zone */}
        <AnimatePresence>
          {isPeak && (
            <motion.span
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest text-warm"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.4 }}
            >
              RIDE IT
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Rotating grounding prompt */}
      <motion.p
        key={promptIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-base font-serif text-foreground/80 italic max-w-xs mb-8 min-h-[3rem]"
      >
        "{GROUNDING_PROMPTS[promptIndex]}"
      </motion.p>

      {/* Timer */}
      <p className={`text-4xl font-serif font-bold tabular-nums mb-3 transition-colors duration-700 ${isPeak ? 'text-warm' : 'text-foreground'}`}>
        {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
      </p>

      <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-700 ${isPeak ? 'bg-warm' : 'bg-accent'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {/* Debug readout - development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-muted/50 text-xs font-mono p-2 rounded border border-border text-foreground/70 space-y-0.5">
          <div>elapsed: {elapsed}s | remaining: {remaining}s | progress: {Math.round(progress * 100)}%</div>
          <div>prompt: #{promptIndex + 1} | nextIn: {timeUntilNextPrompt.toFixed(1)}s | breath: {isInhale ? 'IN' : 'OUT'} | peak: {isPeak ? 'YES' : 'NO'}</div>
          <div>breathCycle: {breathingCycleElapsed.toFixed(1)}s | phaseProgress: {Math.round(currentPhaseProgress * 100)}%</div>
        </div>
      )}
    </motion.div>
  );
}
