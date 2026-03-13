import { motion } from 'framer-motion';

interface NearMilestoneProps {
  streak: number;
  nextFlowerStage?: { name: string; daysAway: number } | null;
}

const STREAK_MILESTONES = [7, 30, 60, 100, 365];

function getNearMilestone(streak: number): { days: number; label: string } | null {
  for (const m of STREAK_MILESTONES) {
    const away = m - streak;
    if (away > 0 && away <= 3) {
      return { days: away, label: `${m}-day streak` };
    }
  }
  return null;
}

const BOOST_MESSAGES: Record<number, string[]> = {
  1: [
    "One more day. Just one. You're right there.",
    "Tomorrow you lock in this milestone.",
    "One entry away. Finish what you started.",
  ],
  2: [
    "Two days out. Stay in it.",
    "You're closer than you think. Keep showing up.",
    "48 hours. That's nothing for someone like you.",
  ],
  3: [
    "Three days out. The finish line is forming.",
    "You're in striking distance. Don't break the chain.",
    "Almost there. The work is carrying you.",
  ],
};

export default function NearMilestoneBoost({ streak, nextFlowerStage }: NearMilestoneProps) {
  const nearMilestone = getNearMilestone(streak);

  if (!nearMilestone && !nextFlowerStage) return null;

  // Pick the closest one
  const target = nearMilestone && (!nextFlowerStage || nearMilestone.days <= nextFlowerStage.daysAway)
    ? nearMilestone
    : nextFlowerStage
      ? { days: nextFlowerStage.daysAway, label: nextFlowerStage.name }
      : null;

  if (!target || target.days > 3 || target.days <= 0) return null;

  const messages = BOOST_MESSAGES[target.days] || BOOST_MESSAGES[3];
  const message = messages[new Date().getDate() % messages.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-accent/5 border border-primary/15 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0">
          {target.days === 1 ? '🔥' : target.days === 2 ? '⚡' : '✨'}
        </div>
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
            {target.days} day{target.days !== 1 ? 's' : ''} to {target.label}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
