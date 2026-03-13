import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Brain, Zap, Eye, RefreshCw, ArrowRight, Heart } from 'lucide-react';

interface Section {
  id: string;
  icon: typeof Brain;
  title: string;
  subtitle: string;
  color: string;
  steps: SectionStep[];
}

interface SectionStep {
  heading: string;
  body: string;
  visual?: 'habit-loop' | 'awareness-gap' | 'rewired-loop' | 'neuroplasticity';
}

const SECTIONS: Section[] = [
  {
    id: 'habit-loop',
    icon: RefreshCw,
    title: 'The Habit Loop',
    subtitle: 'Why reactions feel automatic',
    color: 'from-primary/15 to-accent/10 border-primary/20',
    steps: [
      {
        heading: 'Your brain runs on loops',
        body: 'Most behavior follows a simple pattern: a Cue triggers a Routine, which delivers a Reward. Over time, your brain automates this loop — the behavior fires before you even think about it.',
        visual: 'habit-loop',
      },
      {
        heading: 'The loop gets stronger with repetition',
        body: 'Every time the loop runs, dopamine reinforces the connection. Your brain\'s reward system — especially the nucleus accumbens — starts anticipating the reward before the behavior even happens. That anticipation is what we call a craving.',
      },
      {
        heading: 'This isn\'t a flaw — it\'s efficient',
        body: 'Your brain automates behavior to save energy. Tying shoes, driving home, checking your phone — all habit loops. The problem comes when the automated routine is something you want to change.',
      },
    ],
  },
  {
    id: 'awareness-gap',
    icon: Eye,
    title: 'The Awareness Gap',
    subtitle: 'The moment you never knew existed',
    color: 'from-violet-500/15 to-purple-400/10 border-violet-400/20',
    steps: [
      {
        heading: 'Most people realize too late',
        body: 'In automatic behavior, awareness arrives after the action. You reach for your phone, pour the drink, or snap at someone — then notice what you did. The brain reacted faster than consciousness.',
        visual: 'awareness-gap',
      },
      {
        heading: 'There\'s a gap between trigger and action',
        body: 'Between every impulse and every behavior, there is a tiny space. It happens in a fraction of a second. Most people never notice it — but neuroscientists have confirmed it exists. That space is where choice lives.',
      },
      {
        heading: 'Moving awareness earlier changes everything',
        body: 'When you learn to notice the trigger before the reaction fires, you activate your prefrontal cortex — the brain\'s control center. Instead of reacting automatically, you get to decide. That shift is the entire game.',
        visual: 'rewired-loop',
      },
    ],
  },
  {
    id: 'training',
    icon: Brain,
    title: 'How InBetween Trains This',
    subtitle: 'Building the pause muscle',
    color: 'from-accent/15 to-primary/10 border-accent/20',
    steps: [
      {
        heading: 'Every pause is a rep',
        body: 'When you use the Pause Flow, the 60-Second Reset, or the Breathing Timer, you\'re practicing the exact skill: noticing an impulse and not reacting immediately. Each time you do this, you strengthen the neural pathway between awareness and control.',
      },
      {
        heading: 'Logging builds pattern recognition',
        body: 'When you name your feelings, log triggers in the Compass, or reflect on your day — you\'re training metacognition. That means thinking about your thinking. Research shows this alone can reduce impulsive behavior by up to 40%.',
      },
      {
        heading: 'Your brain physically changes',
        body: 'This isn\'t metaphorical. After just 8 weeks of awareness practice, brain scans show increased gray matter in the prefrontal cortex (control) and decreased activity in the amygdala (reactivity). You are literally rewiring your brain.',
        visual: 'neuroplasticity',
      },
    ],
  },
  {
    id: 'power',
    icon: Zap,
    title: 'The Compound Effect',
    subtitle: 'Small pauses, massive change',
    color: 'from-amber-500/15 to-orange-400/10 border-amber-400/20',
    steps: [
      {
        heading: 'Each pause weakens the old loop',
        body: 'Neuroplasticity works both ways. When you don\'t follow an urge, the neural pathway that created it gets slightly weaker. It\'s called synaptic pruning — pathways that aren\'t used get trimmed. Your old patterns literally fade.',
      },
      {
        heading: 'Each new choice builds a new loop',
        body: 'When you choose a grounding exercise instead of the old reaction, you\'re not just resisting — you\'re building. A new Cue → Pause → Intentional Choice → Reward loop is forming. Over time, this becomes your new automatic.',
      },
      {
        heading: 'You are training to be free',
        body: 'The goal isn\'t to white-knuckle through urges forever. It\'s to reach the point where the pause happens naturally — where you catch the impulse before it catches you. That\'s freedom. And every check-in, every breath, every reflection brings you closer.',
      },
    ],
  },
];

/* ─── Visual Diagrams ─── */

