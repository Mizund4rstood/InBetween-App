import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, RotateCcw, X, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { fireStars } from "@/lib/confetti";

interface TransitionData {
  transition: string;
  feelings: string[];
  support: string;
}

const transitionConfig: Record<string, {
  emoji: string;
  label: string;
  message: string;
  tools: { label: string; path: string; desc: string }[];
}> = {
  divorce: {
    emoji: "💔",
    label: "Healing after heartbreak",
    message: "Breakups rewire your nervous system. These tools help you find steady ground.",
    tools: [
      { label: "Ground yourself", path: "/grounding", desc: "When emotions flood in" },
      { label: "Name it", path: "#name-feeling", desc: "Label the emotion" },
      { label: "Why Vault", path: "/why-vault", desc: "Remember why you're growing" },
    ],
  },
  career: {
    emoji: "💼",
    label: "Rebuilding your story",
    message: "Your identity is bigger than a job title. Start with what you can control today.",
    tools: [
      { label: "Set an anchor", path: "#daily-anchor", desc: "One intention for today" },
      { label: "Reflect", path: "/reflect", desc: "What's actually true right now" },
      { label: "Compass", path: "/compass", desc: "Track what drives your choices" },
    ],
  },
  grief: {
    emoji: "🕊️",
    label: "Holding what's heavy",
    message: "Grief comes in waves. These tools meet you wherever you are today.",
    tools: [
      { label: "60s Reset", path: "#reset", desc: "When it hits suddenly" },
      { label: "Ground yourself", path: "/grounding", desc: "Come back to your body" },
      { label: "Gratitude Wall", path: "/gratitude", desc: "Hold onto what's good" },
    ],
  },
  relocation: {
    emoji: "🧳",
    label: "Finding your footing",
    message: "New places are disorienting. Build small routines to anchor yourself.",
    tools: [
      { label: "Set an anchor", path: "#daily-anchor", desc: "Create a new rhythm" },
      { label: "Check in", path: "#express", desc: "How are you actually doing" },
      { label: "Restlessness", path: "/restlessness", desc: "When you can't sit still" },
    ],
  },
  health: {
    emoji: "🩺",
    label: "Adapting with courage",
    message: "A diagnosis changes the plan — not your capacity. One day at a time.",
    tools: [
      { label: "Ground yourself", path: "/grounding", desc: "When fear takes over" },
      { label: "Why Vault", path: "/why-vault", desc: "What keeps you going" },
      { label: "60s Reset", path: "#reset", desc: "Quick calm in hard moments" },
    ],
  },
  identity: {
    emoji: "🌱",
    label: "Becoming, slowly",
    message: "You're between versions of yourself. That's not lost — that's growing.",
    tools: [
      { label: "Reflect", path: "/reflect", desc: "Who am I becoming?" },
      { label: "Compass", path: "/compass", desc: "Track values-aligned choices" },
      { label: "Name it", path: "#name-feeling", desc: "What am I actually feeling" },
    ],
  },
  sobriety: {
    emoji: "🌊",
    label: "One day, fully present",
    message: "Recovery is daily. These tools help you pause before the impulse wins.",
    tools: [
      { label: "Pause Flow", path: "/pause", desc: "The moment between urge & action" },
      { label: "60s Reset", path: "#reset", desc: "Interrupt the pattern" },
      { label: "Why Vault", path: "/why-vault", desc: "Remember your reasons" },
    ],
  },
};

const feelingLabels: Record<string, { emoji: string; label: string }> = {
  lost: { emoji: "🌫️", label: "Lost" },
  anxious: { emoji: "⚡", label: "Anxious" },
  numb: { emoji: "🧊", label: "Numb" },
  angry: { emoji: "🔥", label: "Angry" },
  hopeful: { emoji: "🌤️", label: "Hopeful" },
  exhausted: { emoji: "🌑", label: "Exhausted" },
};

interface Props {
  onShowReset?: () => void;
  onShowNameFeeling?: () => void;
  onShowExpress?: () => void;
}

const transitions = [
  { id: "divorce", emoji: "💔", label: "Divorce / Breakup" },
  { id: "career", emoji: "💼", label: "Job Loss / Career Change" },
  { id: "grief", emoji: "🕊️", label: "Grief / Loss" },
  { id: "relocation", emoji: "🧳", label: "Relocation / New City" },
  { id: "health", emoji: "🩺", label: "Health Diagnosis" },
  { id: "identity", emoji: "🌱", label: "Identity Shift" },
  { id: "sobriety", emoji: "🌊", label: "Sobriety" },
];

const feelingOptions = [
  { id: "lost", label: "Lost", emoji: "🌫️" },
  { id: "anxious", label: "Anxious", emoji: "⚡" },
  { id: "numb", label: "Numb", emoji: "🧊" },
  { id: "angry", label: "Angry", emoji: "🔥" },
  { id: "hopeful", label: "Hopeful", emoji: "🌤️" },
  { id: "exhausted", label: "Exhausted", emoji: "🌑" },
];

const supportOptions = [
  { id: "grounding", label: "Grounding exercises" },
  { id: "journaling", label: "Guided journaling" },
  { id: "community", label: "Knowing I'm not alone" },
  { id: "tools", label: "Practical tools" },
];

