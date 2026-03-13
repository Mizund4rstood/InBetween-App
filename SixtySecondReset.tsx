import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Eye, Brain, Sparkles } from 'lucide-react';
import { sounds } from './sounds';
import { haptics } from './haptics';

type ResetType = 'breathe' | 'ground' | 'reframe';
type Phase = 'select' | 'active' | 'complete';

const RESET_OPTIONS = [
  { type: 'breathe' as const, icon: Wind, label: 'Breathe', duration: 30, color: 'from-primary/20 to-sage-light/30' },
  { type: 'ground' as const, icon: Eye, label: 'Ground', duration: 45, color: 'from-amber-500/20 to-orange-400/20' },
  { type: 'reframe' as const, icon: Brain, label: 'Reframe', duration: 40, color: 'from-violet-500/20 to-purple-400/20' },
];

const GROUNDING_STEPS = [
  { count: 5, sense: 'See', prompt: 'Name 5 things you can see' },
  { count: 4, sense: 'Touch', prompt: 'Notice 4 things you can feel' },
  { count: 3, sense: 'Hear', prompt: 'Listen for 3 sounds' },
  { count: 2, sense: 'Smell', prompt: 'Notice 2 scents' },
  { count: 1, sense: 'Taste', prompt: 'One taste in your mouth' },
];

const REFRAME_PROMPTS = [
  { question: 'What am I feeling right now?', hint: 'Name the emotion without judgment' },
  { question: 'Will this matter in 24 hours?', hint: 'Zoom out from this moment' },
  { question: 'What would I tell a friend?', hint: 'Be kind to yourself' },
  { question: 'One small thing I can do now?', hint: 'Find one tiny action' },
];

interface Props {
  onClose: () => void;
  initialType?: ResetType;
}

export default function SixtySecondReset({ onClose, initialType }: Props) {
  const [phase, setPhase] = useState<Phase>(initialType ? 'active' : 'select');
  const [resetType, setResetType] = useState<ResetType | null>(initialType || null);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');

  const duration = resetType ? RESET_OPTIONS.find(o => o.type === resetType)?.duration || 30 : 30;
  const progress = elapsed / duration;

  const startReset = useCallback((type: ResetType) => {
    setResetType(type);
    setPhase('active');
    setElapsed(0);
    setCurrentStep(0);
    haptics.medium();
    sounds.step();
  }, []);

  // Main timer
  useEffect(() => {
    if (phase !== 'active') return;
    
    const interval = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= duration) {
          setPhase('complete');
          sounds.complete();
          haptics.success();
          return duration;
        }
        return e + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, duration]);

  // Breathing cycle (4-4-4)
  useEffect(() => {
    if (phase !== 'active' || resetType !== 'breathe') return;
    
    const cycle = elapsed % 12;
    if (cycle < 4) setBreathPhase('in');
    else if (cycle < 8) setBreathPhase('hold');
    else setBreathPhase('out');
    
    // Play sounds on transitions
    if (cycle === 0) sounds.breathIn();
    else if (cycle === 8) sounds.breathOut();
  }, [elapsed, phase, resetType]);

  // Grounding step progression
  useEffect(() => {
    if (phase !== 'active' || resetType !== 'ground') return;
    const stepDuration = duration / GROUNDING_STEPS.length;
    const newStep = Math.min(Math.floor(elapsed / stepDuration), GROUNDING_STEPS.length - 1);
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
      haptics.light();
      sounds.step();
    }
  }, [elapsed, phase, resetType, duration, currentStep]);

  // Reframe step progression
  useEffect(() => {
    if (phase !== 'active' || resetType !== 'reframe') return;
    const stepDuration = duration / REFRAME_PROMPTS.length;
    const newStep = Math.min(Math.floor(elapsed / stepDuration), REFRAME_PROMPTS.length - 1);
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
      haptics.light();
      sounds.step();
    }
  }, [elapsed, phase, resetType, duration, currentStep]);

  const renderBreathing = () => (
    <div className="flex flex-col items-center">
      <motion.div
        className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-sage-light/40 flex items-center justify-center shadow-[var(--shadow-glow-primary)]"
        animate={{
          scale: breathPhase === 'in' ? 1.3 : breathPhase === 'out' ? 0.8 : 1,
        }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        <span className="text-lg font-semibold text-primary">
          {breathPhase === 'in' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold' : 'Breathe Out'}
        </span>
      </motion.div>
    </div>
  );

  const renderGrounding = () => {
    const step = GROUNDING_STEPS[currentStep];
    return (
      <div className="flex flex-col items-center text-center">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <span className="text-5xl font-serif font-bold text-primary">{step.count}</span>
        </motion.div>
        <p className="text-lg font-medium text-foreground mb-2">{step.sense}</p>
        <p className="text-sm text-muted-foreground">{step.prompt}</p>
        <div className="flex gap-1 mt-4">
          {GROUNDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderReframe = () => {
    const prompt = REFRAME_PROMPTS[currentStep];
    return (
      <div className="flex flex-col items-center text-center px-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-xl font-serif font-semibold text-foreground mb-3">{prompt.question}</p>
          <p className="text-sm text-muted-foreground italic">{prompt.hint}</p>
        </motion.div>
        <div className="flex gap-1 mt-6">
          {REFRAME_PROMPTS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= currentStep ? 'bg-violet-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">60-Second Reset</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {phase === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm"
            >
              <p className="text-center text-muted-foreground mb-8">
                Choose your reset. Less than 60 seconds.
              </p>
              <div className="space-y-3">
                {RESET_OPTIONS.map(option => (
                  <button
                    key={option.type}
                    onClick={() => startReset(option.type)}
                    className={`w-full p-5 rounded-2xl bg-gradient-to-r ${option.color} border border-border/50 flex items-center gap-4 active:scale-[0.98] transition-transform`}
                  >
                    <div className="w-12 h-12 rounded-full bg-background/60 flex items-center justify-center">
                      <option.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.duration}s</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              {resetType === 'breathe' && renderBreathing()}
              {resetType === 'ground' && renderGrounding()}
              {resetType === 'reframe' && renderReframe()}

              {/* Progress bar */}
              <div className="w-full mt-10">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2 tabular-nums">
                  {duration - elapsed}s remaining
                </p>
              </div>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-xs"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>

              {/* AAC Framework closing */}
              <div className="space-y-3 mb-8">
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  You noticed the impulse.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground"
                >
                  You gave yourself a moment to pause.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-lg font-serif font-bold text-primary"
                >
                  Acceptance is the key.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-sm text-foreground font-medium"
                >
                  From here, you can choose your direction.
                </motion.p>
              </div>

              {/* Framework reminder */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex justify-center gap-3 mb-8"
              >
                {['Awareness', 'Acceptance', 'Choice'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">{step}</span>
                    {i < 2 && <span className="text-muted-foreground/40">→</span>}
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
