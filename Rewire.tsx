import { useState } from 'react';
import { useRewireStore, UrgeType } from '@/stores/rewireStore';
import UrgeLogger from '@/components/UrgeLogger';
import RewireDashboard from '@/components/RewireDashboard';
import RewireReflection from '@/components/RewireReflection';
import { Zap, Target, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';

const URGE_SETUP: { value: UrgeType; label: string; emoji: string; desc: string }[] = [
  { value: 'drinking', label: 'Drinking', emoji: '🍺', desc: 'Urge to drink when stressed' },
  { value: 'spiral', label: 'Spiraling', emoji: '🌀', desc: 'Emotional overwhelm loops' },
  { value: 'avoidance', label: 'Avoidance', emoji: '🚪', desc: 'Avoiding tasks or situations' },
  { value: 'anger', label: 'Reactivity', emoji: '🔥', desc: 'Anger or impulsive reactions' },
];

export default function RewirePage() {
  const { startDate, startProgram, urges, getPhase, getWeek } = useRewireStore();
  const [showLogger, setShowLogger] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<UrgeType[]>([]);

  // ─── Setup screen ───
  if (!startDate) {
    return (
      <div className="max-w-lg mx-auto p-4 animate-fade-in">
        <div className="pt-10 pb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">12-Week Program</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">
            Rewire
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Train distress tolerance. Build pause. Replace escape.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)] mb-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">What are you working on?</p>
          <div className="space-y-2">
            {URGE_SETUP.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  haptics.light();
                  setSelectedTypes(prev =>
                    prev.includes(opt.value) ? prev.filter(t => t !== opt.value) : [...prev, opt.value]
                  );
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  selectedTypes.includes(opt.value)
                    ? 'bg-primary/15 border-primary/30'
                    : 'border-border/50 hover:border-primary/20'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <div>
                  <span className={`text-sm font-semibold ${selectedTypes.includes(opt.value) ? 'text-primary' : 'text-foreground'}`}>
                    {opt.label}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
          <p className="text-xs text-foreground leading-relaxed">
            <span className="font-bold">12 weeks. 4 phases.</span> Week 1–3: just notice. Week 4–6: build delay. Week 7–9: install replacements. Week 10–12: identity shift. No rush. No pressure.
          </p>
        </div>

        <button
          onClick={() => { haptics.celebration(); startProgram(selectedTypes); }}
          disabled={selectedTypes.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          Start the Program
        </button>
      </div>
    );
  }

  // ─── Logger overlay ───
  if (showLogger) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <UrgeLogger onClose={() => setShowLogger(false)} />
      </div>
    );
  }

  // ─── Main view ───
  const phase = getPhase();
  const week = getWeek();

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide">Rewire Program</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
          Week {week}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {urges.length} urge{urges.length !== 1 ? 's' : ''} logged
        </p>
        {urges.length > 0 && (() => {
          const compassCount = urges.filter(u => u.id.startsWith('compass-')).length;
          const directCount = urges.length - compassCount;
          return (
            <div className="flex items-center gap-2 mt-2">
              {compassCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-compass/10 text-compass font-semibold">
                  🧭 {compassCount} from Compass
                </span>
              )}
              {directCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  ⚡ {directCount} direct
                </span>
              )}
            </div>
          );
        })()}
      </div>

      {/* Log urge CTA */}
      <button
        onClick={() => setShowLogger(true)}
        className="w-full p-6 rounded-3xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground flex items-center justify-center gap-3 active:scale-[0.98] transition-all mb-6 shadow-[var(--shadow-glow-primary)]"
      >
        <Zap className="w-6 h-6" />
        <span className="text-lg font-bold">Log an Urge</span>
      </button>

      {/* Phase prompt */}
      {phase === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Phase 1: Awareness</p>
          <p className="text-xs text-foreground leading-relaxed">
            No pressure to change yet. Just notice. Is there an urge? Is there something you're avoiding? Log it.
          </p>
        </motion.div>
      )}

      {phase === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Phase 2: Delay</p>
          <p className="text-xs text-foreground leading-relaxed">
            When the urge hits, start the timer. Even 60 seconds rewires inhibitory control.
          </p>
        </motion.div>
      )}

      {phase === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Phase 3: Replace</p>
          <p className="text-xs text-foreground leading-relaxed">
            You've built delay. Now install alternatives. Grounding. Cold water. Walk. "Not today."
          </p>
        </motion.div>
      )}

      {phase === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Phase 4: Identity</p>
          <p className="text-xs text-foreground leading-relaxed">
            You don't escape discomfort the same way anymore. Look at the data. That's who you are now.
          </p>
        </motion.div>
      )}

      {/* AI Reflection */}
      <div className="mb-6">
        <RewireReflection />
      </div>

      {/* Metrics dashboard */}
      <RewireDashboard />
    </div>
  );
}
