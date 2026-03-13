import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wine, Zap, CloudRain, Users, Snowflake, ArrowRight, RotateCcw, Wind, Eye, Brain, Dumbbell, Palette, Heart, Scan, Pause } from 'lucide-react';
import { haptics } from './haptics';
import { sounds } from './sounds';

// Step definitions for the guided journey
type JourneyStep = 'situation' | 'body' | 'pause' | 'tools' | 'reflection';

interface Situation {
  id: string;
  label: string;
  emoji: string;
  description: string;
  tools: ToolRecommendation[];
}

interface ToolRecommendation {
  name: string;
  description: string;
  icon: typeof Wind;
  route?: string;
  action?: 'reset-breathe' | 'reset-ground' | 'reset-reframe';
  why: string;
}

const BODY_SENSATIONS = [
  { id: 'chest', label: 'Tight chest', emoji: '💨' },
  { id: 'racing', label: 'Racing thoughts', emoji: '🌀' },
  { id: 'tension', label: 'Muscle tension', emoji: '🤜' },
  { id: 'stomach', label: 'Knot in stomach', emoji: '🫣' },
  { id: 'heat', label: 'Heat or flushing', emoji: '🔥' },
  { id: 'numb', label: 'Nothing / numbness', emoji: '🧊' },
  { id: 'shaky', label: 'Shaky or jittery', emoji: '⚡' },
  { id: 'heavy', label: 'Heaviness', emoji: '🪨' },
];

const SITUATIONS: Situation[] = [
  {
    id: 'urge',
    label: 'Urge',
    emoji: '🔥',
    description: 'That pull is real. Let\'s create space between the urge and the action.',
    tools: [
      { name: '60-Second Breathing', description: 'Ride the wave with box breathing', icon: Wind, action: 'reset-breathe', why: 'Urges peak and pass in 90 seconds. Breathing carries you through.' },
      { name: 'Your Why Vault', description: 'Remember what you\'re building', icon: Heart, route: '/vault', why: 'Reconnecting with your reasons weakens the urge\'s grip.' },
      { name: 'Body Scan', description: 'Notice where the urge lives', icon: Eye, route: '/restlessness', why: 'Locating the sensation makes it manageable.' },
      { name: 'Pause Training', description: 'Practice the gap', icon: RotateCcw, route: '/compass/pause', why: 'Every urge is a chance to practice choosing.' },
    ],
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    emoji: '⚡',
    description: 'Your nervous system is fired up. Let\'s bring it back down.',
    tools: [
      { name: 'Box Breathing', description: 'Calm the spike in 30 seconds', icon: Wind, action: 'reset-breathe', why: 'Slow breathing activates your calm nervous system.' },
      { name: '5-4-3-2-1 Grounding', description: 'Anchor to the present', icon: Eye, action: 'reset-ground', why: 'Anxiety lives in the future. Grounding brings you back.' },
      { name: 'Full Grounding', description: 'Deeper sensory exercise', icon: Eye, route: '/grounding', why: 'Extended grounding resets your baseline.' },
      { name: 'Movement', description: 'Discharge the nervous energy', icon: Dumbbell, route: '/restlessness', why: 'Movement metabolizes stress hormones.' },
    ],
  },
  {
    id: 'anger',
    label: 'Anger',
    emoji: '💢',
    description: 'Heated moment. Let\'s keep you in the driver\'s seat.',
    tools: [
      { name: 'Quick Breathing', description: 'Cool down before you respond', icon: Wind, action: 'reset-breathe', why: 'A 30-second pause prevents words you can\'t take back.' },
      { name: 'Reframe', description: 'See it from a different angle', icon: Brain, action: 'reset-reframe', why: '"Will this matter tomorrow?" changes how you respond today.' },
      { name: 'Log the Trigger', description: 'Capture what happened', icon: Zap, route: '/compass/log', why: 'Writing it down externalizes the emotion.' },
      { name: 'Pause Training', description: 'Practice the gap', icon: RotateCcw, route: '/compass/pause', why: 'Every conflict is a chance to choose instead of react.' },
    ],
  },
  {
    id: 'sadness',
    label: 'Sadness',
    emoji: '🌧️',
    description: 'It\'s okay to feel this. Let\'s be gentle with what\'s here.',
    tools: [
      { name: 'Gratitude Shift', description: 'One thing that\'s still okay', icon: Heart, route: '/wall', why: 'Finding one good thing creates a foothold.' },
      { name: 'Coloring', description: 'Calming creative focus', icon: Palette, route: '/grounding', why: 'Coloring occupies your mind just enough to quiet the storm.' },
      { name: 'Body Scan', description: 'Be with what you feel', icon: Eye, route: '/restlessness', why: 'Allowing sadness to be felt helps it move through you.' },
      { name: 'Future Self', description: 'Hear your own calm voice', icon: Users, route: '/compass', why: 'Your own words of comfort are powerful.' },
    ],
  },
  {
    id: 'overwhelm',
    label: 'Overwhelmed',
    emoji: '🌊',
    description: 'Too much, all at once. Let\'s simplify what you need.',
    tools: [
      { name: 'Cognitive Reframe', description: 'One question at a time', icon: Brain, action: 'reset-reframe', why: 'When everything feels like too much, one question makes it manageable.' },
      { name: 'Coloring', description: 'Simple, calming focus', icon: Palette, route: '/grounding', why: 'Coloring occupies your mind just enough to quiet the storm.' },
      { name: 'Box Breathing', description: 'Slow everything down', icon: Wind, action: 'reset-breathe', why: 'Your breath is the one thing you can always control.' },
      { name: 'Express Check-In', description: 'Just name what you feel', icon: Zap, route: '/', why: 'Naming the emotion reduces its intensity.' },
    ],
  },
];