export default function TransitionBanner({ onShowReset, onShowNameFeeling, onShowExpress }: Props) {
  const navigate = useNavigate();
  const [data, setData] = useState<TransitionData | null>(null);
  const [retaking, setRetaking] = useState(false);
  const [retakeStep, setRetakeStep] = useState(0); // 0=transition, 1=feelings, 2=support
  const [draft, setDraft] = useState<{ transition: string | null; feelings: string[]; support: string | null }>({ transition: null, feelings: [], support: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase
        .from("community_quiz_answers")
        .select("transition, feelings, support")
        .eq("user_id", user.id)
        .maybeSingle();
      if (row) setData({ transition: row.transition, feelings: row.feelings as string[], support: row.support });
    };
    load();
  }, []);

  if (!data && !retaking) return null;

  const config = data ? transitionConfig[data.transition] : null;

  const handleToolClick = (path: string) => {
    if (path === "#reset") { onShowReset?.(); return; }
    if (path === "#name-feeling") { onShowNameFeeling?.(); return; }
    if (path === "#express") { onShowExpress?.(); return; }
    if (path === "#daily-anchor") { return; }
    navigate(path);
  };

  const startRetake = () => {
    setDraft({ transition: data?.transition ?? null, feelings: data?.feelings ?? [], support: data?.support ?? null });
    setRetakeStep(0);
    setRetaking(true);
  };

  const cancelRetake = () => {
    setRetaking(false);
    setRetakeStep(0);
  };

  const toggleFeeling = (id: string) => {
    setDraft(prev => ({
      ...prev,
      feelings: prev.feelings.includes(id) ? prev.feelings.filter(f => f !== id) : [...prev.feelings, id],
    }));
  };

  const canAdvance = retakeStep === 0 ? !!draft.transition : retakeStep === 1 ? draft.feelings.length > 0 : !!draft.support;

  const saveRetake = async () => {
    if (!draft.transition || !draft.support) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = { user_id: user.id, transition: draft.transition, feelings: draft.feelings, support: draft.support, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("community_quiz_answers").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) { toast.error("Couldn't save — try again"); return; }
    setData({ transition: draft.transition, feelings: draft.feelings, support: draft.support });
    setRetaking(false);
    fireStars();
    toast.success("Updated your situation ✓");
  };

  const handleNext = () => {
    if (retakeStep < 2) setRetakeStep(s => s + 1);
    else saveRetake();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="mb-6 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/8 via-card to-primary/5 overflow-hidden shadow-[var(--shadow-card)]"
    >
      <AnimatePresence mode="wait">
        {retaking ? (
          <motion.div
            key="retake"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {/* Retake header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[2px] font-sans font-semibold">
                {retakeStep === 0 ? "What are you going through?" : retakeStep === 1 ? "How are you feeling?" : "What would help most?"}
              </p>
              <button onClick={cancelRetake} className="p-1 rounded-lg hover:bg-muted/50 transition-colors">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Step 0: Transition */}
            {retakeStep === 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {transitions.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDraft(prev => ({ ...prev, transition: t.id }))}
                    className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                      draft.transition === t.id
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border/30 hover:border-accent/30 text-muted-foreground"
                    }`}
                  >
                    <span className="mr-1.5">{t.emoji}</span>{t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Feelings */}
            {retakeStep === 1 && (
              <div className="flex flex-wrap gap-1.5">
                {feelingOptions.map(f => (
                  <button
                    key={f.id}
                    onClick={() => toggleFeeling(f.id)}
                    className={`px-3 py-1.5 rounded-full border transition-all text-xs ${
                      draft.feelings.includes(f.id)
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border/30 hover:border-accent/30 text-muted-foreground"
                    }`}
                  >
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Support */}
            {retakeStep === 2 && (
              <div className="space-y-1.5">
                {supportOptions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setDraft(prev => ({ ...prev, support: s.id }))}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                      draft.support === s.id
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border/30 hover:border-accent/30 text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
              <button
                onClick={() => retakeStep > 0 ? setRetakeStep(s => s - 1) : cancelRetake()}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-sans"
              >
                <ChevronLeft className="w-3 h-3" />
                {retakeStep > 0 ? "Back" : "Cancel"}
              </button>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === retakeStep ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={!canAdvance || saving}
                className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:text-accent/80 transition-colors font-sans disabled:opacity-40"
              >
                {retakeStep === 2 ? (saving ? "Saving…" : "Save") : "Next"}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ) : config ? (
          <motion.div
            key="display"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl">{config.emoji}</span>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[2px] font-sans">Your journey</p>
                  <h3 className="text-sm font-bold text-foreground">{config.label}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">{config.message}</p>

              {data!.feelings.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {data!.feelings.map(id => {
                    const f = feelingLabels[id];
                    return f ? (
                      <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium font-sans">
                        {f.emoji} {f.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Recommended tools */}
            <div className="border-t border-border/30 bg-card/50 px-4 py-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-[2px] mb-2.5 font-sans font-semibold">Recommended for you</p>
              <div className="space-y-1.5">
                {config.tools.map(tool => (
                  <button
                    key={tool.label}
                    onClick={() => handleToolClick(tool.path)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/5 active:scale-[0.98] transition-all group text-left"
                  >
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-foreground">{tool.label}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{tool.desc}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Retake button */}
            <div className="px-4 py-2 border-t border-border/20">
              <button
                onClick={startRetake}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-sans"
              >
                <RotateCcw className="w-3 h-3" />
                Update your situation
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