function HabitLoopVisual() {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {['Cue', 'Routine', 'Reward'].map((label, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.2, type: 'spring', damping: 15 }}
          className="flex items-center gap-2"
        >
          <div className="px-4 py-2.5 rounded-xl bg-primary/15 border border-primary/25 text-center">
            <span className="text-xs font-bold text-foreground">{label}</span>
          </div>
          {i < 2 && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 + 0.15 }}
            >
              <ArrowRight className="w-4 h-4 text-primary/50" />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function AwarenessGapVisual() {
  return (
    <div className="py-4 space-y-3">
      <div className="flex items-center justify-center gap-2">
        {['Trigger', 'Reaction', 'Awareness'].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-center gap-2"
          >
            <div className={`px-3 py-2 rounded-xl border text-center ${
              label === 'Awareness' 
                ? 'bg-muted/30 border-muted-foreground/20 opacity-50' 
                : 'bg-destructive/10 border-destructive/25'
            }`}>
              <span className="text-[10px] font-bold text-foreground">{label}</span>
            </div>
            {i < 2 && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-[10px] text-muted-foreground text-center italic"
      >
        ↑ Awareness arrives too late
      </motion.p>
    </div>
  );
}

function RewiredLoopVisual() {
  return (
    <div className="py-4 space-y-3">
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {['Trigger', 'Awareness', 'Choice', 'Action'].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.18, type: 'spring', damping: 15 }}
            className="flex items-center gap-1.5"
          >
            <div className={`px-3 py-2 rounded-xl border text-center ${
              label === 'Awareness' || label === 'Choice'
                ? 'bg-primary/15 border-primary/30 ring-1 ring-primary/20'
                : 'bg-card border-border/50'
            }`}>
              <span className="text-[10px] font-bold text-foreground">{label}</span>
            </div>
            {i < 3 && <ArrowRight className="w-3 h-3 text-primary/40" />}
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[10px] text-primary font-semibold text-center"
      >
        ↑ Awareness moves before the action
      </motion.p>
    </div>
  );
}

function NeuroplasticityVisual() {
  return (
    <div className="py-4">
      <div className="flex items-center justify-center gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-14 h-14 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-1.5">
            <motion.div
              animate={{ scale: [1, 0.85, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-8 h-8 rounded-full bg-destructive/20"
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">Amygdala</span>
          <span className="block text-[9px] text-muted-foreground/60">shrinks</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="text-primary/40"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-1.5">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-8 h-8 rounded-full bg-primary/20"
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">Prefrontal</span>
          <span className="block text-[9px] text-muted-foreground/60">grows</span>
        </motion.div>
      </div>
    </div>
  );
}

const VISUALS: Record<string, () => JSX.Element> = {
  'habit-loop': HabitLoopVisual,
  'awareness-gap': AwarenessGapVisual,
  'rewired-loop': RewiredLoopVisual,
  'neuroplasticity': NeuroplasticityVisual,
};

/* ─── Main Component ─── */

interface Props {
  onClose: () => void;
}

export default function ScienceBehindThePause({ onClose }: Props) {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const openSection = (section: Section) => {
    setSelectedSection(section);
    setStepIndex(0);
  };

  /* ─── Step View ─── */
  if (selectedSection) {
    const step = selectedSection.steps[stepIndex];
    const isLast = stepIndex === selectedSection.steps.length - 1;
    const VisualComponent = step.visual ? VISUALS[step.visual] : null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSelectedSection(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <div className="flex gap-1">
            {selectedSection.steps.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded-full transition-colors duration-300 ${
                  i <= stepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5"
              >
                <selectedSection.icon className="w-6 h-6 text-primary" />
              </motion.div>

              <h3 className="text-xl font-serif font-bold mb-4 leading-tight">
                {step.heading}
              </h3>

              {VisualComponent && <VisualComponent />}

              <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                {step.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-6 flex justify-between items-center max-w-md mx-auto w-full">
          <button
            onClick={() => setStepIndex(i => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="p-3 rounded-full bg-muted/50 disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {isLast ? (
            <button
              onClick={() => setSelectedSection(null)}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
            >
              Got it
            </button>
          ) : (
            <button
              onClick={() => setStepIndex(i => i + 1)}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="w-11" />
        </div>
      </motion.div>
    );
  }

  /* ─── Section List ─── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <h2 className="text-lg font-semibold">Science Behind the Pause</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Between every impulse and every action, there is a space. Most people never notice it.
            This app trains you to find it.
          </p>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/8 to-accent/5 border border-primary/15">
            <p className="text-xs text-foreground/70 leading-relaxed">
              Everything in InBetween is based on how your brain actually works — habit loops,
              awareness timing, and neuroplasticity. Here's the science in simple language.
            </p>
          </div>
        </motion.div>

        {/* Section cards */}
        <div className="space-y-3">
          {SECTIONS.map((section, i) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              onClick={() => openSection(section)}
              className={`w-full p-5 rounded-2xl bg-gradient-to-r ${section.color} border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] active:scale-[0.98] transition-all flex items-center gap-4 text-left`}
            >
              <div className="w-12 h-12 rounded-xl bg-background/60 flex items-center justify-center shrink-0">
                <section.icon className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{section.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {section.subtitle} · {section.steps.length} slides
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        {/* Link to Why I Built This */}
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          onClick={() => { onClose(); navigate('/why'); }}
          className="w-full mt-8 p-4 rounded-2xl bg-gradient-to-r from-primary/8 to-accent/5 border border-primary/15 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">The story behind this</p>
            <p className="text-[10px] text-muted-foreground">Read the personal journey that mirrors this science</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-[10px] text-muted-foreground/50 text-center mt-6"
        >
          Based on research in cognitive behavioral science, neuroscience, and habit formation.
        </motion.p>
      </div>
    </motion.div>
  );
}