const REFLECTIONS = [
  'Stay steady',
  'Be gentle with myself',
  'Keep going',
  'Rest without guilt',
  'Trust the process',
  'Take the next small step',
];

interface Props {
  onClose: () => void;
  onStartReset?: (type: 'breathe' | 'ground' | 'reframe') => void;
}

export default function SituationGuide({ onClose, onStartReset }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<JourneyStep>('situation');
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
  const [selectedSensations, setSelectedSensations] = useState<string[]>([]);
  const [pauseComplete, setPauseComplete] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(5);

  const handleSelectSituation = (situation: Situation) => {
    setSelectedSituation(situation);
    haptics.medium();
    sounds.step();
    setStep('body');
  };

  const toggleSensation = (id: string) => {
    haptics.light();
    setSelectedSensations(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const startPause = () => {
    setStep('pause');
    haptics.medium();
    let count = 5;
    const interval = setInterval(() => {
      count--;
      setPauseCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setPauseComplete(true);
        haptics.celebration();
      }
    }, 1000);
  };

  const handleToolSelect = (tool: ToolRecommendation) => {
    haptics.light();
    if (tool.action && onStartReset) {
      onClose();
      onStartReset(tool.action.replace('reset-', '') as 'breathe' | 'ground' | 'reframe');
    } else if (tool.route) {
      onClose();
      navigate(tool.route);
    }
  };

  const goBack = () => {
    switch (step) {
      case 'body':
        setStep('situation');
        setSelectedSituation(null);
        break;
      case 'pause':
        setStep('body');
        break;
      case 'tools':
        setStep('pause');
        break;
      case 'reflection':
        setStep('tools');
        break;
      default:
        onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <button
          onClick={goBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {step === 'situation' ? 'Close' : '← Back'}
        </button>
        
        {/* Step indicator */}
        <div className="flex gap-1.5">
          {(['situation', 'body', 'pause', 'tools', 'reflection'] as JourneyStep[]).map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= ['situation', 'body', 'pause', 'tools', 'reflection'].indexOf(step)
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-8 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Step 1: What's happening */}
          {step === 'situation' && (
            <motion.div
              key="situation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold mb-2">What's happening right now?</h2>
              <p className="text-sm text-muted-foreground mb-8">
                No judgment. Pick the closest match.
              </p>

              <div className="space-y-3">
                {SITUATIONS.map((situation) => (
                  <button
                    key={situation.id}
                    onClick={() => handleSelectSituation(situation)}
                    className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] active:scale-[0.98] transition-all flex items-center gap-4 text-left"
                  >
                    <span className="text-2xl">{situation.emoji}</span>
                    <span className="font-semibold text-sm flex-1">{situation.label}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Body awareness */}
          {step === 'body' && (
            <motion.div
              key="body"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Scan className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-serif font-bold">What do you notice in your body?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Tap anything you notice. There's no wrong answer.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {BODY_SENSATIONS.map((sensation) => (
                  <button
                    key={sensation.id}
                    onClick={() => toggleSensation(sensation.id)}
                    className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      selectedSensations.includes(sensation.id)
                        ? 'bg-primary/15 border-primary/30 shadow-[var(--shadow-soft)]'
                        : 'bg-card border-border/50 shadow-[var(--shadow-card)]'
                    }`}
                  >
                    <span className="text-xl mb-1 block">{sensation.emoji}</span>
                    <span className="text-sm font-medium">{sensation.label}</span>
                  </button>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={startPause}
                className="w-full mt-8 py-4 rounded-2xl bg-primary/15 border border-primary/25 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
              >
                {selectedSensations.length === 0 ? 'Skip — I\'m not sure' : `Continue with ${selectedSensations.length} noticed`}
              </motion.button>
              
              <p className="text-[11px] text-muted-foreground text-center mt-3">
                Just noticing is already powerful. That's awareness at work.
              </p>
            </motion.div>
          )}

          {/* Step 3: The Pause */}
          {step === 'pause' && (
            <motion.div
              key="pause"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/15 border border-primary/25 flex items-center justify-center mb-8"
              >
                {!pauseComplete ? (
                  <span className="text-4xl font-serif font-bold text-primary">{pauseCountdown}</span>
                ) : (
                  <Pause className="w-10 h-10 text-primary" />
                )}
              </motion.div>

              <AnimatePresence mode="wait">
                {!pauseComplete ? (
                  <motion.div key="breathing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-xl font-serif font-bold mb-3">Accept what you feel.</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                      Acceptance doesn't mean giving in. <br />
                      It means <span className="text-primary font-semibold">seeing clearly</span>. <br />
                      When you see clearly, you can choose.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-xl font-serif font-bold mb-2">You found the space.</h2>
                    <div className="flex justify-center gap-3 mb-4">
                      {['Awareness', 'Acceptance', 'Choice'].map((label, i) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${i <= 1 ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                          {i < 2 && <span className="text-muted-foreground/40">→</span>}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-8">
                      Now let's choose your next step.
                    </p>
                    <button
                      onClick={() => setStep('tools')}
                      className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
                    >
                      Choose your next step
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 4: Tool selection */}
          {step === 'tools' && selectedSituation && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedSituation.emoji}</span>
                <div>
                  <h2 className="text-xl font-serif font-bold">Choose your tool</h2>
                  <p className="text-xs text-muted-foreground">Tailored for {selectedSituation.label.toLowerCase()}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {selectedSituation.description}
              </p>

              <div className="space-y-3">
                {selectedSituation.tools.map((tool, i) => (
                  <motion.button
                    key={tool.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleToolSelect(tool)}
                    className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] active:scale-[0.98] transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <tool.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{tool.name}</p>
                          {i === 0 && (
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                        <p className="text-[11px] text-foreground/60 mt-2 italic">
                          Why: {tool.why}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep('reflection')}
                className="w-full mt-6 py-3 rounded-2xl bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tool — just reflect
              </button>
            </motion.div>
          )}

          {/* Step 5: Reflection */}
          {step === 'reflection' && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pt-8"
            >
              <h2 className="text-2xl font-serif font-bold mb-2 text-center">
                What direction do you want to move right now?
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-8">
                You're in control of your response. Choose your intention.
              </p>

              <div className="space-y-3">
                {REFLECTIONS.map((reflection, i) => (
                  <motion.button
                    key={reflection}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => {
                      haptics.celebration();
                      sounds.celebrate();
                      onClose();
                    }}
                    className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] active:scale-[0.98] transition-all text-left flex items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-medium text-sm">{reflection}</span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-10 space-y-4">
                {/* AAC closing message */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/15 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">You noticed the impulse.</p>
                  <p className="text-sm text-muted-foreground">You gave yourself a moment to pause.</p>
                  <p className="text-lg font-serif font-bold text-primary">Acceptance is the key.</p>
                  <p className="text-sm text-foreground font-medium">From here, you chose your direction.</p>
                </div>

                {/* Framework */}
                <div className="flex justify-center gap-3">
                  {['Awareness', 'Acceptance', 'Choice'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">{label}</span>
                      {i < 2 && <span className="text-muted-foreground/40">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
