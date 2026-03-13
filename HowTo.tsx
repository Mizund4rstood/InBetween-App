import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wind, Compass, Home, BookOpen, Zap, Pause, Shield, Sparkles, CalendarDays, Settings, Heart, Brain, Music, Youtube, Flame, Eye, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InBetweenPhilosophy from '@/components/InBetweenPhilosophy';

interface Guide {
  id: string;
  icon: React.ElementType;
  title: string;
  mode: 'ground' | 'compass' | 'shared';
  steps: string[];
}

const guides: Guide[] = [
  {
    id: 'express-checkin',
    icon: Zap,
    title: 'Express Check-In',
    mode: 'ground',
    steps: [
      'From the Home tab, tap the quick check-in card.',
      'Slide to rate your mood (1–10) and stress level.',
      'Optionally add a short note about what\'s on your mind.',
      'Hit "Log" — it takes 10 seconds and builds your streak.',
    ],
  },
  {
    id: 'bearings',
    icon: BookOpen,
    title: 'Bearings (Log)',
    mode: 'ground',
    steps: [
      'Tap the Bearings tab in the bottom nav.',
      'Log a full check-in with mood, stress, and journal items.',
      'Tag what\'s going on — the app learns your patterns over time.',
      'Entries feed into your Weekly Summary and AI Reflections.',
    ],
  },
  {
    id: 'grounding',
    icon: Wind,
    title: 'Grounding Tools',
    mode: 'ground',
    steps: [
      'Tap the Ground tab to access breathing and 5-4-3-2-1 exercises.',
      'Breathing: Choose 1, 2, or 3 minutes. Follow the animated guide.',
      '5-4-3-2-1: Walk through each sense — see, touch, hear, smell, taste.',
      'Rate your mood before and after to track what works for you.',
    ],
  },
  {
    id: 'weekly-summary',
    icon: CalendarDays,
    title: 'Weekly Summary',
    mode: 'ground',
    steps: [
      'Tap the Week tab to see your 7-day overview.',
      'View your mood and stress trends visualized day-by-day.',
      'Read your auto-generated steadiness score and insights.',
      'The more you check in, the sharper this picture gets.',
    ],
  },
  {
    id: 'reflect',
    icon: Sparkles,
    title: 'AI Reflect',
    mode: 'ground',
    steps: [
      'Tap Reflect in the bottom nav.',
      'Generate a weekly reflection — the AI reads your patterns.',
      'Get an identity shift insight based on your behavioral data.',
      'Chat with the AI for deeper follow-up on anything it surfaces.',
    ],
  },
  {
    id: 'compass-home',
    icon: Compass,
    title: 'Compass Home',
    mode: 'compass',
    steps: [
      'Switch to Compass mode using the toggle at the top.',
      'See your Choice Gap stats — alignment rate and pause usage.',
      'Tap into your Why Vault to review your core motivations.',
      'This is your command center for behavior tracking.',
    ],
  },
  {
    id: 'log-trigger',
    icon: Zap,
    title: 'Log a Trigger',
    mode: 'compass',
    steps: [
      'In Compass mode, tap the Log tab.',
      'Describe the trigger — what happened, what you felt.',
      'Rate the intensity and pick the emotion and urge.',
      'After logging, record the choice you made and whether you paused.',
    ],
  },
  {
    id: 'pause-training',
    icon: Pause,
    title: 'Pause Training',
    mode: 'compass',
    steps: [
      'Tap the Pause tab in Compass mode.',
      'Practice inserting a pause between trigger and reaction.',
      'Use the guided timer to build your pause muscle.',
      'Your pause rate feeds into Compass analytics.',
    ],
  },
  {
    id: 'rewire',
    icon: Shield,
    title: '12-Week Rewire',
    mode: 'compass',
    steps: [
      'Access Rewire from the Compass nav bar.',
      'Choose up to 4 urge types you want to work on (drinking, spiraling, avoidance, reactivity).',
      'Log urges as they happen — track intensity, what helped, and outcome.',
      'Follow your 12-week phase progression: Awareness → Interruption → Replacement.',
    ],
  },
  {
    id: 'media',
    icon: Music,
    title: 'Link Media Sources',
    mode: 'shared',
    steps: [
      'Go to Settings (gear icon, top right).',
      'Under Connected Media, link your YouTube channel or playlist.',
      'Link a Spotify playlist or artist for genre/vibe analysis.',
      'Linked sources enrich AI reflections with your content patterns.',
    ],
  },
  {
    id: 'voice',
    icon: Brain,
    title: 'Voice Playback',
    mode: 'shared',
    steps: [
      'In Settings, toggle Voice Playback on.',
      'Choose a narration voice from 14 options.',
      'Preview the voice with the test button.',
      'AI reflections will now have a Listen button to hear them aloud.',
    ],
  },
  {
    id: 'modes',
    icon: Home,
    title: 'Switching Modes',
    mode: 'shared',
    steps: [
      'Use the Ground / Compass toggle at the top of the screen.',
      'Ground mode: daily check-ins, grounding exercises, weekly reflections.',
      'Compass mode: trigger logging, behavior tracking, the Choice Gap.',
      'Both modes share your data — insights from one feed the other.',
    ],
  },
];

const modeColors = {
  ground: 'text-primary',
  compass: 'text-compass',
  shared: 'text-accent',
};

const modeBg = {
  ground: 'bg-primary/10',
  compass: 'bg-compass/10',
  shared: 'bg-accent/10',
};

const modeLabels = {
  ground: 'Ground',
  compass: 'Compass',
  shared: 'Both Modes',
};

export default function HowToPage() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ground' | 'compass' | 'shared'>('all');

  const filtered = filter === 'all' ? guides : guides.filter(g => g.mode === filter);

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm mb-3 active:scale-95 transition-transform">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-serif font-bold">How It Works</h1>
        <p className="text-sm text-muted-foreground mt-1">Quick guides for every feature.</p>
      </div>

      {/* The InBetween philosophy */}
      <div className="mb-6">
        <InBetweenPhilosophy variant="compact" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'ground', 'compass', 'shared'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'all' ? 'All' : f === 'shared' ? 'Both Modes' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Guide cards */}
      <div className="space-y-2">
        {filtered.map((guide) => {
          const Icon = guide.icon;
          const isOpen = openId === guide.id;
          return (
            <motion.div
              key={guide.id}
              layout
              className="rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : guide.id)}
                className="w-full p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
              >
                <div className={`p-2 rounded-xl ${modeBg[guide.mode]}`}>
                  <Icon className={`w-4 h-4 ${modeColors[guide.mode]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">{guide.title}</span>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${modeColors[guide.mode]}`}>
                    {modeLabels[guide.mode]}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2.5">
                      {guide.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${modeBg[guide.mode]} ${modeColors[guide.mode]}`}>
                            {i + 1}
                          </span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center py-8">
        <p className="text-xs text-muted-foreground/50">
          Still stuck? Just ask — you'll figure it out.
        </p>
      </div>
    </div>
  );
}
