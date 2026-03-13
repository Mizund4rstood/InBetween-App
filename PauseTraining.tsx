import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { sounds } from '@/lib/sounds';
import { Pause, Play, RotateCcw, MessageCircle } from 'lucide-react';
import { FutureSelfPlayer, FutureSelfRecorder } from '@/components/FutureSelf';
import { supabase } from '@/integrations/supabase/client';

type Phase = 'intro' | 'countdown' | 'breathing' | 'reflect' | 'complete';

const MICRO_INTERVENTIONS = [
  { label: 'Name it', instruction: 'Say the emotion out loud. "I notice I feel angry." Naming it builds self-trust.', icon: '🏷\uFE0F' },
  { label: 'Body scan', instruction: 'Where is the feeling in your body? Put your hand there. Breathe into that spot.', icon: '🫁' },
  { label: 'Zoom out', instruction: 'Will this matter in 5 years? 5 months? 5 weeks? Let perspective settle.', icon: '🔭' },
  { label: 'Opposite action', instruction: 'What would the version of you that you admire most do right now?', icon: '🪞' },
  { label: 'Anchor phrase', instruction: 'Repeat: "I have time. I can choose. My response is my power."', icon: '⚓' },
  { label: 'Physical reset', instruction: 'Press your feet firmly into the ground. Squeeze your hands. Release. Notice the shift.', icon: '🦶' },
];

export default function PauseTrainingPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [countdown, setCountdown] = useState(5);
  const [breathCount, setBreatheCount] = useState(0);
  const [intervention, setIntervention] = useState(0);
  const [hasFutureSelfMsg, setHasFutureSelfMsg] = useState(false);
  const [showFutureSelfInReflect, setShowFutureSelfInReflect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Check if user has future self messages
  useEffect(() => {
    const checkMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('future_self_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setHasFutureSelfMsg((count || 0) > 0);
    };
    checkMessages();
  }, []);

  const startPause = () => {
    haptics.medium();
    sounds.tap();
    setIntervention(Math.floor(Math.random() * MICRO_INTERVENTIONS.length));
    setPhase('countdown');
    setCountdown(5);
  };

  useEffect(() => {
    if (phase === 'countdown') {
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            setPhase('breathing');
            setBreatheCount(0);
            return 0;
          }
          haptics.light();
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'breathing') {
      // 3 breath cycles (4s in, 4s out = 8s each = 24s total)
      const totalBreaths = 3;
      timerRef.current = setInterval(() => {
        setBreatheCount(c => {
          if (c >= totalBreaths * 2 - 1) {
            clearInterval(timerRef.current);
            setTimeout(() => {
              haptics.medium();
              sounds.step();
              setPhase('reflect');
            }, 500);
            return c;
          }
          if (c % 2 === 0) sounds.breathIn();
          else sounds.breathOut();
          return c + 1;
        });
      }, 4000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  const handleComplete = () => {
    haptics.celebration();
    sounds.save();
    setPhase('complete');
  };

  const reset = () => setPhase('intro');

  const currentIntervention = MICRO_INTERVENTIONS[intervention];
  const isInhale = breathCount % 2 === 0;

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-6">
        <h1 className="text-3xl font-serif font-bold">Pause Training</h1>
        <p className="text-sm text-muted-foreground mt-1">Practice the space between trigger and response</p>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center py-8"
          >
            {/* The InBetween visualization */}
            <div className="relative mx-auto mb-6 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div className="relative">
                <div className="w-16 h-1 bg-gradient-to-r from-destructive/30 via-compass to-compass/30 rounded-full" />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-compass/15 border border-compass/30 text-[10px] font-bold text-compass whitespace-nowrap">
                  The Gap
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-compass/10 flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
            </div>

            <h2 className="text-xl font-serif font-bold mb-3">The InBetween Moment</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto mb-2">
              Most people think behavior is automatic. <span className="text-foreground font-medium">It isn't.</span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
              There's always a tiny gap between impulse and action. <br />
              <span className="text-compass font-semibold">That gap is your power.</span>
            </p>

            <div className="space-y-3 mb-8">
              {MICRO_INTERVENTIONS.slice(0, 3).map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-card border border-border/50 text-left shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <p className="text-sm font-bold">{m.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{m.instruction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startPause}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-compass to-compass-dark text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_0_24px_-4px_hsl(var(--compass)/0.25)]"
            >
              <Play className="w-5 h-5" /> Start Pause Practice
            </button>
          </motion.div>
        )}

        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-20"
          >
            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-semibold">Stop. Breathe.</p>
            <div className="text-8xl font-serif font-bold text-compass animate-scale-in">
              {countdown}
            </div>
          </motion.div>
        )}

        {phase === 'breathing' && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className={`absolute inset-0 rounded-full bg-compass/20 transition-all duration-[4000ms] ease-in-out ${
                isInhale ? 'scale-100' : 'scale-75'
              }`} />
              <div className={`absolute inset-4 rounded-full bg-compass/30 transition-all duration-[4000ms] ease-in-out ${
                isInhale ? 'scale-100' : 'scale-75'
              }`} />
              <div className={`absolute inset-8 rounded-full bg-compass/50 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                isInhale ? 'scale-100' : 'scale-75'
              }`}>
                <span className="text-primary-foreground font-bold text-sm">
                  {isInhale ? 'Breathe In' : 'Breathe Out'}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Breath {Math.floor(breathCount / 2) + 1} of 3
            </p>
          </motion.div>
        )}

        {phase === 'reflect' && (
          <motion.div
            key="reflect"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center py-8"
          >
            {/* Future Self Message - plays if available */}
            {hasFutureSelfMsg && !showFutureSelfInReflect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6"
              >
                <button
                  onClick={() => setShowFutureSelfInReflect(true)}
                  className="w-full p-4 rounded-2xl bg-lavender/10 border border-lavender/20 flex items-center gap-3 text-left hover:bg-lavender/15 transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-lavender/20">
                    <MessageCircle className="w-5 h-5 text-lavender" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Hear from yourself</p>
                    <p className="text-xs text-muted-foreground">Play a message you recorded</p>
                  </div>
                </button>
              </motion.div>
            )}

            {showFutureSelfInReflect && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <FutureSelfPlayer autoPlay onComplete={() => {}} />
              </motion.div>
            )}

            <div className="text-5xl mb-6">{currentIntervention.icon}</div>
            <h2 className="text-xl font-serif font-bold mb-2">{currentIntervention.label}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
              {currentIntervention.instruction}
            </p>
            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-compass to-compass-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[0_0_24px_-4px_hsl(var(--compass)/0.25)]"
            >
              I'm Ready to Choose
            </button>
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-compass/10 flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-3xl">🧭</span>
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Pause Complete</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
              You just practiced the most powerful skill: choosing your response instead of reacting.
            </p>
            <button
              onClick={reset}
              className="px-8 py-3 rounded-2xl bg-card border border-border/50 font-semibold flex items-center gap-2 mx-auto active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Practice Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
