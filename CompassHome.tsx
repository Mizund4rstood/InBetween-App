import { useEffect, useMemo } from 'react';
import { useCompassStore } from '@/stores/compassStore';
import { useAppStore } from '@/stores/appStore';
import { calculateStreak } from '@/lib/analytics';
import { Compass, Zap, TrendingUp, Target, ArrowRight, Hand, Shuffle, RotateCcw, Lock, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VaultSurface from '@/components/VaultSurface';
import BehaviorCompass from '@/components/BehaviorCompass';
import PatternMirror from '@/components/PatternMirror';
import FutureSelfCard from '@/components/FutureSelf';
import ProgressStory from '@/components/ProgressStory';

export default function CompassHomePage() {
  const { triggers, choices, fetchTriggers, fetchChoices, loading } = useCompassStore();
  const { entries } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTriggers();
    fetchChoices();
  }, []);

  const stats = useMemo(() => {
    const totalTriggers = triggers.length;
    const totalChoices = choices.length;
    const alignedChoices = choices.filter(c => c.aligned_with_values).length;
    const alignmentRate = totalChoices > 0 ? Math.round((alignedChoices / totalChoices) * 100) : 0;
    const pauseRate = totalChoices > 0 ? Math.round((choices.filter(c => c.pause_used).length / totalChoices) * 100) : 0;

    // Weekly choice gap stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekChoices = choices.filter(c => new Date(c.created_at) >= oneWeekAgo);
    const weekPauses = weekChoices.filter(c => c.pause_used).length;
    const weekDifferent = weekChoices.filter(c => c.chose_differently).length;

    // Today's triggers — hard day detection
    const today = new Date().toDateString();
    const todayTriggers = triggers.filter(t => new Date(t.created_at).toDateString() === today);
    const todayChoices = choices.filter(c => new Date(c.created_at).toDateString() === today);
    const isHardDay = todayTriggers.length >= 3 || todayTriggers.some(t => (t.intensity ?? 0) >= 8);
    const lowAlignment = todayChoices.length >= 2 && todayChoices.filter(c => !c.aligned_with_values).length > todayChoices.length / 2;

    // Ground ↔ Compass connection
    const groundStreak = calculateStreak(entries.map(e => e.entryDatetime));

    return { totalTriggers, totalChoices, alignmentRate, pauseRate, groundStreak, weekPauses, weekDifferent, weekChoicesTotal: weekChoices.length, isHardDay: isHardDay || lowAlignment };
  }, [triggers, choices, entries]);

  const COMPASS_COMPASSION = [
    "Growth isn't linear. You're still navigating.",
    "Reactivity today doesn't erase yesterday's pauses.",
    "Noticing the pattern is already the intervention.",
    "Rough waters don't mean you've lost the compass.",
    "You showed up. That's the hardest part.",
  ];
  const compassionMsg = COMPASS_COMPASSION[new Date().getDate() % COMPASS_COMPASSION.length];

  const recentTriggers = triggers.slice(0, 3);

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-8 relative">
        <div className="absolute top-6 right-0 w-20 h-20 rounded-full bg-compass/5 blur-2xl animate-float" />
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Compass className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide">Compass Mode</span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">
          Navigate
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          You're becoming someone who chooses, not just reacts
        </p>
      </div>

      {/* Behavior Compass — the primary visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 18 }}
        className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-compass/10 via-card to-card border border-compass/15 shadow-[var(--shadow-card)]"
      >
        <BehaviorCompass size="lg" />
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-compass/10 via-card to-card border border-compass/10 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-compass/10">
              <Target className="w-4 h-4 text-compass" />
            </div>
            <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Alignment</span>
          </div>
          <p className="text-3xl font-serif font-bold text-foreground">{stats.alignmentRate}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">of your choices reflect your values</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/10 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Pause Rate</span>
          </div>
          <p className="text-3xl font-serif font-bold text-foreground">{stats.pauseRate}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">you paused before reacting</p>
        </div>
      </div>

      {/* Compassion layer for hard days */}
      {stats.isHardDay && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-accent/8 via-card to-card border border-accent/15 text-center"
        >
          <div className="text-2xl mb-2">🫶</div>
          <p className="text-sm font-serif font-semibold text-foreground leading-relaxed">{compassionMsg}</p>
          <p className="text-xs text-muted-foreground mt-2">Awareness without judgment is the practice.</p>
        </motion.div>
      )}

      {/* Why Vault surface for hard days */}
      {stats.isHardDay && (
        <div className="mb-6">
          <VaultSurface />
        </div>
      )}

      {/* Choice Gap Tracker */}
      {stats.weekChoicesTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-compass/10 via-card to-card border border-compass/15 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2 mb-3">
            <Hand className="w-4 h-4 text-compass" />
            <span className="text-sm font-bold">Choice Gap — This Week</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-card/80 border border-border/30">
              <p className="text-2xl font-serif font-bold text-compass">{stats.weekPauses}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Pauses</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-card/80 border border-border/30">
              <p className="text-2xl font-serif font-bold text-foreground">{stats.weekDifferent}</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Chose Differently</p>
            </div>
          </div>
          {stats.weekPauses > 0 && (
            <p className="text-sm text-foreground mt-3 bg-compass/5 rounded-xl px-3 py-2.5 leading-relaxed">
              💡 You paused {stats.weekPauses} time{stats.weekPauses !== 1 ? 's' : ''} this week.
              {stats.weekDifferent > 0 && ` And chose differently ${stats.weekDifferent} time${stats.weekDifferent !== 1 ? 's' : ''}.`}
              {' '}You're becoming someone who responds, not reacts.
            </p>
          )}
        </motion.div>
      )}

      {/* Pattern Mirror — AI behavioral analysis */}
      <div className="mb-6">
        <PatternMirror />
      </div>

      {/* Progress Story — narrative journey */}
      <div className="mb-6">
        <ProgressStory variant="full" />
      </div>

      {/* Future Self — record messages for later */}
      <div className="mb-6">
        <FutureSelfCard />
      </div>
      {stats.groundStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-primary/10 via-compass/5 to-primary/10 border border-primary/15"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Ground ↔ Compass Loop</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your {stats.groundStreak}-day grounding streak is shaping who you are. 
            You're becoming someone whose body knows safety — and it shows in your choices.
          </p>
        </motion.div>
      )}

      {/* Quick actions */}
      <button
        onClick={() => navigate('/compass/log')}
        className="group w-full p-6 rounded-3xl bg-gradient-to-r from-compass to-compass-dark text-primary-foreground flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-300 mb-6 shadow-[0_0_24px_-4px_hsl(var(--compass)/0.25)]"
      >
        <Zap className="w-6 h-6 animate-gentle-bounce" />
        <span className="text-lg font-bold tracking-wide">Log a Trigger</span>
      </button>

      {/* Behavior Loop */}
      <button
        onClick={() => navigate('/compass/loop')}
        className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] flex items-center gap-4 text-left hover:border-compass/30 active:scale-[0.98] transition-all duration-200 mb-3"
      >
        <div className="p-2.5 rounded-xl bg-compass/10 shrink-0">
          <RotateCcw className="w-5 h-5 text-compass" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">Behavior Loop</p>
          <p className="text-xs text-muted-foreground mt-0.5">See and edit your trigger → outcome patterns</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
      </button>

      {/* Trigger History */}
      <button
        onClick={() => navigate('/compass/history')}
        className="w-full p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] flex items-center gap-4 text-left hover:border-compass/30 active:scale-[0.98] transition-all duration-200 mb-6"
      >
        <div className="p-2.5 rounded-xl bg-accent/10 shrink-0">
          <TrendingUp className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">Trigger History</p>
          <p className="text-xs text-muted-foreground mt-0.5">Review your logged triggers and patterns</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
      </button>

      {/* Recent triggers */}
      {recentTriggers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold">Recent Triggers</h2>
            <button
              onClick={() => navigate('/compass/history')}
              className="text-xs text-compass font-semibold flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentTriggers.map((t, idx) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-[var(--shadow-card)] animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <p className="text-sm font-medium">{t.trigger_text}</p>
                <div className="flex items-center gap-2 mt-2">
                  {t.emotion && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-compass/10 text-compass font-semibold">
                      {t.emotion}
                    </span>
                  )}
                  {t.intensity && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                      ⚡ {t.intensity}/10
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {triggers.length === 0 && !loading && (
        <div className="text-center py-16 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-compass/5 blur-2xl" />
          </div>
          <div className="relative">
            <div className="text-5xl mb-5 animate-float">🧭</div>
            <p className="text-foreground font-serif text-lg font-semibold">Begin navigating</p>
            <p className="text-sm text-muted-foreground mt-2">Log your first trigger — you're becoming someone who notices patterns</p>
          </div>
        </div>
      )}
    </div>
  );
}
