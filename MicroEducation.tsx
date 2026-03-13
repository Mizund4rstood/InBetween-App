import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, X, Brain, Heart, Shield, Eye } from 'lucide-react';

interface Lesson {
  id: string;
  icon: typeof Brain;
  title: string;
  duration: string;
  color: string;
  slides: { heading: string; body: string }[];
}

const LESSONS: Lesson[] = [
  {
    id: 'urges',
    icon: Brain,
    title: 'How Urges Work',
    duration: '45 sec',
    color: 'from-primary/15 to-accent/10 border-primary/20',
    slides: [
      {
        heading: 'Urges are waves, not commands',
        body: 'An urge is your brain replaying a pattern it learned. It feels like a demand, but it\'s actually a suggestion — a strong one, built by repetition. The urge itself cannot make you act.',
      },
      {
        heading: 'The 90-second rule',
        body: 'Neuroanatomist Jill Bolte Taylor found that the chemical process of an emotion lasts about 90 seconds. After that, any remaining feeling is your mind re-triggering the cycle. If you can ride the wave for 90 seconds, it weakens.',
      },
      {
        heading: 'Every time you don\'t act, you rewire',
        body: 'Each time you feel an urge and choose differently, you weaken the neural pathway that created it. You\'re not just resisting — you\'re literally building a new brain pattern. That\'s neuroplasticity working for you.',
      },
    ],
  },
  {
    id: 'body-emotions',
    icon: Heart,
    title: 'Emotions in Your Body',
    duration: '40 sec',
    color: 'from-accent/15 to-primary/10 border-accent/20',
    slides: [
      {
        heading: 'Emotions are physical events',
        body: 'Before you "feel" anxious or angry, your body reacts first — heart rate changes, muscles tense, breathing shifts. The emotion you label comes after. Your body is the early warning system.',
      },
      {
        heading: 'Where do you feel it?',
        body: 'Anxiety often lives in the chest and stomach. Anger shows up in the jaw, fists, and shoulders. Shame contracts the whole body. When you notice where a feeling lives, you gain the ability to work with it directly.',
      },
      {
        heading: 'Noticing is intervening',
        body: 'Simply paying attention to a body sensation changes your brain\'s response to it. You activate the prefrontal cortex — the part that chooses — instead of staying stuck in the amygdala, which only reacts.',
      },
    ],
  },
  {
    id: 'avoidance',
    icon: Shield,
    title: 'Why Avoidance Backfires',
    duration: '45 sec',
    color: 'from-amber-500/15 to-orange-400/10 border-amber-400/20',
    slides: [
      {
        heading: 'Avoidance feels like relief',
        body: 'When you avoid something uncomfortable, your anxiety drops immediately. Your brain marks that as "worked." But the next time the trigger appears, the anxiety is bigger because your brain never learned it was survivable.',
      },
      {
        heading: 'The avoidance trap',
        body: 'Each avoidance teaches your brain the threat was real. So the world gets smaller: more things feel dangerous, more situations need avoiding. Substances and scrolling are avoidance too — anything that helps you not-feel.',
      },
      {
        heading: 'Facing it shrinks it',
        body: 'When you stay with discomfort — even for 60 seconds — your brain learns "I survived this." That\'s called habituation. Each exposure makes the next one easier. You\'re not suffering, you\'re training.',
      },
    ],
  },
  {
    id: 'awareness',
    icon: Eye,
    title: 'How Awareness Changes You',
    duration: '40 sec',
    color: 'from-violet-500/15 to-purple-400/10 border-violet-400/20',
    slides: [
      {
        heading: 'The space between',
        body: 'Between every impulse and every action, there\'s a gap. Most people never notice it. It happens in a fraction of a second. But the gap is real, and it can be expanded. That\'s what this app trains.',
      },
      {
        heading: 'Awareness is a skill',
        body: 'You weren\'t born noticing your thoughts and reactions — it\'s a skill like any other. Each time you pause to observe what\'s happening inside, you strengthen the neural circuits for self-awareness. It literally gets easier.',
      },
      {
        heading: 'From automatic to intentional',
        body: 'Most human behavior is automatic — habit loops running without permission. Awareness interrupts the loop. Not by force, but by seeing it clearly. When you see the pattern, you\'re no longer trapped inside it.',
      },
    ],
  },
];

interface Props {
  onClose: () => void;
}

export default function MicroEducation({ onClose }: Props) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const openLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSlideIndex(0);
  };

  if (selectedLesson) {
    const slide = selectedLesson.slides[slideIndex];
    const isLast = slideIndex === selectedLesson.slides.length - 1;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
      >
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setSelectedLesson(null)} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back
          </button>
          <div className="flex gap-1">
            {selectedLesson.slides.map((_, i) => (
              <div key={i} className={`w-8 h-1 rounded-full transition-colors ${i <= slideIndex ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="text-center"
            >
              <h3 className="text-xl font-serif font-bold mb-6">{slide.heading}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{slide.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 flex justify-between items-center max-w-md mx-auto w-full">
          <button
            onClick={() => setSlideIndex(i => Math.max(0, i - 1))}
            disabled={slideIndex === 0}
            className="p-3 rounded-full bg-muted/50 disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {isLast ? (
            <button
              onClick={() => { setSelectedLesson(null); }}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
            >
              Got it
            </button>
          ) : (
            <button
              onClick={() => setSlideIndex(i => i + 1)}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="w-11" /> {/* Spacer to balance layout */}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <h2 className="text-lg font-semibold">Understand Your Mind</h2>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <p className="text-sm text-muted-foreground mb-8">
          Short lessons about why your mind does what it does. Knowledge is power.
        </p>

        <div className="space-y-3">
          {LESSONS.map((lesson, i) => (
            <motion.button
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => openLesson(lesson)}
              className={`w-full p-5 rounded-2xl bg-gradient-to-r ${lesson.color} border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] active:scale-[0.98] transition-all flex items-center gap-4 text-left`}
            >
              <div className="w-12 h-12 rounded-xl bg-background/60 flex items-center justify-center shrink-0">
                <lesson.icon className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{lesson.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{lesson.duration} · {lesson.slides.length} slides</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
