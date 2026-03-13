import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const MESSAGES = [
  "Take a 30-second pause with me.",
  "Notice what you're feeling right now.",
  "Even a small pause can change the direction of your day.",
  "You don't have to fix anything. Just notice.",
  "The space between impulse and action — that's where you live now.",
  "Awareness isn't perfection. It's paying attention.",
  "One conscious breath changes the next five minutes.",
  "You came here. That already matters.",
  "There's no wrong way to pause.",
  "Your patterns are shifting, even when it doesn't feel like it.",
  "Stillness isn't weakness. It's the strongest choice.",
  "What you practice grows stronger.",
  "The urge will pass. You'll still be here.",
  "You're not avoiding life. You're choosing how to meet it.",
  "Small pauses. Big changes. That's the path.",
];

function getSeededIndex(): number {
  // Rotate every 4 hours so it feels fresh but not frantic
  const hourBlock = Math.floor(Date.now() / (4 * 60 * 60 * 1000));
  return hourBlock % MESSAGES.length;
}

export default function CompanionMessages({ className = '' }: { className?: string }) {
  const [index, setIndex] = useState(getSeededIndex);
  const [visible, setVisible] = useState(true);

  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex(i => (i + 1) % MESSAGES.length);
      setVisible(true);
    }, 400);
  }, []);

  // Auto-rotate every 20 seconds if user is just sitting here
  useEffect(() => {
    const timer = setInterval(advance, 20000);
    return () => clearInterval(timer);
  }, [advance]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/6 via-card to-primary/4 border border-border/40 px-5 py-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-accent/10 shrink-0 mt-0.5">
          <MessageCircle className="w-3.5 h-3.5 text-accent" />
        </div>
        <div className="flex-1 min-w-0 min-h-[2.5rem] flex items-center">
          <AnimatePresence mode="wait">
            {visible && (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-foreground/70 leading-relaxed italic cursor-pointer select-none"
                onClick={advance}
              >
                "{MESSAGES[index]}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
