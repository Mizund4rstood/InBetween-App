import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { sounds } from '@/lib/sounds';

interface EmotionCategory {
  label: string;
  emoji: string;
  color: string;
  emotions: string[];
}

const EMOTION_WHEEL: EmotionCategory[] = [
  {
    label: 'Angry',
    emoji: '🔥',
    color: 'from-red-500/20 to-orange-400/20 border-red-400/30',
    emotions: ['Frustrated', 'Resentful', 'Irritated', 'Bitter', 'Betrayed', 'Disrespected', 'Violated'],
  },
  {
    label: 'Sad',
    emoji: '🌧️',
    color: 'from-blue-500/20 to-indigo-400/20 border-blue-400/30',
    emotions: ['Lonely', 'Rejected', 'Empty', 'Grief', 'Helpless', 'Disappointed', 'Abandoned'],
  },
  {
    label: 'Anxious',
    emoji: '⚡',
    color: 'from-amber-500/20 to-yellow-400/20 border-amber-400/30',
    emotions: ['Worried', 'Overwhelmed', 'Panicked', 'Restless', 'On edge', 'Dread', 'Insecure'],
  },
  {
    label: 'Scared',
    emoji: '🫣',
    color: 'from-purple-500/20 to-violet-400/20 border-purple-400/30',
    emotions: ['Vulnerable', 'Threatened', 'Out of control', 'Powerless', 'Exposed', 'Unsafe'],
  },
  {
    label: 'Ashamed',
    emoji: '😔',
    color: 'from-stone-500/20 to-gray-400/20 border-stone-400/30',
    emotions: ['Guilty', 'Embarrassed', 'Worthless', 'Disgusted with myself', 'Inadequate', 'Exposed'],
  },
  {
    label: 'Numb',
    emoji: '🧊',
    color: 'from-slate-500/20 to-zinc-400/20 border-slate-400/30',
    emotions: ['Disconnected', 'Checked out', 'Flat', 'Hollow', 'Frozen', 'Detached', 'Shut down'],
  },
];

const RELIEF_MESSAGES: Record<string, string> = {
  Frustrated: "Frustration means something matters to you. That's not weakness — it's clarity.",
  Resentful: "Resentment is anger that wasn't heard. You're hearing it now.",
  Irritated: "Irritation is your nervous system saying 'too much.' You're learning to listen.",
  Bitter: "Bitterness is old pain asking to be acknowledged. You just did.",
  Betrayed: "The wound of betrayal is real. Naming it takes its power back.",
  Disrespected: "You know your worth. That's why disrespect stings — you know you deserve better.",
  Violated: "Your boundaries matter. Naming this is the first step to protecting them.",
  Lonely: "Loneliness means you're human, not broken. Connection is still possible.",
  Rejected: "Rejection hurts because belonging matters. One 'no' doesn't define your worth.",
  Empty: "Emptiness is the space before something new arrives. You're not broken — you're between.",
  Grief: "Grief is love with nowhere to go. It proves how deeply you can feel.",
  Helpless: "Feeling helpless is temporary. You just took an action by opening this app.",
  Disappointed: "Disappointment means you had hope. That hope is still in you.",
  Abandoned: "You showed up for yourself right now. That matters more than you know.",
  Worried: "Worry lives in the future. Right now, in this second, you're okay.",
  Overwhelmed: "Too much at once. You don't need to solve everything — just this moment.",
  Panicked: "Panic is your alarm system firing. It will pass. Breathe with it.",
  Restless: "Restless energy is looking for a direction. You're giving it one.",
  'On edge': "Your system is on alert. Naming it starts calming the alarm.",
  Dread: "Dread is fear of what hasn't happened yet. Right now, you're safe.",
  Insecure: "Insecurity is just uncertainty wearing a mask. You've handled uncertain before.",
  Vulnerable: "Vulnerability isn't weakness. It takes more courage than armor.",
  Threatened: "Your brain is protecting you. Thank it, then check — are you actually in danger?",
  'Out of control': "Naming this feeling IS taking back control. You just proved it.",
  Powerless: "You just made a choice to look inward. That's power.",
  Exposed: "Feeling exposed is uncomfortable but honest. Honesty is strength.",
  Unsafe: "Your body is telling you something important. Listen, then choose your next step.",
  Guilty: "Guilt means you have values. You wouldn't feel it if you didn't care.",
  Embarrassed: "Everyone has these moments. It feels permanent but it's not.",
  Worthless: "That's the feeling talking, not the truth. You showed up — that has worth.",
  'Disgusted with myself': "Self-disgust is harsh. You deserve the same compassion you'd give a friend.",
  Inadequate: "You're comparing yourself to an impossible standard. Where you are is enough for now.",
  Disconnected: "Noticing the disconnection is actually the first reconnection.",
  'Checked out': "Your mind needed a break. Coming here means you're coming back.",
  Flat: "Flatness is your system conserving energy. It won't last forever.",
  Hollow: "Hollowness is uncomfortable, but you're still here, still feeling it.",
  Frozen: "Freeze is protection. You can thaw slowly. No rush.",
  Detached: "Detachment kept you safe once. You're learning when to let it go.",
  'Shut down': "Shutting down is your body's circuit breaker. You're resetting right now.",
};

