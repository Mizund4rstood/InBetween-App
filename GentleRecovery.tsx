import { motion } from 'framer-motion';

interface GentleRecoveryProps {
  lastEntryDaysAgo: number;
}

const RECOVERY_MESSAGES = [
  {
    emoji: '🌿',
    title: "Your garden rested while you were away.",
    subtitle: "It didn\u2019t die. Neither did your progress.",
  },
  {
    emoji: '🌅',
    title: "Gaps are part of the pattern.",
    subtitle: "You\u2019re not starting over \u2014 you\u2019re coming back.",
  },
  {
    emoji: '🫶',
    title: "You remembered to show up.",
    subtitle: "That takes more courage than keeping a streak.",
  },
  {
    emoji: '🌊',
    title: "Tides go out. Tides come back.",
    subtitle: "Your practice is the shore \u2014 always here.",
  },
  {
    emoji: '🕊️',
    title: "No shame. Only return.",
    subtitle: "Every moment of noticing counts, whenever it happens.",
  },
];

export default function GentleRecovery({ lastEntryDaysAgo }: GentleRecoveryProps) {
  const msg = RECOVERY_MESSAGES[new Date().getDate() % RECOVERY_MESSAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="p-5 rounded-3xl bg-gradient-to-br from-accent/10 via-card to-card border border-accent/15 text-center"
    >
      <div className="text-3xl mb-3">{msg.emoji}</div>
      <p className="text-sm font-serif font-bold text-foreground leading-relaxed">
        {msg.title}
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
        {msg.subtitle}
      </p>
      {lastEntryDaysAgo > 7 && (
        <p className="text-[10px] text-muted-foreground/50 mt-2">
          {lastEntryDaysAgo} days since your last entry &middot; Your flowers are waiting
        </p>
      )}
    </motion.div>
  );
}
