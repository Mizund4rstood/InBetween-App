import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, RefreshCw, Eye, Zap, Timer, ArrowRight } from 'lucide-react';

const REWARD_LOOP_LESSONS = [
  {
    id: 'what',
    title: 'What is a reward loop?',
    icon: RefreshCw,
    summary: 'A cycle your brain runs on autopilot: trigger → craving → action → temporary relief → repeat.',
    detail: 'Your brain is wired to repeat anything that reduces discomfort — even if the relief is brief. This loop runs below conscious awareness. The key isn\'t willpower. It\'s noticing the loop while it\'s happening.',
    practice: 'Next time you feel an urge, pause and say: "I see the loop starting."',
  },
  {
    id: 'near-miss',
    title: 'The "almost" trick',
    icon: Zap,
    summary: 'Near-misses feel like progress. Your brain treats "almost winning" as motivation to keep going.',
    detail: 'Slot machines use this: showing two matching symbols and one just off. Your brain interprets this as "so close!" — releasing dopamine as if you nearly succeeded. In daily life, this shows up as "just one more try" thinking.',
    practice: 'When you catch yourself thinking "just one more," ask: "Is this real progress or a near-miss illusion?"',
  },
  {
    id: 'time-blindness',
    title: 'Time disappears in loops',
    icon: Timer,
    summary: 'Reward loops distort time perception. Minutes feel like seconds when you\'re in the cycle.',
    detail: 'Casinos have no clocks or windows. Scrolling apps hide timestamps. When dopamine flows, your internal clock slows down. This is why you look up and realize hours have passed. The loop literally steals your sense of time.',
    practice: 'Set a gentle timer before activities you tend to lose time in. The alarm becomes your awareness checkpoint.',
  },
  {
    id: 'anticipation',
    title: 'Anticipation > the reward',
    icon: Eye,
    summary: 'Your brain releases more dopamine anticipating a reward than actually receiving it.',
    detail: 'This is why the craving feels so intense but the satisfaction is brief. Notifications, "loading" animations, variable rewards — they all exploit this gap between wanting and having. Understanding this weakens the craving\'s grip.',
    practice: 'During a craving, notice: "The wanting feels bigger than the having ever does."',
  },
];

export default function PatternAwareness() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setSeenIds(prev => new Set(prev).add(id));
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-xl bg-accent/15">
          <Brain className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Pattern Awareness</h3>
          <p className="text-[10px] text-muted-foreground">Recognize reward loops in daily life</p>
        </div>
        {seenIds.size > 0 && (
          <span className="ml-auto text-[10px] text-accent font-medium">
            {seenIds.size}/{REWARD_LOOP_LESSONS.length}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {REWARD_LOOP_LESSONS.map((lesson) => {
          const isExpanded = expandedId === lesson.id;
          const Icon = lesson.icon;
          const seen = seenIds.has(lesson.id);

          return (
            <motion.div
              key={lesson.id}
              layout
              className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
                isExpanded
                  ? 'border-accent/30 bg-accent/5'
                  : seen
                  ? 'border-border/40 bg-muted/30'
                  : 'border-border/30 bg-card'
              }`}
            >
              <button
                onClick={() => toggle(lesson.id)}
                className="w-full flex items-center gap-3 p-3.5 text-left"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${isExpanded ? 'bg-accent/20' : 'bg-muted/50'}`}>
                  <Icon className={`w-4 h-4 ${isExpanded ? 'text-accent' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{lesson.title}</p>
                  {!isExpanded && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{lesson.summary}</p>
                  )}
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-4 space-y-3">
                      <p className="text-xs text-foreground/80 leading-relaxed">{lesson.detail}</p>
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/8 border border-primary/15">
                        <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-[11px] text-foreground/90 font-medium leading-relaxed">
                          {lesson.practice}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {seenIds.size === REWARD_LOOP_LESSONS.length && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-accent text-center mt-4 font-medium"
        >
          ✦ You've explored all patterns. Awareness is the first step to freedom.
        </motion.p>
      )}
    </div>
  );
}
