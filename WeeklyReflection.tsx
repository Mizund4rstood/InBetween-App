import { useMemo, useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useCompassStore } from '@/stores/compassStore';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const REFLECTIVE_QUESTIONS = [
  "What did you learn about yourself this week?",
  "Were there moments you paused when you normally wouldn't?",
  "What emotions showed up most often?",
  "Did you notice any patterns in when stress appeared?",
  "What tools felt most helpful this week?",
  "Was there a moment you chose differently?",
];

export default function WeeklyReflection() {
  const { entries, groundingSessions } = useAppStore();
  const { triggers, choices, fetchTriggers, fetchChoices } = useCompassStore();
  const [expanded, setExpanded] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  useEffect(() => {
    fetchTriggers();
    fetchChoices();
  }, [fetchTriggers, fetchChoices]);

  const summary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    // Filter this week's data
    const weekEntries = entries.filter(e => new Date(e.entryDatetime) >= weekAgo);
    const weekSessions = groundingSessions.filter(s => new Date(s.sessionDatetime) >= weekAgo);
    const weekTriggers = triggers.filter(t => new Date(t.created_at) >= weekAgo);
    const weekChoices = choices.filter(c => new Date(c.created_at) >= weekAgo);

    if (weekEntries.length < 2 && weekSessions.length < 1 && weekTriggers.length < 1) return null;

    const observations: string[] = [];

    // Most reported emotional state
    if (weekEntries.length >= 2) {
      const states: Record<string, number> = {};
      weekEntries.forEach(e => {
        if (e.regulationState) {
          states[e.regulationState] = (states[e.regulationState] || 0) + 1;
        }
      });
      const top = Object.entries(states).sort((a, b) => b[1] - a[1])[0];
      if (top) {
        observations.push(`Your most reported state this week was "${top[0]}" (${top[1]} times).`);
      }

      // Average mood
      const avgMood = weekEntries.reduce((s, e) => s + e.mood, 0) / weekEntries.length;
      observations.push(`Average mood: ${avgMood.toFixed(1)}/10 across ${weekEntries.length} check-ins.`);
    }

    // Grounding usage
    if (weekSessions.length > 0) {
      const totalMinutes = Math.round(weekSessions.reduce((s, g) => s + g.durationSec, 0) / 60);
      observations.push(`You spent ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''} grounding this week (${weekSessions.length} session${weekSessions.length !== 1 ? 's' : ''}).`);
    }

    // Compass activity
    if (weekChoices.length > 0) {
      const pauseCount = weekChoices.filter(c => c.pause_used).length;
      const alignedCount = weekChoices.filter(c => c.aligned_with_values).length;
      if (pauseCount > 0) {
        observations.push(`You used the pause ${pauseCount} time${pauseCount !== 1 ? 's' : ''} when triggered.`);
      }
      if (alignedCount > 0) {
        observations.push(`${alignedCount} choice${alignedCount !== 1 ? 's' : ''} aligned with your values.`);
      }
    }

    if (weekTriggers.length > 0) {
      observations.push(`You logged ${weekTriggers.length} trigger${weekTriggers.length !== 1 ? 's' : ''} — each one builds awareness.`);
    }

    // Pick a reflective question
    const weekNum = Math.floor((now.getTime() / 604800000)) % REFLECTIVE_QUESTIONS.length;
    const question = REFLECTIVE_QUESTIONS[weekNum];

    return { observations, question };
  }, [entries, groundingSessions, triggers, choices]);

  // Save reflection to localStorage
  const weekKey = `weekly-reflection-${new Date().toISOString().slice(0, 10).replace(/-\d+$/, '')}`;
  const savedReflection = useMemo(() => {
    try { return localStorage.getItem(weekKey) || ''; } catch { return ''; }
  }, [weekKey]);

  const handleSave = () => {
    if (reflectionText.trim()) {
      localStorage.setItem(weekKey, reflectionText.trim());
    }
  };

  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-3xl bg-gradient-to-br from-accent/8 via-card to-primary/5 border border-accent/15 shadow-[var(--shadow-card)]"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/15">
            <BookOpen className="w-4 h-4 text-accent" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm">This Week's Reflection</h3>
            <p className="text-[10px] text-muted-foreground">{summary.observations.length} observations</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {/* Observations */}
              <div className="space-y-2">
                {summary.observations.map((obs, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                    <p className="text-xs text-foreground/80 leading-relaxed">{obs}</p>
                  </motion.div>
                ))}
              </div>

              {/* Reflective question */}
              <div className="p-4 rounded-2xl bg-primary/8 border border-primary/15">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Reflect</span>
                </div>
                <p className="text-sm text-foreground font-medium italic mb-3">
                  "{summary.question}"
                </p>
                {!savedReflection ? (
                  <div className="space-y-2">
                    <textarea
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="Take a moment to reflect..."
                      className="w-full p-3 rounded-xl bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/30"
                      rows={3}
                    />
                    <button
                      onClick={handleSave}
                      disabled={!reflectionText.trim()}
                      className="w-full py-2 rounded-xl bg-primary/15 border border-primary/25 text-xs font-bold text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
                    >
                      Save reflection
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-background/50 border border-border/30">
                    <p className="text-xs text-foreground/70 leading-relaxed italic">{savedReflection}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">Saved this week ✓</p>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground/50 text-center italic">
                Awareness → Acceptance → Choice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