interface Props {
  onClose: () => void;
  onComplete?: (emotion: string) => void;
}

export default function NameTheFeeling({ onClose, onComplete }: Props) {
  const [step, setStep] = useState<'category' | 'specific' | 'result'>('category');
  const [selectedCategory, setSelectedCategory] = useState<EmotionCategory | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const handleCategorySelect = (cat: EmotionCategory) => {
    setSelectedCategory(cat);
    setStep('specific');
    haptics.light();
    sounds.step();
  };

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    setStep('result');
    haptics.medium();
    sounds.save();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <button
          onClick={() => {
            if (step === 'specific') { setStep('category'); setSelectedCategory(null); }
            else if (step === 'result') { setStep('specific'); setSelectedEmotion(null); }
            else onClose();
          }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {step === 'category' ? 'Close' : '← Back'}
        </button>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-8 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 'category' && (
            <motion.div key="cat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-2xl font-serif font-bold mb-2">Name the Feeling</h2>
              <p className="text-sm text-muted-foreground mb-2">
                "I feel bad" is where we start. Let's get more specific.
              </p>
              <p className="text-xs text-muted-foreground/70 mb-8 italic">
                Research shows that naming emotions reduces their intensity.
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                What's closest?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {EMOTION_WHEEL.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} border shadow-[var(--shadow-card)] active:scale-[0.97] transition-all text-left`}
                  >
                    <span className="text-2xl mb-2 block">{cat.emoji}</span>
                    <span className="font-semibold text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'specific' && selectedCategory && (
            <motion.div key="spec" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedCategory.emoji}</span>
                <h2 className="text-xl font-serif font-bold">More specifically...</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Which of these resonates most?
              </p>
              <div className="space-y-2">
                {selectedCategory.emotions.map((emotion, i) => (
                  <motion.button
                    key={emotion}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleEmotionSelect(emotion)}
                    className="w-full p-4 rounded-xl bg-card border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] active:scale-[0.98] transition-all flex items-center justify-between"
                  >
                    <span className="font-medium text-sm">{emotion}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'result' && selectedEmotion && selectedCategory && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground mb-3"
              >
                You're feeling
              </motion.p>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-serif font-bold text-foreground mb-2"
              >
                {selectedEmotion}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground mb-8"
              >
                {selectedCategory.emoji} {selectedCategory.label}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mb-8 max-w-sm"
              >
                <p className="text-sm text-foreground leading-relaxed italic">
                  {RELIEF_MESSAGES[selectedEmotion] || "Naming it is the first step. You're already making progress."}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-xs text-muted-foreground/70 mb-8"
              >
                Labeling an emotion activates the prefrontal cortex and calms the amygdala. You just did that.
              </motion.p>

              <div className="flex gap-3">
                <button
                  onClick={() => { onComplete?.(selectedEmotion); onClose(); }}
                  className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
