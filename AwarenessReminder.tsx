import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const REMINDERS = [
  "Awareness creates choice.",
  "Notice the moment before the reaction.",
  "You are not your impulses.",
  "The pause is the practice.",
  "Every time you notice, you grow stronger.",
  "Acceptance doesn't mean giving in. It means seeing clearly.",
  "Between stimulus and response, there is a space.",
  "You came here. That's already a choice.",
  "Patterns are not destiny. They are information.",
  "The skill you're building is noticing.",
];

export default function AwarenessReminder() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Show once per session, after a delay
    const shown = sessionStorage.getItem('awareness_reminder_shown');
    if (shown) return;

    const timer = setTimeout(() => {
      const day = Math.floor(Date.now() / 86400000);
      setIndex(day % REMINDERS.length);
      setVisible(true);
      sessionStorage.setItem('awareness_reminder_shown', '1');
    }, 8000); // 8 seconds after mount

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-accent/8 border border-primary/15 flex items-start gap-3"
      >
        <span className="text-lg shrink-0 mt-0.5">💡</span>
        <p className="text-sm text-foreground/80 italic leading-relaxed flex-1">
          {REMINDERS[index]}
        </p>
        <button
          onClick={() => setVisible(false)}
          className="p-1 rounded-lg text-muted-foreground/40 hover:text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
