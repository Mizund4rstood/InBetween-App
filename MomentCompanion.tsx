import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Zap, Cloud, Sparkles } from 'lucide-react';

type Moment = 'waking' | 'triggered' | 'escape' | 'evening' | 'neutral';

interface MomentConfig {
  icon: React.ReactNode;
  greeting: string;
  guidance: string;
  action: string;
  actionLabel: string;
}

const MOMENTS: Record<Moment, MomentConfig> = {
  waking: {
    icon: <Sun className="w-5 h-5 text-amber-500" />,
    greeting: "A new day begins",
    guidance: "Before the noise starts, you have a choice about who you want to be today.",
    action: "set-intention",
    actionLabel: "Set your intention"
  },
  triggered: {
    icon: <Zap className="w-5 h-5 text-destructive" />,
    greeting: "Something's stirring",
    guidance: "Your emotional brain is active right now. That's normal. You came here first — that's the difference.",
    action: "find-space",
    actionLabel: "Find the space"
  },
  escape: {
    icon: <Cloud className="w-5 h-5 text-sky" />,
    greeting: "The pull to escape",
    guidance: "Wanting to check out is human. But you came here first. That's the difference.",
    action: "stay-present",
    actionLabel: "Stay present"
  },
  evening: {
    icon: <Moon className="w-5 h-5 text-lavender" />,
    greeting: "Day is winding down",
    guidance: "Before sleep, there's a chance to notice what today taught you.",
    action: "reflect",
    actionLabel: "Reflect on today"
  },
  neutral: {
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    greeting: "You're here",
    guidance: "No crisis needed. Just checking in is practice. Every pause strengthens the muscle.",
    action: "check-in",
    actionLabel: "Quick check-in"
  }
};

interface MomentCompanionProps {
  onAction: (action: string) => void;
  className?: string;
}

export default function MomentCompanion({ onAction, className = '' }: MomentCompanionProps) {
  const hour = new Date().getHours();
  const [spikeStep, setSpikeStep] = useState(0);
  const [activeMoment, setActiveMoment] = useState<Moment | null>(null);

  const getDefaultMoment = (): Moment => {
    if (hour >= 5 && hour < 10) return 'waking';
    if (hour >= 20 || hour < 5) return 'evening';
    return 'neutral';
  };

  const currentMoment = activeMoment || getDefaultMoment();
  const config = MOMENTS[currentMoment];

  // Guided spike sequence: Notice → Body → Breath → Reminder
  const SPIKE_STEPS = [
    "Notice what you feel right now. Don't judge it.",
    "Where does it appear in your body? Chest, stomach, hands?",
    "Take one slow breath. In through the nose, out through the mouth.",
    "You are in the moment between impulse and action.",
  ];

  const handleSpikeAction = () => {
    if (spikeStep < SPIKE_STEPS.length - 1) {
      setSpikeStep(s => s + 1);
    } else {
      // Complete — hand off to Compass / Situation Guide
      setSpikeStep(0);
      setActiveMoment(null);
      onAction('find-space');
    }
  };

  const showSpikeGuide = currentMoment === 'triggered';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-card to-accent/5 border border-primary/15 p-5 ${className}`}
    >
      {/* Ambient glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Moment indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30">
            {config.icon}
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            This moment
          </span>
        </div>

        {/* Greeting */}
        <h3 className="text-lg font-serif font-bold text-foreground mb-2">
          {config.greeting}
        </h3>

        {/* Spike guided sequence */}
        {showSpikeGuide ? (
          <div className="mb-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={spikeStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-sm text-foreground leading-relaxed font-medium"
              >
                {SPIKE_STEPS[spikeStep]}
              </motion.p>
            </AnimatePresence>

            {/* Step dots */}
            <div className="flex items-center gap-1.5 mt-3">
              {SPIKE_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i <= spikeStep ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSpikeAction}
              className="w-full mt-4 py-3 rounded-xl bg-destructive/15 border border-destructive/25 text-sm font-bold text-destructive hover:bg-destructive/20 transition-colors"
            >
              {spikeStep < SPIKE_STEPS.length - 1 ? 'Next' : 'Choose your direction'}
            </motion.button>
          </div>
        ) : (
          <>
            {/* Normal guidance */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {config.guidance}
            </p>

            {/* Primary action */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onAction(config.action)}
              className="w-full py-3 rounded-xl bg-primary/15 border border-primary/25 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              {config.actionLabel}
            </motion.button>
          </>
        )}

        {/* Other moments — quick access */}
        <div className="flex justify-center gap-2 mt-4">
          {Object.entries(MOMENTS).map(([key, m]) => (
            key !== currentMoment && (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (key === 'triggered') {
                    setActiveMoment('triggered');
                    setSpikeStep(0);
                  } else {
                    setActiveMoment(null);
                    onAction(m.action);
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  key === 'triggered' 
                    ? 'bg-destructive/10 hover:bg-destructive/20' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
                title={m.greeting}
              >
                {m.icon}
              </motion.button>
            )
          ))}
        </div>
      </div>
    </motion.div>
  );
}
