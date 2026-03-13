import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Heart, Shield, Wind, X } from 'lucide-react';

const CRISIS_KEYWORDS = [
  'hopeless', 'hopelessness', 'suicid', 'kill myself', 'end it', 'give up',
  'no point', 'can\'t go on', 'not worth', 'want to die', 'self harm', 'self-harm',
  'cutting', 'hurt myself', 'ending it', 'no reason to live', 'better off dead',
  'panic attack', 'can\'t breathe', 'severe anxiety', 'crisis', 'emergency',
  'unbearable', 'can\'t take it', 'breaking down', 'falling apart',
];

const CRISIS_EMOTIONS = ['hopelessness', 'despair', 'panic', 'terror'];

interface CrisisSupportProps {
  triggerText?: string;
  emotion?: string;
  intensity?: number;
  mood?: number | null;
  stress?: number;
}

export function detectCrisis({ triggerText, emotion, intensity, mood, stress }: CrisisSupportProps): boolean {
  const text = (triggerText || '').toLowerCase();
  const em = (emotion || '').toLowerCase();

  if (CRISIS_KEYWORDS.some(kw => text.includes(kw))) return true;
  if (CRISIS_EMOTIONS.includes(em)) return true;
  if (intensity !== undefined && intensity >= 9 && CRISIS_EMOTIONS.some(e => em.includes(e))) return true;
  if (mood !== undefined && mood !== null && mood <= 2 && (stress === undefined || stress >= 8)) return true;

  return false;
}

const SELF_SOOTHE = [
  { emoji: '🧊', label: 'Hold ice or splash cold water on your face' },
  { emoji: '🫁', label: 'Breathe in 4 counts, out 6 counts' },
  { emoji: '👣', label: 'Press your feet firmly into the floor' },
  { emoji: '🎧', label: 'Listen to a song that makes you feel safe' },
  { emoji: '🤲', label: 'Name 5 things you can touch right now' },
  { emoji: '🫂', label: 'Hug yourself — literally — for 20 seconds' },
];

export default function CrisisSupport({ onDismiss }: { onDismiss?: () => void }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-3xl bg-gradient-to-br from-destructive/8 via-card to-card border border-destructive/15 p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-destructive" />
          <h3 className="text-sm font-serif font-bold text-foreground">We're here for you</h3>
        </div>
        <button
          onClick={() => { setDismissed(true); onDismiss?.(); }}
          className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        What you're feeling is real — and it matters. You don't have to face it alone.
      </p>

      <div className="space-y-2.5">
        {/* Call someone */}
        <a
          href="tel:988"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/15 hover:bg-destructive/15 transition-colors"
        >
          <Phone className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-foreground">Talk to someone now</p>
            <p className="text-xs text-muted-foreground">988 Suicide & Crisis Lifeline — call or text 988</p>
          </div>
        </a>

        {/* Crisis Text Line */}
        <a
          href="sms:741741&body=HELLO"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
        >
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Crisis Text Line</p>
            <p className="text-xs text-muted-foreground">Text HOME to 741741</p>
          </div>
        </a>

        {/* Grounding shortcut */}
        <button
          onClick={() => navigate('/ground')}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-primary/8 border border-primary/15 hover:bg-primary/12 transition-colors text-left"
        >
          <Wind className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Crisis grounding exercise</p>
            <p className="text-xs text-muted-foreground">A quick exercise to bring you back to now</p>
          </div>
        </button>

        {/* Self-soothing toolkit (expandable) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-accent/8 border border-accent/15 hover:bg-accent/12 transition-colors text-left"
        >
          <Heart className="w-5 h-5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-foreground">Self-soothing toolkit</p>
            <p className="text-xs text-muted-foreground">
              {expanded ? 'Gentle things you can try right now' : 'Tap for gentle coping strategies'}
            </p>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-1 pb-1">
                {SELF_SOOTHE.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border/30"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-sm text-foreground">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[10px] text-muted-foreground/60 mt-4 text-center leading-relaxed">
        You are not a burden. Reaching out is strength, not weakness.
      </p>
    </motion.div>
  );
}
